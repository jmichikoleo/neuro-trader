"use client";
import TickerPicker from "@/components/TickerPicker";

export default function AnalyzeLanding() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-accent neon tracking-tight">&gt; analyze</h1>
        <p className="text-muted text-xs uppercase tracking-[0.2em] mt-1">
          select_a_ticker · multi_agent_pipeline ready
        </p>
      </div>
      <div className="max-w-2xl">
        <TickerPicker />
        <div className="mt-6 rounded border border-accent/30 bg-bg-card p-5 text-xs text-muted font-mono leading-relaxed">
          <div className="text-accent uppercase tracking-widest mb-2">&gt; how_it_works</div>
          1. pick a ticker above (or type any IHSG symbol — `.JK` is auto-appended)
          <br />
          2. agents run in sequence: market → fundamentals → news → bull/bear → trader
          <br />
          3. you get a BUY / HOLD / SELL verdict with reasoning from each agent
          <br />
          <br />
          <span className="text-accent">tip:</span> add your openai_api_key in the top-right header
          to get real LLM analysis instead of offline stubs.
        </div>
      </div>
    </div>
  );
}
