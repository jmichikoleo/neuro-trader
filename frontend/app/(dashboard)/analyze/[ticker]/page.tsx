"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AgentTrace from "@/components/AgentTrace";
import TickerPicker from "@/components/TickerPicker";
import { apiFetch, getOpenAIKey } from "@/lib/api";

export default function AnalyzePage() {
  const params = useParams<{ ticker: string }>();
  const ticker = decodeURIComponent(params.ticker);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  async function run() {
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const res = await apiFetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ symbol: ticker }),
      });
      setData(res);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setHasKey(!!getOpenAIKey());
    run();
    /* eslint-disable-next-line */
  }, [ticker]);

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-accent neon tracking-tight">
              &gt; analyze::{ticker.replace(".JK", "")}
            </h1>
            <p className="text-muted text-xs uppercase tracking-[0.2em] mt-1">
              multi_agent_pipeline · analysts → bull/bear → trader
            </p>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="bg-accent hover:bg-accent-dark text-bg font-bold uppercase tracking-widest px-4 py-2 rounded text-xs shadow-glow-sm disabled:opacity-40"
          >
            {loading ? "[ running... ]" : "[ re-run ]"}
          </button>
        </div>
        <TickerPicker current={ticker} />
      </div>

      {!hasKey && (
        <div className="mb-5 rounded border border-accent/40 bg-accent/5 p-4 text-xs text-accent/80 font-mono">
          ! no openai_api_key set — agents will run in offline stub mode. click{" "}
          <span className="text-accent">openai_key: none</span> in the top-right to add your key.
        </div>
      )}

      {err && <div className="text-down mb-4 font-mono text-sm">[ error: {err} ]</div>}
      {loading && <div className="text-accent/70 font-mono text-sm">[ agents_thinking... ]</div>}
      {data && (
        <>
          <div className="mb-5 rounded border border-accent bg-accent/5 p-5 shadow-glow">
            <div className="text-[10px] text-accent/70 uppercase tracking-[0.3em] mb-2">
              &gt; final_verdict
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-4 py-2 rounded text-lg font-bold uppercase tracking-widest border ${
                  data.decision.action === "BUY"
                    ? "bg-accent/20 text-accent border-accent shadow-glow-sm neon"
                    : data.decision.action === "SELL"
                    ? "bg-down/20 text-down border-down"
                    : "bg-muted/10 text-muted border-muted/40"
                }`}
              >
                [ {data.decision.action} ]
              </span>
              <span className="text-muted text-xs uppercase tracking-widest">
                confidence_{(data.decision.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm mt-3 text-white/90 font-mono leading-relaxed">
              {data.decision.rationale}
            </p>
          </div>
          <AgentTrace steps={data.steps} />
        </>
      )}
    </div>
  );
}
