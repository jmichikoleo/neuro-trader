from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, Depends, HTTPException
from ..auth import verify_token
from ..data.tickers import IHSG_TICKERS
from ..data.ihsg import get_quote, get_history_series, get_fundamentals, compute_indicators, compute_elliott

router = APIRouter()


@router.get("/tickers")
def tickers(_: str = Depends(verify_token)):
    """Lightweight ticker list — no live quotes, just symbol/name/sector."""
    return {"tickers": IHSG_TICKERS}


@router.get("")
def screener(_: str = Depends(verify_token)):
    results = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        quotes = list(ex.map(lambda t: _safe_quote(t), IHSG_TICKERS))
    for meta, q in zip(IHSG_TICKERS, quotes):
        results.append({**meta, **q})
    return {"rows": results}


@router.get("/quote/{symbol}")
def quote_detail(symbol: str, period: str = "5y", _: str = Depends(verify_token)):
    """Long-term price series + fundamentals + indicators for the detail modal."""
    sym = symbol.upper()
    if not sym.endswith(".JK"):
        sym = sym + ".JK"
    meta = next((t for t in IHSG_TICKERS if t["symbol"] == sym), None)
    try:
        series = get_history_series(sym, period=period)
        fundamentals = get_fundamentals(sym)
        indicators = compute_indicators(sym)
        elliott = compute_elliott(sym)
        quote = get_quote(sym)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"data fetch failed: {e}")
    if not series:
        raise HTTPException(status_code=404, detail=f"no data for {sym}")
    return {
        "symbol": sym,
        "name": (meta or {}).get("name") or fundamentals.get("longName") or sym,
        "sector": (meta or {}).get("sector") or fundamentals.get("sector"),
        "quote": quote,
        "fundamentals": fundamentals,
        "indicators": indicators,
        "elliott": elliott,
        "series": series,
        "period": period,
    }


def _safe_quote(meta):
    try:
        return get_quote(meta["symbol"])
    except Exception as e:
        return {"symbol": meta["symbol"], "last": None, "changePct": None, "volume": None, "error": str(e)}
