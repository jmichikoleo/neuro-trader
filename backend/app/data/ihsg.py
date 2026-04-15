from __future__ import annotations
import math
from typing import Any, Dict, List
import yfinance as yf
import pandas as pd
import numpy as np


def _safe(v: Any) -> Any:
    if v is None:
        return None
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    return v


def get_history(symbol: str, period: str = "6mo") -> pd.DataFrame:
    return yf.Ticker(symbol).history(period=period, auto_adjust=True)


def get_quote(symbol: str) -> Dict[str, Any]:
    t = yf.Ticker(symbol)
    info: Dict[str, Any] = {}
    try:
        info = t.fast_info or {}
        info = dict(info)
    except Exception:
        info = {}
    hist = get_history(symbol, period="1mo")
    last = float(hist["Close"].iloc[-1]) if len(hist) else None
    prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else None
    change_pct = ((last - prev) / prev * 100) if last and prev else None
    vol = float(hist["Volume"].iloc[-1]) if len(hist) else None
    return {
        "symbol": symbol,
        "last": _safe(last),
        "changePct": _safe(change_pct),
        "volume": _safe(vol),
    }


def compute_elliott(symbol: str, threshold_pct: float = 5.0) -> Dict[str, Any]:
    from .elliott import detect_elliott
    hist = get_history(symbol, period="2y")
    if hist.empty:
        return {"error": "no data"}
    closes = [float(x) for x in hist["Close"].tolist()]
    dates = [ts.strftime("%Y-%m-%d") for ts in hist.index]
    return detect_elliott(closes, threshold_pct=threshold_pct, dates=dates)


def compute_indicators(symbol: str) -> Dict[str, Any]:
    hist = get_history(symbol, period="1y")
    if hist.empty:
        return {"error": "no data"}
    close = hist["Close"]
    sma50 = close.rolling(50).mean().iloc[-1]
    sma200 = close.rolling(200).mean().iloc[-1] if len(close) >= 200 else None
    # RSI(14)
    delta = close.diff()
    up = delta.clip(lower=0).rolling(14).mean()
    down = -delta.clip(upper=0).rolling(14).mean()
    rs = up / down
    rsi = (100 - 100 / (1 + rs)).iloc[-1]
    # MACD
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd = (ema12 - ema26).iloc[-1]
    signal = (ema12 - ema26).ewm(span=9, adjust=False).mean().iloc[-1]
    return {
        "last": _safe(float(close.iloc[-1])),
        "sma50": _safe(float(sma50) if not np.isnan(sma50) else None),
        "sma200": _safe(float(sma200) if sma200 is not None and not np.isnan(sma200) else None),
        "rsi14": _safe(float(rsi) if not np.isnan(rsi) else None),
        "macd": _safe(float(macd)),
        "macdSignal": _safe(float(signal)),
        "return1m": _safe(float((close.iloc[-1] / close.iloc[-21] - 1) * 100)) if len(close) > 21 else None,
        "return3m": _safe(float((close.iloc[-1] / close.iloc[-63] - 1) * 100)) if len(close) > 63 else None,
    }


def get_fundamentals(symbol: str) -> Dict[str, Any]:
    t = yf.Ticker(symbol)
    try:
        info = t.info or {}
    except Exception:
        info = {}
    return {
        "marketCap": _safe(info.get("marketCap")),
        "trailingPE": _safe(info.get("trailingPE")),
        "priceToBook": _safe(info.get("priceToBook")),
        "returnOnEquity": _safe(info.get("returnOnEquity")),
        "debtToEquity": _safe(info.get("debtToEquity")),
        "dividendYield": _safe(info.get("dividendYield")),
        "sector": info.get("sector"),
        "longName": info.get("longName"),
    }


def get_history_series(symbol: str, period: str = "5y") -> List[Dict[str, Any]]:
    """Returns a list of {date, close} points for charting. Downsamples to ~weekly
    when the period is long so the payload stays small."""
    hist = get_history(symbol, period=period)
    if hist.empty:
        return []
    # Downsample: 5y -> weekly, 1y -> daily, etc.
    if len(hist) > 400:
        hist = hist.resample("W").last().dropna()
    out = []
    for ts, row in hist.iterrows():
        out.append({
            "date": ts.strftime("%Y-%m-%d"),
            "close": _safe(float(row["Close"])),
        })
    return out


def get_news(symbol: str, limit: int = 5) -> List[Dict[str, Any]]:
    t = yf.Ticker(symbol)
    try:
        raw = t.news or []
    except Exception:
        raw = []
    out = []
    for item in raw[:limit]:
        out.append({
            "title": item.get("title"),
            "publisher": item.get("publisher"),
            "link": item.get("link"),
        })
    return out
