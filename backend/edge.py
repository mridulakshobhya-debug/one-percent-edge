from __future__ import annotations

import math
import statistics
from collections import deque
from dataclasses import dataclass, field
from typing import Deque, Dict, List, Tuple


def _safe_mean(values: List[float]) -> float:
    if not values:
        return 0.0
    return statistics.fmean(values)


def _safe_std(values: List[float]) -> float:
    if len(values) < 2:
        return 0.0
    return statistics.pstdev(values)


def _zscore(series: Deque[float], value: float, min_len: int = 25) -> float:
    if len(series) < min_len:
        return 0.0
    values = list(series)
    mu = _safe_mean(values)
    sigma = _safe_std(values)
    if sigma <= 1e-9:
        return 0.0
    return (value - mu) / sigma


def _clip(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


@dataclass
class SymbolBuffers:
    prices: Deque[float] = field(default_factory=lambda: deque(maxlen=720))
    volumes: Deque[float] = field(default_factory=lambda: deque(maxlen=720))
    returns: Deque[float] = field(default_factory=lambda: deque(maxlen=720))
    spreads: Deque[float] = field(default_factory=lambda: deque(maxlen=720))
    imbalances: Deque[float] = field(default_factory=lambda: deque(maxlen=720))
    micro_pressure: Deque[float] = field(default_factory=lambda: deque(maxlen=720))


class EdgeDetector:
    def __init__(self, symbols: List[str]) -> None:
        self.buffers: Dict[str, SymbolBuffers] = {symbol: SymbolBuffers() for symbol in symbols}
        self.default_thresholds = {
            "volume_spike_z": 2.2,
            "momentum_bps": 18.0,
            "liquidity_gap_z": 1.3,
            "vol_cluster_min": 0.15,
            "fake_breakout_min_z": 1.0,
            "microstructure_min": 0.28,
        }

    def _volatility_cluster(self, returns: Deque[float]) -> float:
        if len(returns) < 60:
            return 0.0
        squared = [r * r for r in returns]
        short = _safe_mean(squared[-20:])
        long = _safe_mean(squared)
        if long <= 1e-9:
            return 0.0
        abs_rets = [abs(r) for r in returns]
        persistence_terms: List[float] = []
        for i in range(1, len(abs_rets)):
            persistence_terms.append(abs_rets[i] * abs_rets[i - 1])
        persistence = _safe_mean(persistence_terms) / (max(_safe_mean(abs_rets), 1e-9) ** 2)
        clustering = ((short / long) - 1.0) + ((persistence - 1.0) * 0.35)
        return _clip(clustering, -1.0, 3.0)

    def _momentum_metrics(self, prices: Deque[float]) -> Tuple[float, float]:
        if len(prices) < 24:
            return 0.0, 0.0
        current = prices[-1]
        fast = (current / prices[-6]) - 1.0
        slow = (current / prices[-18]) - 1.0
        accel = fast - slow
        return fast, accel

    def _fake_breakout_score(
        self,
        prices: Deque[float],
        volume_z: float,
        spread_z: float,
        imbalance: float,
    ) -> float:
        if len(prices) < 45:
            return 0.0
        p = prices[-1]
        lookback = list(prices)[-35:-1]
        if not lookback:
            return 0.0
        high = max(lookback)
        low = min(lookback)
        broke_up = p >= high * 1.0007
        broke_down = p <= low * 0.9993
        weak_confirm = volume_z < 0.6 and abs(imbalance) < 0.2
        stressed_book = spread_z > 0.8
        if (broke_up or broke_down) and weak_confirm and stressed_book:
            return _clip(0.3 + (0.25 * max(0.0, spread_z)) + (0.2 * max(0.0, 0.7 - volume_z)), 0.0, 1.0)
        return 0.0

    def _explain(
        self,
        symbol: str,
        signal_type: str,
        score: float,
        confidence: float,
        reasons: List[str],
        features: Dict[str, float],
    ) -> str:
        primary_reason = reasons[0] if reasons else "Mixed microstructure setup without a dominant catalyst."
        return (
            f"{symbol} edge={score:.1f}/100 ({signal_type}, confidence {confidence:.1f}%). "
            f"{primary_reason} "
            f"Volume z={features['volume_z']:.2f}, spread z={features['spread_z']:.2f}, "
            f"vol-cluster={features['vol_cluster']:.2f}, imbalance={features['imbalance']:.2f}."
        )

    def update(
        self,
        tick: Dict[str, float | int | str],
        orderbook_context: Dict[str, float],
        adaptive_thresholds: Dict[str, float] | None = None,
    ) -> Dict[str, float | str | List[str] | Dict[str, float]]:
        symbol = str(tick["symbol"])
        price = float(tick["price"])
        volume = float(tick["volume"])
        bid = float(tick["bid"])
        ask = float(tick["ask"])
        imbalance = float(tick["order_imbalance"])
        ts = int(tick["timestamp"])
        spread = max(0.0, ask - bid)

        buf = self.buffers[symbol]
        prev_price = buf.prices[-1] if buf.prices else price
        ret = 0.0 if prev_price <= 0 else (price / prev_price) - 1.0
        micro_pressure = (imbalance * 0.7) + (ret * 300.0) - (spread / max(price, 1.0) * 120.0)

        buf.prices.append(price)
        buf.volumes.append(volume)
        buf.returns.append(ret)
        buf.spreads.append(spread)
        buf.imbalances.append(imbalance)
        buf.micro_pressure.append(micro_pressure)

        thresholds = dict(self.default_thresholds)
        if adaptive_thresholds:
            thresholds.update(adaptive_thresholds)

        volume_z = _zscore(buf.volumes, volume)
        spread_z = _zscore(buf.spreads, spread)
        imbalance_z = _zscore(buf.imbalances, imbalance)
        micro_z = _zscore(buf.micro_pressure, micro_pressure)

        vol_cluster = self._volatility_cluster(buf.returns)
        mom_fast, mom_accel = self._momentum_metrics(buf.prices)
        momentum_bps = mom_fast * 10000.0

        bid_depth = max(1.0, orderbook_context.get("bid_depth", 1.0))
        ask_depth = max(1.0, orderbook_context.get("ask_depth", 1.0))
        depth_total = bid_depth + ask_depth
        depth_skew = (bid_depth - ask_depth) / depth_total
        thin_book = 1.0 - _clip(depth_total / max(orderbook_context.get("normal_depth", 1.0), 1.0), 0.0, 1.0)
        liquidity_gap_signal = _clip((max(0.0, spread_z) * 0.55) + (max(0.0, thin_book) * 0.45), 0.0, 1.0)

        fake_breakout = self._fake_breakout_score(buf.prices, volume_z, spread_z, imbalance)
        volume_spike = _clip((volume_z - thresholds["volume_spike_z"]) / 3.0, 0.0, 1.0)
        momentum_signal = _clip((abs(momentum_bps) - thresholds["momentum_bps"]) / 40.0, 0.0, 1.0)
        microstructure_signal = _clip((abs(micro_pressure) - thresholds["microstructure_min"]) / 1.4, 0.0, 1.0)
        clustering_signal = _clip((vol_cluster - thresholds["vol_cluster_min"]) / 1.1, 0.0, 1.0)

        score_raw = (
            (volume_spike * 0.24)
            + (momentum_signal * 0.24)
            + (liquidity_gap_signal * 0.16)
            + (microstructure_signal * 0.18)
            + (clustering_signal * 0.18)
        )
        if fake_breakout > thresholds["fake_breakout_min_z"] * 0.4:
            score_raw = (score_raw * 0.8) + (fake_breakout * 0.3)

        edge_score = _clip(score_raw * 100.0, 0.0, 100.0)
        confidence = _clip(
            42.0 + (edge_score * 0.47) + (min(len(buf.prices), 250) / 250.0 * 14.0) - (fake_breakout * 10.0),
            5.0,
            99.0,
        )

        reasons: List[str] = []
        signal_type = "NEUTRAL"
        dominant = {
            "VOLUME_SPIKE": volume_spike,
            "MOMENTUM_BURST": momentum_signal,
            "LIQUIDITY_GAP": liquidity_gap_signal,
            "FAKE_BREAKOUT": fake_breakout,
            "MICROSTRUCTURE": microstructure_signal,
        }
        top_signal = max(dominant, key=dominant.get)
        if dominant[top_signal] > 0.2:
            signal_type = top_signal

        if volume_z > thresholds["volume_spike_z"]:
            reasons.append(f"Volume expansion is extreme with z-score {volume_z:.2f}, indicating participation shock.")
        if abs(momentum_bps) > thresholds["momentum_bps"]:
            direction = "upside" if momentum_bps > 0 else "downside"
            reasons.append(
                f"Momentum burst is tilted to {direction} ({momentum_bps:.1f} bps on short horizon) with acceleration {mom_accel:.4f}."
            )
        if liquidity_gap_signal > 0.25:
            reasons.append(
                f"Order-book liquidity is fragile: spread z-score {spread_z:.2f}, depth skew {depth_skew:.2f}, thin-book factor {thin_book:.2f}."
            )
        if vol_cluster > thresholds["vol_cluster_min"]:
            reasons.append(f"Volatility clustering ({vol_cluster:.2f}) suggests regime persistence and serial shock risk.")
        if fake_breakout > 0.35:
            reasons.append("Breakout structure looks fragile with poor volume confirmation and stressed spread, increasing trap probability.")
        if abs(micro_pressure) > thresholds["microstructure_min"]:
            aggressor = "buyers" if micro_pressure > 0 else "sellers"
            reasons.append(
                f"Microstructure pressure favors {aggressor}: pressure {micro_pressure:.2f}, imbalance z-score {imbalance_z:.2f}, micro z-score {micro_z:.2f}."
            )
        if not reasons:
            reasons.append("No dominant edge catalyst; signal quality remains below active-trade threshold.")

        features = {
            "price": round(price, 2),
            "ret": round(ret, 6),
            "volume_z": round(volume_z, 4),
            "spread_z": round(spread_z, 4),
            "imbalance": round(imbalance, 4),
            "imbalance_z": round(imbalance_z, 4),
            "micro_pressure": round(micro_pressure, 4),
            "micro_z": round(micro_z, 4),
            "vol_cluster": round(vol_cluster, 4),
            "momentum_bps": round(momentum_bps, 3),
            "momentum_accel": round(mom_accel, 6),
            "liquidity_gap_signal": round(liquidity_gap_signal, 4),
            "fake_breakout_signal": round(fake_breakout, 4),
            "depth_skew": round(depth_skew, 4),
            "thin_book": round(thin_book, 4),
        }

        explanation = self._explain(symbol, signal_type, edge_score, confidence, reasons, features)
        return {
            "symbol": symbol,
            "timestamp": ts,
            "edge_score": round(edge_score, 2),
            "confidence": round(confidence, 2),
            "signal_type": signal_type,
            "explanation": explanation,
            "reasons": reasons,
            "features": features,
            "thresholds": thresholds,
        }
