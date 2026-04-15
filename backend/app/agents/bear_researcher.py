from .base import BaseAgent


class BearResearcher(BaseAgent):
    name = "Bear Researcher"
    role = "bear"
    system_prompt = (
        "You are a bearish equity researcher. Given analyst reports, argue the BEAR case "
        "in <=150 words. Be specific; cite numbers and risks."
    )

    def run(self, context):
        reports = context["reports"]
        msg = "Analyst reports:\n" + "\n\n".join(
            f"## {r['agent']}\n{r['summary']}" for r in reports
        )
        return {"agent": self.name, "summary": self.chat(msg)}
