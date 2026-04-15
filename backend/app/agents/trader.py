import json
import re
from .base import BaseAgent


class Trader(BaseAgent):
    name = "Trader"
    role = "decision"
    system_prompt = (
        "You are a portfolio manager. Given analyst reports and bull/bear debate, "
        "return a JSON object with keys: action (BUY|HOLD|SELL), confidence (0-1), "
        "rationale (<=120 words). Respond with JSON ONLY."
    )

    def run(self, context):
        reports = context["reports"]
        bull = context["bull"]
        bear = context["bear"]
        msg = (
            "## Analyst reports\n"
            + "\n\n".join(f"### {r['agent']}\n{r['summary']}" for r in reports)
            + f"\n\n## Bull case\n{bull['summary']}\n\n## Bear case\n{bear['summary']}\n\n"
            "Return JSON only."
        )
        raw = self.chat(msg)
        decision = {"action": "HOLD", "confidence": 0.5, "rationale": raw}
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
                decision.update({
                    "action": str(parsed.get("action", "HOLD")).upper(),
                    "confidence": float(parsed.get("confidence", 0.5)),
                    "rationale": parsed.get("rationale", raw),
                })
            except Exception:
                pass
        return {"agent": self.name, "decision": decision}
