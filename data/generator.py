from __future__ import annotations

import math
import random
import time
from typing import Dict, List


def default_nse_like_symbols() -> List[str]:
    return [
        "RELIANCE",
        "TCS",
        "HDFCBANK",
        "ICICIBANK",
        "INFY",
        "HINDUNILVR",
        "ITC",
        "LT",
        "SBIN",
        "BHARTIARTL",
        "KOTAKBANK",
        "AXISBANK",
        "ASIANPAINT",
        "MARUTI",
        "BAJFINANCE",
        "HCLTECH",
        "SUNPHARMA",
        "ULTRACEMCO",
        "NESTLEIND",
        "TITAN",
        "WIPRO",
        "POWERGRID",
        "NTPC",
        "ONGC",
        "M&M",
        "ADANIENT",
        "ADANIPORTS",
        "TATAMOTORS",
        "TATASTEEL",
        "INDUSINDBK",
        "TECHM",
        "BAJAJFINSV",
        "GRASIM",
        "DRREDDY",
        "COALINDIA",
        "JSWSTEEL",
        "EICHERMOT",
        "BRITANNIA",
        "CIPLA",
        "HDFCLIFE",
        "SBILIFE",
        "DIVISLAB",
        "HEROMOTOCO",
        "APOLLOHOSP",
        "BPCL",
        "HINDALCO",
        "UPL",
        "SHREECEM",
        "BAJAJ-AUTO",
        "TATACONSUM",
        "PIDILITIND",
        "DABUR",
        "GODREJCP",
        "AMBUJACEM",
        "BANKBARODA",
        "PNB",
        "DLF",
        "ZYDUSLIFE",
        "TORNTPHARM",
        "LODHA",
    ]


class MarketDataGenerator:
    def __init__(self, symbols: List[str] | None = None, seed: int | None = None) -> None:
        self.random = random.Random(seed if seed is not None else time.time_ns())
        self.symbols = symbols if symbols is not None else default_nse_like_symbols()
        self._step = 0
        self._sentiment = 0.0
        self._sector_shocks: Dict[str, float] = {
            "banks": 0.0,
            "it": 0.0,
            "energy": 0.0,
            "auto": 0.0,
            "pharma": 0.0,
            "consumption": 0.0,
            "industrials": 0.0,
        }
        self._symbol_sector = self._build_symbol_sector_map()
        self._states: Dict[str, Dict[str, float]] = {}
        for symbol in self.symbols:
            self._states[symbol] = {
                "price": self.random.uniform(120.0, 3200.0),
                "base_volume": self.random.uniform(600.0, 18000.0),
                "drift": self.random.uniform(-0.00005, 0.00007),
                "vol": self.random.uniform(0.0007, 0.0035),
                "regime": 1.0,
                "momentum": 0.0,
            }

    def _build_symbol_sector_map(self) -> Dict[str, str]:
        banks = {"HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK", "INDUSINDBK", "BANKBARODA", "PNB"}
        it = {"TCS", "INFY", "HCLTECH", "WIPRO", "TECHM"}
        energy = {"RELIANCE", "ONGC", "NTPC", "POWERGRID", "BPCL", "COALINDIA"}
        auto = {"MARUTI", "M&M", "TATAMOTORS", "EICHERMOT", "HEROMOTOCO", "BAJAJ-AUTO"}
        pharma = {"SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "ZYDUSLIFE", "TORNTPHARM"}
        consumption = {"HINDUNILVR", "ITC", "NESTLEIND", "BRITANNIA", "DABUR", "GODREJCP", "TATACONSUM"}
        sectors: Dict[str, str] = {}
        for symbol in default_nse_like_symbols():
            if symbol in banks:
                sectors[symbol] = "banks"
            elif symbol in it:
                sectors[symbol] = "it"
            elif symbol in energy:
                sectors[symbol] = "energy"
            elif symbol in auto:
                sectors[symbol] = "auto"
            elif symbol in pharma:
                sectors[symbol] = "pharma"
            elif symbol in consumption:
                sectors[symbol] = "consumption"
            else:
                sectors[symbol] = "industrials"
        return sectors

    def _update_market_regimes(self) -> None:
        self._sentiment = (0.94 * self._sentiment) + self.random.gauss(0.0, 0.02)
        self._sentiment = max(-0.12, min(0.12, self._sentiment))
        for key in self._sector_shocks:
            self._sector_shocks[key] = (0.90 * self._sector_shocks[key]) + self.random.gauss(0.0, 0.015)
            self._sector_shocks[key] = max(-0.2, min(0.2, self._sector_shocks[key]))

    def _maybe_shift_symbol_regime(self, symbol: str, state: Dict[str, float]) -> None:
        if self.random.random() < 0.012:
            regime = self.random.choice([0.55, 0.85, 1.0, 1.35, 1.8, 2.3])
            state["regime"] = regime
        if self.random.random() < 0.009:
            state["drift"] = max(-0.00015, min(0.00015, state["drift"] + self.random.gauss(0.0, 0.00001)))

    def _generate_single_tick(self, symbol: str, ts_ms: int) -> Dict[str, float | int | str]:
        state = self._states[symbol]
        self._maybe_shift_symbol_regime(symbol, state)
        sector = self._symbol_sector.get(symbol, "industrials")
        sector_factor = self._sector_shocks[sector] * 0.0008
        noise = self.random.gauss(0.0, 1.0)
        jump = self.random.gauss(0.0, 1.0) * state["vol"] * 5.0 if self.random.random() < 0.0025 else 0.0
        state["momentum"] = (0.75 * state["momentum"]) + (0.25 * noise)
        ret = (
            state["drift"]
            + (state["vol"] * state["regime"] * noise)
            + (state["momentum"] * state["vol"] * 0.35)
            + (self._sentiment * 0.0006)
            + sector_factor
            + jump
        )
        ret = max(-0.08, min(0.08, ret))

        old_price = state["price"]
        new_price = max(1.0, old_price * (1.0 + ret))
        state["price"] = new_price

        spread_ratio = (0.00035 + (state["vol"] * state["regime"] * 0.6) + (abs(ret) * 0.18)) * self.random.uniform(0.9, 1.2)
        spread = max(0.01, new_price * spread_ratio)
        bid = max(0.01, new_price - (spread * 0.5))
        ask = max(bid + 0.01, new_price + (spread * 0.5))

        volatility_pressure = abs(ret) * 320.0
        volume = int(
            max(
                1.0,
                state["base_volume"]
                * (1.0 + volatility_pressure)
                * (1.0 + (state["regime"] - 1.0) * 0.8)
                * self.random.uniform(0.6, 1.45),
            )
        )

        raw_imbalance = math.tanh((ret * 520.0) + self.random.gauss(0.0, 0.8))
        order_imbalance = max(-1.0, min(1.0, raw_imbalance))
        bid_qty = int(max(1, volume * (1.0 + order_imbalance) * self.random.uniform(0.35, 0.9)))
        ask_qty = int(max(1, volume * (1.0 - order_imbalance) * self.random.uniform(0.35, 0.9)))

        return {
            "type": "tick",
            "symbol": symbol,
            "timestamp": ts_ms,
            "price": round(new_price, 2),
            "volume": volume,
            "bid": round(bid, 2),
            "ask": round(ask, 2),
            "bid_qty": bid_qty,
            "ask_qty": ask_qty,
            "order_imbalance": round(order_imbalance, 4),
            "volatility_regime": round(state["regime"], 3),
            "return": round(ret, 6),
        }

    def generate_batch(self, ts_ms: int | None = None) -> List[Dict[str, float | int | str]]:
        self._step += 1
        self._update_market_regimes()
        now_ms = ts_ms if ts_ms is not None else int(time.time() * 1000)
        return [self._generate_single_tick(symbol, now_ms) for symbol in self.symbols]
