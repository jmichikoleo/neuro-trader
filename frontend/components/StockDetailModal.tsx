"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import StockChart from "./StockChart";

type ElliottPivot = { label: string; idx: number; price: number; date: string | null };
type ElliottRule = { passed: boolean; desc: string; value?: any; lengths?: any; w1_extreme?: number; w4_extreme?: number };
type Elliott = {
  pivot_count?: number;
  threshold_pct?: number;
  impulse?: {
    status: string;
    direction?: "bullish" | "bearish";
    valid?: boolean;
    pivots?: ElliottPivot[];
    wave_lengths?: Record<string, number>;
    fib_w3_over_w1?: number | null;
    rules?: {
      rule_1_w2_retrace_lt_100: ElliottRule;
      rule_2_w3_not_shortest: ElliottRule;
      rule_3_w4_no_overlap_w1: ElliottRule;
    };
    interpretation?: string;
    note?: string;
    pattern?: string;
  };
};

type Detail = {
  symbol: string;
  name: string;
  sector?: string;
  quote: { last: number | null; changePct: number | null; volume: number | null };
  fundamentals: Record<string, any>;
  indicators: Record<string, any>;
  elliott?: Elliott;
  series: { date: string; close: number }[];
  period: string;
};

const PERIODS = ["1mo", "6mo", "1y", "5y", "max"] as const;

export default function StockDetailModal({
  symbol,
  onClose,
}: {
  symbol: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("5y");

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setDetail(null);
    setErr(null);
    apiFetch(`/api/screener/quote/${encodeURIComponent(symbol)}?period=${period}`)
      .then((d) => setDetail(d))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [symbol, period]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (symbol) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [symbol, onClose]);

  if (!symbol) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-accent/60 rounded shadow-glow w-full max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-accent/30">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-accent neon">
                {symbol.replace(".JK", "")}
              </h2>
              {detail && (
                <span className="text-sm text-white/80 font-mono">{detail.name}</span>
              )}
            </div>
            {detail?.sector && (
              <div className="text-[10px] text-muted uppercase tracking-widest mt-1">
                &gt; {detail.sector}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-accent text-2xl leading-none w-8 h-8 flex items-center justify-center border border-accent/30 hover:border-accent rounded"
            aria-label="close"
          >
            ×
          </button>
        </div>

        {/* body */}
        <div className="p-6">
          {loading && <div className="text-accent/70 font-mono text-sm">[ loading_chart... ]</div>}
          {err && <div className="text-down font-mono text-sm">[ error: {err} ]</div>}

          {detail && (
            <>
              {/* price + change */}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-accent neon font-mono">
                    {detail.quote.last?.toLocaleString() ?? "—"}
                    <span className="text-xs text-muted ml-2 uppercase tracking-widest">IDR</span>
                  </div>
                  <div
                    className={`text-sm font-mono mt-1 ${
                      (detail.quote.changePct ?? 0) >= 0 ? "text-accent" : "text-down"
                    }`}
                  >
                    {(detail.quote.changePct ?? 0) >= 0 ? "▲" : "▼"}{" "}
                    {detail.quote.changePct?.toFixed(2) ?? "—"}% today
                  </div>
                </div>
                {/* period selector */}
                <div className="flex items-center gap-1 border border-accent/30 rounded p-1">
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded transition ${
                        period === p
                          ? "bg-accent text-bg font-bold"
                          : "text-muted hover:text-accent"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* chart with elliott markers overlaid */}
              <div className="rounded border border-accent/30 bg-bg p-3 mb-5">
                <StockChart
                  series={detail.series}
                  markers={
                    detail.elliott?.impulse?.pivots
                      ?.filter((p) => !!p.date)
                      .map((p) => ({ date: p.date as string, label: p.label, price: p.price })) ?? []
                  }
                />
                {detail.elliott?.impulse?.pivots && detail.elliott.impulse.pivots.length > 0 && (
                  <div className="text-[9px] text-muted uppercase tracking-widest mt-2 font-mono">
                    <span className="inline-block w-2 h-2 bg-accent mr-1 align-middle" /> price &nbsp;
                    <span className="inline-block w-2 h-2 mr-1 align-middle" style={{ background: "#ffd54a" }} /> elliott_wave_pivots
                  </div>
                )}
              </div>

              {/* stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <Stat label="market_cap" value={fmtBig(detail.fundamentals.marketCap)} />
                <Stat label="trailing_pe" value={fmtNum(detail.fundamentals.trailingPE)} />
                <Stat label="price_to_book" value={fmtNum(detail.fundamentals.priceToBook)} />
                <Stat label="roe" value={fmtPct(detail.fundamentals.returnOnEquity)} />
                <Stat label="debt/equity" value={fmtNum(detail.fundamentals.debtToEquity)} />
                <Stat label="div_yield" value={fmtPct(detail.fundamentals.dividendYield)} />
                <Stat label="rsi_14" value={fmtNum(detail.indicators.rsi14)} />
                <Stat label="ret_3m" value={fmtPct((detail.indicators.return3m ?? 0) / 100)} />
              </div>

              {/* elliott wave panel */}
              {detail.elliott?.impulse && <ElliottPanel elliott={detail.elliott} />}

              {/* actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push(`/analyze/${encodeURIComponent(symbol)}`);
                  }}
                  className="flex-1 bg-accent hover:bg-accent-dark text-bg font-bold uppercase tracking-widest text-xs py-3 rounded shadow-glow-sm"
                >
                  [ run_agent_pipeline → ]
                </button>
                <button
                  onClick={onClose}
                  className="px-4 text-xs text-muted hover:text-accent uppercase tracking-widest border border-accent/30 hover:border-accent rounded"
                >
                  close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ElliottPanel({ elliott }: { elliott: Elliott }) {
  const imp = elliott.impulse!;
  if (imp.status !== "labeled") {
    return (
      <div className="mb-5 rounded border border-accent/30 bg-bg-card p-5">
        <div className="text-[10px] text-accent uppercase tracking-[0.3em] mb-2">
          &gt; elliott_wave
        </div>
        <div className="text-xs text-muted font-mono">
          [ {imp.status} ] {imp.note ?? ""} {imp.pattern ? `· pattern: ${imp.pattern}` : ""}
        </div>
        <div className="text-[10px] text-muted mt-2">
          pivot_count: {elliott.pivot_count} · zigzag_threshold: {elliott.threshold_pct}%
        </div>
      </div>
    );
  }

  const rules = imp.rules!;
  const ruleList = [
    { key: "R1", label: "wave_2_retrace_<_100%", r: rules.rule_1_w2_retrace_lt_100, fmt: (r: ElliottRule) => `${((r.value ?? 0) * 100).toFixed(0)}%` },
    { key: "R2", label: "wave_3_not_shortest", r: rules.rule_2_w3_not_shortest, fmt: (r: ElliottRule) => `w1=${r.lengths?.w1} · w3=${r.lengths?.w3} · w5=${r.lengths?.w5}` },
    { key: "R3", label: "wave_4_no_overlap_w1", r: rules.rule_3_w4_no_overlap_w1, fmt: (r: ElliottRule) => `w1=${r.w1_extreme} · w4=${r.w4_extreme}` },
  ];

  return (
    <div className="mb-5 rounded border border-accent/30 bg-bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-accent uppercase tracking-[0.3em]">&gt; elliott_wave</div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border font-bold ${
              imp.direction === "bullish"
                ? "border-accent text-accent bg-accent/10"
                : "border-down text-down bg-down/10"
            }`}
          >
            {imp.direction}
          </span>
          <span
            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border font-bold ${
              imp.valid
                ? "border-accent text-accent bg-accent/10 shadow-glow-sm"
                : "border-down text-down bg-down/10"
            }`}
          >
            {imp.valid ? "✓ valid" : "✕ invalid"}
          </span>
        </div>
      </div>

      {/* rule pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        {ruleList.map((rl) => (
          <div
            key={rl.key}
            className={`rounded border p-2 ${
              rl.r.passed ? "border-accent/50 bg-accent/5" : "border-down/50 bg-down/5"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-widest text-muted">{rl.key} · {rl.label}</span>
              <span className={`text-xs font-bold ${rl.r.passed ? "text-accent" : "text-down"}`}>
                {rl.r.passed ? "✓" : "✕"}
              </span>
            </div>
            <div className="text-[10px] text-white/70 font-mono leading-tight">{rl.r.desc}</div>
            <div className="text-[10px] text-accent/80 font-mono mt-1">{rl.fmt(rl.r)}</div>
          </div>
        ))}
      </div>

      {/* wave lengths */}
      {imp.wave_lengths && (
        <div className="text-[10px] text-muted font-mono mb-2">
          waves: w1={imp.wave_lengths.w1} · w2_retrace={imp.wave_lengths.w2_retrace} · w3={imp.wave_lengths.w3}
          {" · "}w4_retrace={imp.wave_lengths.w4_retrace} · w5={imp.wave_lengths.w5}
          {imp.fib_w3_over_w1 != null && <span className="text-accent"> · w3/w1={imp.fib_w3_over_w1}x</span>}
        </div>
      )}

      {imp.interpretation && (
        <div className="text-xs text-white/90 font-mono leading-relaxed border-l-2 border-accent/60 pl-3 mt-2">
          &gt; {imp.interpretation}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-accent/20 bg-bg-panel rounded p-3">
      <div className="text-[9px] text-muted uppercase tracking-widest mb-1">&gt; {label}</div>
      <div className="text-sm font-mono text-accent">{value}</div>
    </div>
  );
}

function fmtNum(n: any) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
function fmtPct(n: any) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return `${(Number(n) * 100).toFixed(2)}%`;
}
function fmtBig(n: any) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const v = Number(n);
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return v.toLocaleString();
}
