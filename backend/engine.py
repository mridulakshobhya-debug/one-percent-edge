from __future__ import annotations

import asyncio
import copy
import math
import random
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any, Callable, Deque, Dict, List, Optional

from backend.edge import EdgeDetector
from data.generator import MarketDataGenerator


class EventBus:
    def __init__(self) -> None:
        self._subscribers: Dict[str, set[asyncio.Queue]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def subscribe(self, topic: str, maxsize: int = 3000) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue(maxsize=maxsize)
        async with self._lock:
            self._subscribers[topic].add(queue)
        return queue

    async def unsubscribe(self, topic: str, queue: asyncio.Queue) -> None:
        async with self._lock:
            queues = self._subscribers.get(topic)
            if not queues:
                return
            queues.discard(queue)
            if not queues:
                self._subscribers.pop(topic, None)

    async def publish(self, topic: str, event: Dict[str, Any], on_drop: Optional[Callable[[], None]] = None) -> None:
        async with self._lock:
            targets = list(self._subscribers.get(topic, []))
        for queue in targets:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                if on_drop:
                    on_drop()
                try:
                    _ = queue.get_nowait()
                    queue.put_nowait(event)
                except Exception:
                    continue


@dataclass
class OHLCBucket:
    start: int
    open: float
    high: float
    low: float
    close: float
    volume: int

    def as_dict(self) -> Dict[str, Any]:
        return {
            "start": self.start,
            "open": round(self.open, 2),
            "high": round(self.high, 2),
            "low": round(self.low, 2),
            "close": round(self.close, 2),
            "volume": int(self.volume),
        }


class OHLCRolling:
    def __init__(self, timeframe_ms: int, max_bars: int = 600) -> None:
        self.timeframe_ms = timeframe_ms
        self.max_bars = max_bars
        self.current: Optional[OHLCBucket] = None
        self.history: Deque[OHLCBucket] = deque(maxlen=max_bars)

    def update(self, ts_ms: int, price: float, volume: int) -> None:
        bucket_start = ts_ms - (ts_ms % self.timeframe_ms)
        if self.current is None or self.current.start != bucket_start:
            if self.current is not None:
                self.history.append(self.current)
            self.current = OHLCBucket(
                start=bucket_start,
                open=price,
                high=price,
                low=price,
                close=price,
                volume=volume,
            )
            return
        self.current.high = max(self.current.high, price)
        self.current.low = min(self.current.low, price)
        self.current.close = price
        self.current.volume += volume

    def snapshot(self, count: int = 120) -> List[Dict[str, Any]]:
        bars = list(self.history)[-count:]
        payload = [bar.as_dict() for bar in bars]
        if self.current is not None:
            payload.append(self.current.as_dict())
        return payload


class OrderBook:
    def __init__(self, symbol: str, rng: random.Random, levels: int = 12) -> None:
        self.symbol = symbol
        self.levels = levels
        self.rng = rng
        self.bids: List[Dict[str, float | int]] = []
        self.asks: List[Dict[str, float | int]] = []
        self.last_update_ms = 0
        self.normal_depth = 25000.0
        self.depth_window: Deque[float] = deque(maxlen=200)

    def update_from_tick(self, tick: Dict[str, Any]) -> None:
        bid = float(tick["bid"])
        ask = float(tick["ask"])
        bid_qty = max(1, int(tick["bid_qty"]))
        ask_qty = max(1, int(tick["ask_qty"]))
        volume = max(1, int(tick["volume"]))
        imbalance = float(tick["order_imbalance"])
        self.last_update_ms = int(tick["timestamp"])
        spread = max(0.01, ask - bid)
        step = max(0.01, spread * 0.75)

        bids: List[Dict[str, float | int]] = []
        asks: List[Dict[str, float | int]] = []
        for level in range(self.levels):
            decay = math.exp(-level / 4.2)
            price_noise = self.rng.uniform(0.94, 1.08)
            bid_price = round(max(0.01, bid - (level * step * price_noise)), 2)
            ask_price = round(max(bid_price + 0.01, ask + (level * step * price_noise)), 2)

            bid_scale = 1.0 + (imbalance * 0.35)
            ask_scale = 1.0 - (imbalance * 0.35)
            qty_noise = self.rng.uniform(0.62, 1.45)
            bid_level_qty = int(max(1, bid_qty * decay * qty_noise * bid_scale))
            ask_level_qty = int(max(1, ask_qty * decay * qty_noise * ask_scale))
            bids.append({"price": bid_price, "qty": bid_level_qty})
            asks.append({"price": ask_price, "qty": ask_level_qty})

        if self.rng.random() < 0.045:
            idx = self.rng.randint(2, min(self.levels - 1, 6))
            bids[idx]["qty"] = max(1, int(bids[idx]["qty"] * self.rng.uniform(0.05, 0.18)))
        if self.rng.random() < 0.045:
            idx = self.rng.randint(2, min(self.levels - 1, 6))
            asks[idx]["qty"] = max(1, int(asks[idx]["qty"] * self.rng.uniform(0.05, 0.18)))

        self.bids = bids
        self.asks = asks
        top_depth = self.depth_metrics()["bid_depth"] + self.depth_metrics()["ask_depth"]
        depth_update = max(100.0, top_depth + (volume * 0.2))
        self.depth_window.append(depth_update)
        self.normal_depth = (self.normal_depth * 0.93) + (depth_update * 0.07)

    def depth_metrics(self, levels: int = 5) -> Dict[str, float]:
        bid_depth = float(sum(int(level["qty"]) for level in self.bids[:levels]))
        ask_depth = float(sum(int(level["qty"]) for level in self.asks[:levels]))
        total = max(1.0, bid_depth + ask_depth)
        return {
            "bid_depth": bid_depth,
            "ask_depth": ask_depth,
            "depth_imbalance": (bid_depth - ask_depth) / total,
            "normal_depth": max(1.0, self.normal_depth),
        }

    def snapshot(self) -> Dict[str, Any]:
        metrics = self.depth_metrics()
        return {
            "symbol": self.symbol,
            "timestamp": self.last_update_ms,
            "bids": copy.deepcopy(self.bids),
            "asks": copy.deepcopy(self.asks),
            "depth_imbalance": round(metrics["depth_imbalance"], 4),
            "bid_depth": int(metrics["bid_depth"]),
            "ask_depth": int(metrics["ask_depth"]),
            "normal_depth": round(metrics["normal_depth"], 2),
        }


@dataclass
class SymbolState:
    symbol: str
    orderbook: OrderBook
    ohlc_1s: OHLCRolling = field(default_factory=lambda: OHLCRolling(1000))
    ohlc_1m: OHLCRolling = field(default_factory=lambda: OHLCRolling(60000))
    ohlc_5m: OHLCRolling = field(default_factory=lambda: OHLCRolling(300000))
    last_tick: Dict[str, Any] = field(default_factory=dict)
    last_edge: Dict[str, Any] = field(default_factory=dict)
    total_volume: int = 0


class MarketEngine:
    def __init__(self, tick_interval_ms: int = 100) -> None:
        self.tick_interval_ms = tick_interval_ms
        self.generator = MarketDataGenerator()
        self.symbols = list(self.generator.symbols)
        self.edge_detector = EdgeDetector(self.symbols)
        self.event_bus = EventBus()
        self.random = random.Random(time.time_ns())
        self.lock = asyncio.Lock()
        self.running = False
        self.tasks: List[asyncio.Task] = []
        self.started_ms = int(time.time() * 1000)

        self.adaptive_thresholds = dict(self.edge_detector.default_thresholds)
        self.pending_signals: Deque[Dict[str, Any]] = deque(maxlen=5000)
        self.signal_outcomes: Deque[bool] = deque(maxlen=500)
        self.latency_window: Deque[float] = deque(maxlen=5000)
        self.last_tick_counter_reset = time.time()
        self.ticks_this_window = 0
        self.market_mode = "OPEN"
        self.chaos_factor = 1.0
        self.halted_symbols: set[str] = set()
        self.admin_events: Deque[Dict[str, Any]] = deque(maxlen=600)

        self.metrics: Dict[str, Any] = {
            "ticks_processed": 0,
            "ticks_per_sec": 0.0,
            "dropped_packets": 0,
            "api_failures": 0,
            "stream_clients": 0,
            "inconsistent_packets": 0,
            "mean_latency_ms": 0.0,
            "p99_latency_ms": 0.0,
            "frame_jitter_ms": 0.0,
            "false_signal_rate": 0.0,
            "adaptive_round": 0,
            "api_health": "green",
            "last_heartbeat": int(time.time() * 1000),
        }

        self.states: Dict[str, SymbolState] = {}
        for symbol in self.symbols:
            self.states[symbol] = SymbolState(symbol=symbol, orderbook=OrderBook(symbol, self.random))
        self._record_admin_event("SYSTEM", "Engine boot complete", {"symbols": len(self.symbols)})

    async def start(self) -> None:
        if self.running:
            return
        self.running = True
        self.tasks = [
            asyncio.create_task(self._tick_loop(), name="market-tick-loop"),
            asyncio.create_task(self._heartbeat_loop(), name="market-heartbeat-loop"),
            asyncio.create_task(self._self_evolution_loop(), name="market-self-evolution-loop"),
        ]

    async def stop(self) -> None:
        if not self.running:
            return
        self.running = False
        for task in self.tasks:
            task.cancel()
        await asyncio.gather(*self.tasks, return_exceptions=True)
        self.tasks.clear()

    def _record_drop(self) -> None:
        self.metrics["dropped_packets"] += 1

    def _record_admin_event(self, category: str, message: str, detail: Optional[Dict[str, Any]] = None) -> None:
        self.admin_events.append(
            {
                "timestamp": int(time.time() * 1000),
                "category": category,
                "message": message,
                "detail": detail or {},
            }
        )

    def _chaos_probability(self, base: float) -> float:
        return max(0.0, min(0.95, base * max(0.15, self.chaos_factor)))

    def _chaos_delay(self, low: float, high: float) -> float:
        factor = max(0.2, self.chaos_factor)
        return self.random.uniform(low * factor, high * factor)

    def _inject_inconsistent_tick(self, tick: Dict[str, Any]) -> Dict[str, Any]:
        out = dict(tick)
        if self.random.random() < self._chaos_probability(0.014):
            self.metrics["inconsistent_packets"] += 1
            mode = self.random.choice(["crossed_book", "volume_spike", "stale_ts"])
            if mode == "crossed_book":
                out["bid"] = round(float(out["ask"]) + self.random.uniform(0.03, 0.6), 2)
            elif mode == "volume_spike":
                out["volume"] = max(1, int(float(out["volume"]) * self.random.uniform(4.0, 11.0)))
            else:
                out["timestamp"] = int(out["timestamp"]) - self.random.randint(100, 1800)
        return out

    def _normalize_tick(self, tick: Dict[str, Any]) -> tuple[Dict[str, Any], Optional[str]]:
        out = dict(tick)
        anomaly = None
        bid = float(out["bid"])
        ask = float(out["ask"])
        price = float(out["price"])
        if bid >= ask:
            mid = max(0.01, price)
            spread = max(0.02, abs(ask - bid) + self.random.uniform(0.01, 0.2))
            out["bid"] = round(max(0.01, mid - spread / 2.0), 2)
            out["ask"] = round(max(mid + spread / 2.0, float(out["bid"]) + 0.01), 2)
            anomaly = "crossed_book_corrected"

        if int(out["volume"]) <= 0:
            out["volume"] = 1
            anomaly = anomaly or "invalid_volume_corrected"

        now_ms = int(time.time() * 1000)
        if int(out["timestamp"]) > now_ms + 5000 or int(out["timestamp"]) < now_ms - 15000:
            out["timestamp"] = now_ms
            anomaly = anomaly or "stale_timestamp_corrected"
        return out, anomaly

    def _update_latency_metrics(self, tick_ts: int) -> None:
        now_ms = int(time.time() * 1000)
        latency = max(0.0, now_ms - tick_ts)
        self.latency_window.append(latency)
        if self.latency_window:
            sorted_lat = sorted(self.latency_window)
            p99_idx = int((len(sorted_lat) - 1) * 0.99)
            self.metrics["mean_latency_ms"] = round(sum(sorted_lat) / len(sorted_lat), 2)
            self.metrics["p99_latency_ms"] = round(sorted_lat[p99_idx], 2)

    def _track_signal_outcomes(self, symbol: str, edge: Dict[str, Any], tick_price: float, ts_ms: int) -> None:
        signal_type = str(edge.get("signal_type", "NEUTRAL"))
        edge_score = float(edge.get("edge_score", 0.0))
        momentum = float(edge.get("features", {}).get("momentum_bps", 0.0))
        if signal_type == "NEUTRAL" or edge_score < 58.0:
            return

        direction = 1
        if momentum < -3:
            direction = -1
        elif abs(momentum) <= 3:
            imbalance = float(edge.get("features", {}).get("imbalance", 0.0))
            direction = 1 if imbalance >= 0 else -1

        self.pending_signals.append(
            {
                "symbol": symbol,
                "timestamp": ts_ms,
                "entry_price": tick_price,
                "direction": direction,
                "edge_score": edge_score,
            }
        )

    def _evaluate_matured_signals(self, now_ms: int) -> None:
        horizon_ms = 6000
        while self.pending_signals and (now_ms - int(self.pending_signals[0]["timestamp"])) >= horizon_ms:
            signal = self.pending_signals.popleft()
            symbol = str(signal["symbol"])
            state = self.states.get(symbol)
            if not state or not state.last_tick:
                continue
            latest_price = float(state.last_tick.get("price", signal["entry_price"]))
            entry_price = float(signal["entry_price"])
            if entry_price <= 0:
                continue
            pnl = ((latest_price / entry_price) - 1.0) * int(signal["direction"])
            win = pnl > 0.0009
            self.signal_outcomes.append(win)

        if self.signal_outcomes:
            false_count = len([x for x in self.signal_outcomes if not x])
            self.metrics["false_signal_rate"] = round(false_count / len(self.signal_outcomes), 4)

    def _tick_rate_update(self) -> None:
        now = time.time()
        elapsed = now - self.last_tick_counter_reset
        if elapsed >= 1.0:
            self.metrics["ticks_per_sec"] = round(self.ticks_this_window / elapsed, 2)
            self.ticks_this_window = 0
            self.last_tick_counter_reset = now

    async def _process_tick(self, tick: Dict[str, Any], anomaly: Optional[str]) -> Dict[str, Any]:
        symbol = str(tick["symbol"])
        state = self.states[symbol]
        price = float(tick["price"])
        volume = int(tick["volume"])
        ts_ms = int(tick["timestamp"])

        state.last_tick = tick
        state.total_volume += volume
        state.ohlc_1s.update(ts_ms, price, volume)
        state.ohlc_1m.update(ts_ms, price, volume)
        state.ohlc_5m.update(ts_ms, price, volume)
        state.orderbook.update_from_tick(tick)

        order_context = state.orderbook.depth_metrics()
        edge = self.edge_detector.update(tick, order_context, self.adaptive_thresholds)
        if anomaly:
            edge["reasons"] = [f"Data anomaly detected ({anomaly})."] + list(edge.get("reasons", []))
            edge["explanation"] = f"{edge['explanation']} Data anomaly flag: {anomaly}."
        state.last_edge = edge

        self._track_signal_outcomes(symbol, edge, price, ts_ms)
        self._evaluate_matured_signals(ts_ms)
        self._update_latency_metrics(ts_ms)
        self.metrics["ticks_processed"] += 1
        self.ticks_this_window += 1
        self._tick_rate_update()
        return edge

    async def _tick_loop(self) -> None:
        target_s = self.tick_interval_ms / 1000.0
        while self.running:
            frame_start = time.perf_counter()
            batch = self.generator.generate_batch()
            now_ms = int(time.time() * 1000)
            async with self.lock:
                current_mode = self.market_mode
                halted_snapshot = set(self.halted_symbols)

            if current_mode != "OPEN":
                await self.event_bus.publish(
                    "stream",
                    {"type": "market_mode", "timestamp": now_ms, "mode": current_mode},
                    on_drop=self._record_drop,
                )
                elapsed = time.perf_counter() - frame_start
                if elapsed > target_s:
                    self.metrics["frame_jitter_ms"] = round((elapsed - target_s) * 1000.0, 2)
                    await asyncio.sleep(0)
                else:
                    self.metrics["frame_jitter_ms"] = round(max(0.0, self.metrics["frame_jitter_ms"] * 0.85), 2)
                    await asyncio.sleep(target_s - elapsed)
                continue

            for raw in batch:
                raw_symbol = str(raw.get("symbol", ""))
                if raw_symbol in halted_snapshot:
                    continue
                inconsistent = self._inject_inconsistent_tick(raw)
                tick, anomaly = self._normalize_tick(inconsistent)
                if self.random.random() < self._chaos_probability(0.018):
                    self._record_drop()
                    continue

                if self.random.random() < self._chaos_probability(0.08):
                    await asyncio.sleep(self._chaos_delay(0.002, 0.045))

                async with self.lock:
                    if self.market_mode != "OPEN" or str(tick["symbol"]) in self.halted_symbols:
                        continue
                    edge = await self._process_tick(tick, anomaly)
                    payload = {
                        "type": "tick",
                        "symbol": tick["symbol"],
                        "timestamp": tick["timestamp"],
                        "price": tick["price"],
                        "volume": tick["volume"],
                        "bid": tick["bid"],
                        "ask": tick["ask"],
                        "order_imbalance": tick["order_imbalance"],
                        "edge_score": edge["edge_score"],
                        "confidence": edge["confidence"],
                        "signal_type": edge["signal_type"],
                        "anomaly": anomaly,
                    }

                await self.event_bus.publish("stream", payload, on_drop=self._record_drop)
                if anomaly:
                    await self.event_bus.publish(
                        "stream",
                        {
                            "type": "anomaly",
                            "timestamp": now_ms,
                            "symbol": tick["symbol"],
                            "reason": anomaly,
                        },
                        on_drop=self._record_drop,
                    )

            elapsed = time.perf_counter() - frame_start
            if elapsed > target_s:
                self.metrics["frame_jitter_ms"] = round((elapsed - target_s) * 1000.0, 2)
                await asyncio.sleep(0)
            else:
                self.metrics["frame_jitter_ms"] = round(max(0.0, self.metrics["frame_jitter_ms"] * 0.85), 2)
                await asyncio.sleep(target_s - elapsed)

    async def _heartbeat_loop(self) -> None:
        while self.running:
            await asyncio.sleep(1.0)
            async with self.lock:
                self.metrics["last_heartbeat"] = int(time.time() * 1000)
                err_pressure = self.metrics["api_failures"] + self.metrics["dropped_packets"]
                if err_pressure > 120:
                    self.metrics["api_health"] = "red"
                elif err_pressure > 35:
                    self.metrics["api_health"] = "amber"
                else:
                    self.metrics["api_health"] = "green"
                payload = {
                    "type": "heartbeat",
                    "timestamp": self.metrics["last_heartbeat"],
                    "metrics": copy.deepcopy(self.metrics),
                    "thresholds": copy.deepcopy(self.adaptive_thresholds),
                    "market_mode": self.market_mode,
                    "chaos_factor": round(self.chaos_factor, 2),
                    "halted_symbols": sorted(self.halted_symbols),
                }
            await self.event_bus.publish("stream", payload, on_drop=self._record_drop)

    async def _self_evolution_loop(self) -> None:
        while self.running:
            await asyncio.sleep(12.0)
            async with self.lock:
                false_rate = float(self.metrics["false_signal_rate"])
                if false_rate > 0.58:
                    self.adaptive_thresholds["volume_spike_z"] = min(4.2, self.adaptive_thresholds["volume_spike_z"] + 0.11)
                    self.adaptive_thresholds["momentum_bps"] = min(75.0, self.adaptive_thresholds["momentum_bps"] + 1.8)
                    self.adaptive_thresholds["microstructure_min"] = min(
                        0.9, self.adaptive_thresholds["microstructure_min"] + 0.03
                    )
                elif false_rate < 0.33:
                    self.adaptive_thresholds["volume_spike_z"] = max(1.4, self.adaptive_thresholds["volume_spike_z"] - 0.07)
                    self.adaptive_thresholds["momentum_bps"] = max(8.0, self.adaptive_thresholds["momentum_bps"] - 0.9)
                    self.adaptive_thresholds["microstructure_min"] = max(
                        0.12, self.adaptive_thresholds["microstructure_min"] - 0.02
                    )
                self.metrics["adaptive_round"] += 1
                payload = {
                    "type": "evolution",
                    "timestamp": int(time.time() * 1000),
                    "false_signal_rate": false_rate,
                    "adaptive_round": self.metrics["adaptive_round"],
                    "thresholds": copy.deepcopy(self.adaptive_thresholds),
                }
            await self.event_bus.publish("stream", payload, on_drop=self._record_drop)

    async def register_stream_client(self) -> None:
        async with self.lock:
            self.metrics["stream_clients"] += 1

    async def unregister_stream_client(self) -> None:
        async with self.lock:
            self.metrics["stream_clients"] = max(0, self.metrics["stream_clients"] - 1)

    async def record_api_failure(self) -> None:
        async with self.lock:
            self.metrics["api_failures"] += 1

    async def get_system_status(self) -> Dict[str, Any]:
        async with self.lock:
            return {
                "uptime_ms": int(time.time() * 1000) - self.started_ms,
                "metrics": copy.deepcopy(self.metrics),
                "thresholds": copy.deepcopy(self.adaptive_thresholds),
                "market_mode": self.market_mode,
                "chaos_factor": round(self.chaos_factor, 2),
                "halted_symbols": sorted(self.halted_symbols),
            }

    async def set_market_mode(self, mode: str) -> Dict[str, Any]:
        mode_clean = str(mode).upper()
        if mode_clean not in {"OPEN", "PAUSED", "CIRCUIT_BREAKER"}:
            raise ValueError("Invalid market mode")
        async with self.lock:
            self.market_mode = mode_clean
            self._record_admin_event("MARKET_MODE", f"Mode switched to {mode_clean}")
            payload = {
                "type": "market_mode",
                "timestamp": int(time.time() * 1000),
                "mode": mode_clean,
            }
        await self.event_bus.publish("stream", payload, on_drop=self._record_drop)
        return await self.get_admin_state()

    async def set_chaos_factor(self, factor: float) -> Dict[str, Any]:
        clean = max(0.1, min(3.0, float(factor)))
        async with self.lock:
            self.chaos_factor = clean
            self._record_admin_event("CHAOS", f"Chaos factor updated to {clean:.2f}")
        return await self.get_admin_state()

    async def set_symbol_halt(self, symbol: str, halted: bool) -> Dict[str, Any]:
        sym = str(symbol).upper().strip()
        if sym not in self.states:
            raise KeyError(f"Unknown symbol: {sym}")
        async with self.lock:
            if halted:
                self.halted_symbols.add(sym)
                self._record_admin_event("HALT", f"{sym} trading halted")
            else:
                self.halted_symbols.discard(sym)
                self._record_admin_event("HALT", f"{sym} trading resumed")
        return await self.get_admin_state()

    async def reset_runtime_metrics(self) -> Dict[str, Any]:
        async with self.lock:
            preserve_clients = int(self.metrics.get("stream_clients", 0))
            preserve_heartbeat = int(time.time() * 1000)
            self.metrics.update(
                {
                    "ticks_processed": 0,
                    "ticks_per_sec": 0.0,
                    "dropped_packets": 0,
                    "api_failures": 0,
                    "stream_clients": preserve_clients,
                    "inconsistent_packets": 0,
                    "mean_latency_ms": 0.0,
                    "p99_latency_ms": 0.0,
                    "frame_jitter_ms": 0.0,
                    "false_signal_rate": 0.0,
                    "adaptive_round": 0,
                    "api_health": "green",
                    "last_heartbeat": preserve_heartbeat,
                }
            )
            self.signal_outcomes.clear()
            self.pending_signals.clear()
            self.latency_window.clear()
            self._record_admin_event("SYSTEM", "Runtime metrics reset")
        return await self.get_admin_state()

    async def get_admin_events(self, limit: int = 120) -> List[Dict[str, Any]]:
        async with self.lock:
            return list(self.admin_events)[-max(1, min(400, int(limit))):]

    async def get_admin_state(self) -> Dict[str, Any]:
        async with self.lock:
            return {
                "timestamp": int(time.time() * 1000),
                "market_mode": self.market_mode,
                "chaos_factor": round(self.chaos_factor, 2),
                "halted_symbols": sorted(self.halted_symbols),
                "symbols": list(self.symbols),
                "metrics": copy.deepcopy(self.metrics),
                "thresholds": copy.deepcopy(self.adaptive_thresholds),
            }

    async def get_stocks_snapshot(self) -> Dict[str, Any]:
        async with self.lock:
            rows: List[Dict[str, Any]] = []
            for symbol, state in self.states.items():
                if not state.last_tick:
                    continue
                tick = state.last_tick
                edge = state.last_edge or {}
                bars_1s = state.ohlc_1s.snapshot(3)
                bars_1m = state.ohlc_1m.snapshot(5)
                row = {
                    "symbol": symbol,
                    "timestamp": tick["timestamp"],
                    "price": tick["price"],
                    "volume": tick["volume"],
                    "bid": tick["bid"],
                    "ask": tick["ask"],
                    "order_imbalance": tick["order_imbalance"],
                    "edge_score": edge.get("edge_score", 0.0),
                    "signal_type": edge.get("signal_type", "NEUTRAL"),
                    "confidence": edge.get("confidence", 0.0),
                    "total_volume": state.total_volume,
                    "ohlc_1s": bars_1s[-1] if bars_1s else None,
                    "ohlc_1m": bars_1m[-1] if bars_1m else None,
                }
                rows.append(row)
            rows.sort(key=lambda x: float(x["edge_score"]), reverse=True)
            return {
                "timestamp": int(time.time() * 1000),
                "count": len(rows),
                "items": rows,
                "status": copy.deepcopy(self.metrics),
            }

    async def get_edge(self, symbol: str) -> Dict[str, Any]:
        symbol = symbol.upper()
        async with self.lock:
            state = self.states.get(symbol)
            if state is None:
                raise KeyError(f"Unknown symbol: {symbol}")
            return {
                "symbol": symbol,
                "timestamp": int(time.time() * 1000),
                "edge": copy.deepcopy(state.last_edge),
                "ohlc": {
                    "1s": state.ohlc_1s.snapshot(30),
                    "1m": state.ohlc_1m.snapshot(30),
                    "5m": state.ohlc_5m.snapshot(30),
                },
            }

    async def get_orderbook(self, symbol: str) -> Dict[str, Any]:
        symbol = symbol.upper()
        async with self.lock:
            state = self.states.get(symbol)
            if state is None:
                raise KeyError(f"Unknown symbol: {symbol}")
            return {
                "timestamp": int(time.time() * 1000),
                "orderbook": state.orderbook.snapshot(),
                "last_tick": copy.deepcopy(state.last_tick),
            }

    async def get_heatmap(self) -> Dict[str, Any]:
        async with self.lock:
            tiles: List[Dict[str, Any]] = []
            for symbol, state in self.states.items():
                if not state.last_tick:
                    continue
                tick = state.last_tick
                edge = state.last_edge
                depth = state.orderbook.depth_metrics()
                tiles.append(
                    {
                        "symbol": symbol,
                        "price": tick["price"],
                        "volume": tick["volume"],
                        "edge_score": float(edge.get("edge_score", 0.0)),
                        "signal_type": edge.get("signal_type", "NEUTRAL"),
                        "confidence": float(edge.get("confidence", 0.0)),
                        "depth_imbalance": round(depth["depth_imbalance"], 4),
                    }
                )
            return {"timestamp": int(time.time() * 1000), "items": tiles}
