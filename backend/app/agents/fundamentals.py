from .base import BaseAgent
from ..data.ihsg import get_fundamentals


class FundamentalsAnalyst(BaseAgent):
    name = "Fundamentals Analyst"
    role = "fundamental"
    system_prompt = (
        "You are a fundamentals analyst for Indonesian equities. Given company metrics, "
        "write a concise (<=150 words) view on valuation, profitability, and balance sheet."
    )

    def run(self, context):
        symbol = context["symbol"]
        f = get_fundamentals(symbol)
        msg = f"Ticker: {symbol}\nFundamentals: {f}\nAssess valuation and quality."
        summary = self.chat(msg)
        return {"agent": self.name, "data": f, "summary": summary}
