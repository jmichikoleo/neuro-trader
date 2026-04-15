"use client";

type Step = {
  agent: string;
  summary?: string;
  data?: any;
  decision?: { action: string; confidence: number; rationale: string };
};

const ICONS: Record<string, string> = {
  "Market Analyst": "▲",
  "Fundamentals Analyst": "◆",
  "News Analyst": "✦",
  "Bull Researcher": "↑",
  "Bear Researcher": "↓",
  Trader: "◉",
};

export default function AgentTrace({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-4">
      {steps.map((s, i) => (
        <div
          key={i}
          className="rounded border border-accent/30 bg-bg-card p-5 hover:border-accent/60 transition"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-accent text-lg">{ICONS[s.agent] || "▸"}</span>
            <h3 className="font-bold text-accent uppercase tracking-wider text-sm">
              &gt; {s.agent.toLowerCase().replace(/ /g, "_")}
            </h3>
          </div>
          {s.summary && (
            <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed font-mono">
              {s.summary}
            </p>
          )}
          {s.decision && (
            <div className="mt-2">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border ${
                    s.decision.action === "BUY"
                      ? "bg-accent/20 text-accent border-accent shadow-glow-sm"
                      : s.decision.action === "SELL"
                      ? "bg-down/20 text-down border-down/60"
                      : "bg-muted/10 text-muted border-muted/40"
                  }`}
                >
                  [ {s.decision.action} ]
                </span>
                <span className="text-[10px] text-muted uppercase tracking-widest">
                  conf_{(s.decision.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed font-mono">
                {s.decision.rationale}
              </p>
            </div>
          )}
          {s.data && !s.decision && (
            <details className="mt-3">
              <summary className="text-[10px] text-accent/60 cursor-pointer uppercase tracking-widest hover:text-accent">
                &gt; raw_data
              </summary>
              <pre className="text-[11px] text-muted mt-2 overflow-auto font-mono bg-bg p-3 rounded border border-accent/20">
                {JSON.stringify(s.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
