from .base import BaseAgent
from ..data.ihsg import compute_indicators, compute_elliott


class MarketAnalyst(BaseAgent):
    name = "Market Analyst"
    role = "technical"
    system_prompt = (
        "You are a technical analyst for Indonesian equities. You receive classic indicators "
        "(RSI, MACD, SMA50/200) AND an Elliott Wave count with rule validation. "
        "Write a concise (<=180 words) assessment covering: "
        "(1) trend & momentum from indicators, "
        "(2) the Elliott Wave count — state whether it is valid, which wave we're likely in, "
        "and whether the three core rules are satisfied (W2 retrace<100%, W3 not shortest, W4 no overlap with W1), "
        "(3) overall bias and key levels."
    )

    def run(self, context):
        symbol = context["symbol"]
        ind = compute_indicators(symbol)
        elliott = compute_elliott(symbol)
        msg = (
            f"Ticker: {symbol}\n"
            f"Indicators: {ind}\n\n"
            f"Elliott Wave analysis (zigzag threshold 5%):\n{elliott}\n\n"
            "Summarize trend, momentum, the Elliott count + rule check, and overall bias."
        )
        summary = self.chat(msg)
        return {
            "agent": self.name,
            "data": {"indicators": ind, "elliott": elliott},
            "summary": summary,
        }
