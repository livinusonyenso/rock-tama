import { count } from "@/components/admin/format";

type Channel = { id: string; label: string; orders: number; color: string };

/**
 * Orders by channel (D-128). Owner's design asks for a donut; dataviz guidance prefers a segmented bar for
 * part-to-whole, so the donut always ships with a legend carrying the exact counts and percentages (identity is
 * never colour alone; the gold's low contrast is relieved by visible labels). Validated palette (D-128).
 * 2px surface gaps between segments; each segment has a native tooltip. Server Component.
 */
export function ChannelDonut({ channels }: { channels: Channel[] }) {
  const total = channels.reduce((n, c) => n + c.orders, 0);
  const R = 70, C = 2 * Math.PI * R, GAP = 2;
  // Start position of each segment along the circle (cumulative share of the earlier segments).
  const starts = channels.map((_, i) => channels.slice(0, i).reduce((sum, c) => sum + (c.orders / total) * C, 0));
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row">
      <svg viewBox="0 0 200 200" className="w-48 shrink-0 -rotate-90" role="img" aria-label={`Orders by channel, ${count(total)} total: ${channels.map((c) => `${c.label} ${c.orders}`).join(", ")}`}>
        {channels.map((c, i) => {
          const length = (c.orders / total) * C;
          return <circle key={c.id} data-channel={c.id} cx={100} cy={100} r={R} fill="none" stroke={c.color} strokeWidth={30} strokeDasharray={`${Math.max(0, length - GAP)} ${C}`} strokeDashoffset={-starts[i]}><title>{`${c.label}: ${count(c.orders)} orders (${Math.round((c.orders / total) * 100)}%)`}</title></circle>;
        })}
        <g className="rotate-90 [transform-origin:100px_100px]">
          <text x={100} y={96} textAnchor="middle" className="fill-forest-850 font-serif text-[30px] font-bold">{count(total)}</text>
          <text x={100} y={118} textAnchor="middle" className="fill-ink-700 text-[12px]">Total Orders</text>
        </g>
      </svg>
      <ul className="w-full space-y-3 text-sm">
        {channels.map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ background: c.color }} />
            <span className="flex-1 text-ink-900">{c.label}</span>
            <span className="font-semibold text-ink-900 lining-nums">{count(c.orders)}</span>
            <span className="w-12 text-right text-ink-700 lining-nums">({Math.round((c.orders / total) * 100)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
