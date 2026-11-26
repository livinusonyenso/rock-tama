"use client";
import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Icon } from "@/components/icons/Icon";
import { count, naira, nairaShort } from "@/components/admin/format";

type Metric = "sales" | "orders";
type Props = { labels: string[]; sales: number[]; orders: number[]; change: Record<Metric, number>; comparison: string };

const W = 640, H = 240, PAD = { left: 60, right: 16, top: 16, bottom: 30 };
/** Axis top = 4 × a "nice" step, so every tick label is exact (no rounded 1.125M shown as 1.1M). */
const niceMax = (max: number) => {
  const raw = max / 4, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s >= m)! * p;
  return step * 4;
};

/** Smooth path through points (Catmull-Rom → cubic Bézier), clamped so the curve never overshoots the baseline. */
function smooth(points: [number, number][], floor: number) {
  return points.map((p, i) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const p0 = points[i - 2] ?? points[i - 1], p1 = points[i - 1], p3 = points[i + 1] ?? p;
    const c1y = Math.min(floor, p1[1] + (p[1] - p0[1]) / 6), c2y = Math.min(floor, p[1] - (p3[1] - p1[1]) / 6);
    return `C${p1[0] + (p[0] - p0[0]) / 6},${c1y} ${p[0] - (p3[0] - p1[0]) / 6},${c2y} ${p[0]},${p[1]}`;
  }).join(" ");
}

/**
 * Sales performance (D-128, dataviz): one series at a time (Sales ₦ or Orders, never two axes), recessive grid,
 * 2px line, crosshair + tooltip on hover or arrow keys, table view for screen readers. Client island.
 */
export function SalesChart({ labels, sales, orders, change, comparison }: Props) {
  const [metric, setMetric] = useState<Metric>("sales");
  const [active, setActive] = useState<number | null>(null);
  const gradient = useId();
  const values = metric === "sales" ? sales : orders;
  const format = metric === "sales" ? naira : count;
  const total = values.reduce((a, b) => a + b, 0);
  const max = niceMax(Math.max(...values));
  const x = (i: number) => PAD.left + (i / (values.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
  const base = H - PAD.bottom;
  const points = values.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = smooth(points, base);
  const area = `${line} L${x(values.length - 1)},${base} L${x(0)},${base} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const nearest = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    setActive(Math.max(0, Math.min(values.length - 1, Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * (values.length - 1)))));
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      setActive((i) => Math.max(0, Math.min(values.length - 1, (i ?? values.length - 1) + (event.key === "ArrowRight" ? 1 : -1))));
    }
    if (event.key === "Escape") setActive(null);
  };
  const up = change[metric] >= 0;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="sales-heading" className="font-serif text-2xl font-bold text-forest-850">Sales Performance</h2>
        <div role="group" aria-label="Measure" className="flex rounded-full border border-line-card bg-ivory-50 p-1 text-sm">
          {(["sales", "orders"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={metric === m} onClick={() => { setMetric(m); setActive(null); }}
              className={`min-h-9 cursor-pointer rounded-full px-4 font-semibold focus-ring ${metric === m ? "bg-gold-gradient text-forest-950" : "text-ink-700"}`}>
              {m === "sales" ? "Sales (₦)" : "Orders"}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span data-chart-total className="font-serif text-4xl font-bold text-forest-850 lining-nums">{format(total)}</span>
        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${up ? "text-forest-850" : "text-error"}`}>
          <Icon name={up ? "trending-up" : "trending-down"} className="size-4" />{up ? "+" : ""}{change[metric]}%<span className="sr-only">{up ? " increase" : " decrease"}</span>
        </span>
        <span className="text-sm text-ink-700">{comparison}</span>
      </p>
      <div className="relative mt-3" data-sales-chart>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none focus-ring" role="img" tabIndex={0}
          aria-label={`${metric === "sales" ? "Daily sales" : "Daily orders"} over ${values.length} days, total ${format(total)}. Use the left and right arrow keys to read each day.`}
          onPointerMove={nearest} onPointerLeave={() => setActive(null)} onKeyDown={onKey} onBlur={() => setActive(null)}>
          <defs>
            <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0f7d4a" stopOpacity="0.28" /><stop offset="100%" stopColor="#0f7d4a" stopOpacity="0.02" /></linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-line-card" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.35em" textAnchor="end" className="fill-ink-700 text-[11px]">{metric === "sales" ? nairaShort(t) : count(t)}</text>
            </g>
          ))}
          {labels.map((label, i) => (labels.length - 1 - i) % 4 === 0 && (
            <text key={label} x={x(i)} y={H - 8} textAnchor="middle" className="fill-ink-700 text-[11px]">{label}</text>
          ))}
          <path d={area} fill={`url(#${gradient})`} />
          <path d={line} fill="none" stroke="#0f7d4a" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={5} fill="#fbf4e5" stroke="#cf8a10" strokeWidth={2} />
          {active !== null && (
            <g pointerEvents="none">
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={base} stroke="#0b2a1d" strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={x(active)} cy={y(values[active])} r={5} fill="#0f7d4a" stroke="#fbf4e5" strokeWidth={2} />
            </g>
          )}
        </svg>
        {active !== null && (
          <div role="status" data-chart-tooltip className="pointer-events-none absolute -translate-x-1/2 rounded-button bg-forest-950 px-3 py-2 text-xs text-on-dark shadow-card"
            style={{ left: `${(x(active) / W) * 100}%`, top: `${Math.max(0, (y(values[active]) / H) * 100 - 30)}%` }}>
            <span className="block font-semibold">{labels[active]}</span>{format(values[active])}{metric === "orders" ? " orders" : ""}
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{metric === "sales" ? "Daily sales" : "Daily orders"} (demo data)</caption>
        <thead><tr><th scope="col">Day</th><th scope="col">{metric === "sales" ? "Sales" : "Orders"}</th></tr></thead>
        <tbody>{values.map((v, i) => <tr key={labels[i]}><th scope="row">{labels[i]}</th><td>{format(v)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
