"use client";

type Row = {
  symbol: string;
  name: string;
  sector: string;
  last: number | null;
  changePct: number | null;
  volume: number | null;
};

function fmt(n: number | null, digits = 2) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default function TickerTable({
  rows,
  onPick,
}: {
  rows: Row[];
  onPick: (symbol: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded border border-accent/30 bg-bg-card shadow-glow-sm">
      <table className="w-full text-sm font-mono">
        <thead className="bg-bg-panel text-accent/70 text-[10px] uppercase tracking-widest border-b border-accent/30">
          <tr>
            <th className="text-left px-4 py-3">&gt; symbol</th>
            <th className="text-left px-4 py-3">name</th>
            <th className="text-left px-4 py-3">sector</th>
            <th className="text-right px-4 py-3">last</th>
            <th className="text-right px-4 py-3">chg_%</th>
            <th className="text-right px-4 py-3">volume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const up = (r.changePct ?? 0) >= 0;
            return (
              <tr
                key={r.symbol}
                onClick={() => onPick(r.symbol)}
                className="border-t border-accent/10 hover:bg-accent/10 transition cursor-pointer"
                title="click for chart + details"
              >
                <td className="px-4 py-3 font-bold text-accent">{r.symbol.replace(".JK", "")}</td>
                <td className="px-4 py-3 text-muted">{r.name}</td>
                <td className="px-4 py-3 text-muted text-xs uppercase tracking-wider">{r.sector}</td>
                <td className="px-4 py-3 text-right">{fmt(r.last)}</td>
                <td className={`px-4 py-3 text-right ${up ? "text-accent" : "text-down"}`}>
                  {r.changePct === null ? "—" : `${up ? "+" : ""}${fmt(r.changePct)}%`}
                </td>
                <td className="px-4 py-3 text-right text-muted">{fmt(r.volume, 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
