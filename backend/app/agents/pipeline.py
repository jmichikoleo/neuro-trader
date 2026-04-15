from .market_analyst import MarketAnalyst
from .fundamentals import FundamentalsAnalyst
from .news_analyst import NewsAnalyst
from .bull_researcher import BullResearcher
from .bear_researcher import BearResearcher
from .trader import Trader


def run_pipeline(symbol: str) -> dict:
    ctx = {"symbol": symbol}
    steps = []

    analysts = [MarketAnalyst(), FundamentalsAnalyst(), NewsAnalyst()]
    reports = []
    for a in analysts:
        r = a.run(ctx)
        reports.append(r)
        steps.append(r)
    ctx["reports"] = reports

    bull = BullResearcher().run(ctx)
    steps.append(bull)
    ctx["bull"] = bull

    bear = BearResearcher().run(ctx)
    steps.append(bear)
    ctx["bear"] = bear

    trader_out = Trader().run(ctx)
    steps.append(trader_out)

    return {
        "symbol": symbol,
        "steps": steps,
        "decision": trader_out["decision"],
    }
