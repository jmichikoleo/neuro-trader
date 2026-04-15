from .base import BaseAgent


class BullResearcher(BaseAgent):
    name = "Bull Researcher"
    role = "bull"
    system_prompt = (
        "You are a bullish equity researcher. Given analyst reports, argue the BULL case "
        "in <=150 words. Be specific; cite numbers."
    )

    def run(self, context):
        reports = context["reports"]
        msg = "Analyst reports:\n" + "\n\n".join(
            f"## {r['agent']}\n{r['summary']}" for r in reports
        )
        return {"agent": self.name, "summary": self.chat(msg)}
