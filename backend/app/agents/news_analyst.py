from .base import BaseAgent
from ..data.ihsg import get_news


class NewsAnalyst(BaseAgent):
    name = "News Analyst"
    role = "news"
    system_prompt = (
        "You are a news/sentiment analyst. Given recent headlines, summarize the tone "
        "(bullish/bearish/neutral) and key catalysts in <=120 words."
    )

    def run(self, context):
        symbol = context["symbol"]
        news = get_news(symbol)
        headlines = "\n".join(f"- {n['title']} ({n.get('publisher')})" for n in news) or "(no headlines found)"
        summary = self.chat(f"Ticker: {symbol}\nHeadlines:\n{headlines}")
        return {"agent": self.name, "data": news, "summary": summary}
