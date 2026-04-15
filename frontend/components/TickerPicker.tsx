"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Ticker = { symbol: string; name: string; sector: string };

export default function TickerPicker({
  current,
  className = "",
}: {
  current?: string;
  className?: string;
}) {
  const router = useRouter();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch("/api/screener/tickers")
      .then((d) => setTickers(d.tickers))
      .catch(() => setTickers([]));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tickers;
    return tickers.filter(
      (t) =>
        t.symbol.toLowerCase().includes(needle) ||
        t.name.toLowerCase().includes(needle) ||
        t.sector.toLowerCase().includes(needle),
    );
  }, [q, tickers]);

  function pick(symbol: string) {
    setOpen(false);
    setQ("");
    router.push(`/analyze/${encodeURIComponent(symbol)}`);
  }

  function submitManual() {
    let s = q.trim().toUpperCase();
    if (!s) return;
    if (!s.endsWith(".JK")) s = s + ".JK";
    pick(s);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
          else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[highlight]) pick(filtered[highlight].symbol);
            else submitManual();
          } else if (e.key === "Escape") setOpen(false);
        }}
        placeholder={current ? `> current: ${current.replace(".JK", "")} — type to switch...` : "> search ticker (e.g. BBCA, telkom, energy)..."}
        className="w-full bg-bg border border-accent/40 rounded px-3 py-2.5 text-sm text-accent placeholder:text-muted/60 focus:border-accent focus:shadow-glow-sm focus:outline-none caret-accent font-mono"
      />
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-bg-card border border-accent/50 rounded shadow-glow z-40 max-h-80 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted font-mono">
              no matches — press Enter to use <span className="text-accent">{q.toUpperCase()}{q.toUpperCase().endsWith(".JK") ? "" : ".JK"}</span>
            </div>
          ) : (
            filtered.map((t, i) => (
              <button
                key={t.symbol}
                onClick={() => pick(t.symbol)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm font-mono transition border-b border-accent/10 last:border-b-0 ${
                  i === highlight ? "bg-accent/15 text-accent" : "text-white/80 hover:bg-accent/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-accent w-16">{t.symbol.replace(".JK", "")}</span>
                  <span className="text-white/80">{t.name}</span>
                </div>
                <span className="text-[10px] text-muted uppercase tracking-wider">{t.sector}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
