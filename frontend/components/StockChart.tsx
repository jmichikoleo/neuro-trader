"use client";
import { useMemo, useState } from "react";

type Point = { date: string; close: number };
export type ChartMarker = { date: string; label: string; price?: number };

export default function StockChart({
  series,
  markers = [],
  height = 240,
}: {
  series: Point[];
  markers?: ChartMarker[];
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, w, h, pad, minY, maxY, xStep, markerPts } = useMemo(() => {
    const w = 760;
    const h = height;
    const pad = { l: 50, r: 12, t: 12, b: 24 };
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;
    const closes = series.map((p) => p.close);
    const minY = Math.min(...closes);
    const maxY = Math.max(...closes);
    const range = maxY - minY || 1;
    const xStep = series.length > 1 ? innerW / (series.length - 1) : innerW;
    const pts = series.map((p, i) => {
      const x = pad.l + i * xStep;
      const y = pad.t + (1 - (p.close - minY) / range) * innerH;
      return [x, y] as const;
    });
    const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const area =
      pts.length > 0
        ? `${path} L ${pts[pts.length - 1][0].toFixed(1)} ${pad.t + innerH} L ${pts[0][0].toFixed(1)} ${pad.t + innerH} Z`
        : "";

    // Match markers to series points by closest date.
    const seriesDates = series.map((p) => +new Date(p.date));
    const markerPts = markers
      .map((m) => {
        const target = +new Date(m.date);
        let bestI = -1;
        let bestD = Infinity;
        for (let i = 0; i < seriesDates.length; i++) {
          const d = Math.abs(seriesDates[i] - target);
          if (d < bestD) { bestD = d; bestI = i; }
        }
        if (bestI < 0) return null;
        // Only show marker if it's reasonably close (within 2 weeks for daily, more lenient otherwise)
        const maxGapMs = 14 * 86400 * 1000;
        if (bestD > maxGapMs * 4) return null;
        const [x, y] = pts[bestI];
        return { ...m, x, y, idx: bestI };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    return { path, area, w, h, pad, minY, maxY, xStep, markerPts };
  }, [series, markers, height]);

  if (series.length === 0) {
    return <div className="text-muted text-sm font-mono">no chart data</div>;
  }

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = maxY - (i * (maxY - minY)) / yTicks;
    const y = pad.t + (i * (h - pad.t - pad.b)) / yTicks;
    return { v, y };
  });

  // X labels: 6 evenly spaced
  const xCount = Math.min(6, series.length);
  const xLabels = Array.from({ length: xCount }, (_, i) => {
    const idx = Math.floor((i * (series.length - 1)) / (xCount - 1 || 1));
    return { idx, x: pad.l + idx * xStep, label: series[idx].date.slice(0, 7) };
  });

  function fmt(n: number) {
    if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRel = ((e.clientX - rect.left) * w) / rect.width;
    const idx = Math.round((xRel - pad.l) / xStep);
    if (idx >= 0 && idx < series.length) setHover(idx);
  }

  const hoverPt = hover !== null ? series[hover] : null;
  const hoverX = hover !== null ? pad.l + hover * xStep : 0;
  const hoverY =
    hover !== null
      ? pad.t + (1 - (series[hover].close - minY) / (maxY - minY || 1)) * (h - pad.t - pad.b)
      : 0;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="ntfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff2d95" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff2d95" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y-grid */}
        {yLabels.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={t.y}
              y2={t.y}
              stroke="#3d0f3a"
              strokeDasharray="2 4"
              strokeWidth="0.5"
            />
            <text
              x={pad.l - 6}
              y={t.y + 3}
              textAnchor="end"
              fontSize="9"
              fill="#8a6d8a"
              fontFamily="monospace"
            >
              {fmt(t.v)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {xLabels.map((t, i) => (
          <text
            key={i}
            x={t.x}
            y={h - 6}
            textAnchor="middle"
            fontSize="9"
            fill="#8a6d8a"
            fontFamily="monospace"
          >
            {t.label}
          </text>
        ))}

        {/* area + line */}
        <path d={area} fill="url(#ntfill)" />
        <path d={path} fill="none" stroke="#ff2d95" strokeWidth="1.5" />

        {/* elliott wave markers */}
        {markerPts.length > 1 && (
          <path
            d={markerPts.map((m, i) => `${i === 0 ? "M" : "L"} ${m.x.toFixed(1)} ${m.y.toFixed(1)}`).join(" ")}
            fill="none"
            stroke="#ffd54a"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.85"
          />
        )}
        {markerPts.map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r={4} fill="#ffd54a" stroke="#0a0010" strokeWidth="1.2" />
            <rect
              x={m.x - 13}
              y={m.y - 22}
              width={26}
              height={14}
              rx={2}
              fill="#0a0010"
              stroke="#ffd54a"
              strokeWidth="0.8"
            />
            <text
              x={m.x}
              y={m.y - 12}
              textAnchor="middle"
              fontSize="9"
              fill="#ffd54a"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* hover crosshair */}
        {hoverPt && (
          <g>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={pad.t}
              y2={h - pad.b}
              stroke="#ff5ab0"
              strokeWidth="0.6"
              strokeDasharray="2 3"
            />
            <circle cx={hoverX} cy={hoverY} r={3.5} fill="#ff2d95" stroke="#0a0010" strokeWidth="1" />
          </g>
        )}
      </svg>

      {/* hover tooltip */}
      {hoverPt && (
        <div
          className="absolute top-2 right-2 bg-bg border border-accent/50 rounded px-2 py-1 text-[10px] font-mono text-accent shadow-glow-sm pointer-events-none"
        >
          {hoverPt.date} · {fmt(hoverPt.close)}
        </div>
      )}
    </div>
  );
}
