import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ChannelDonut } from "@/components/admin/ChannelDonut";
import { SalesChart } from "@/components/admin/SalesChart";
import { count, naira } from "@/components/admin/format";
import { Icon } from "@/components/icons/Icon";
import { adminCopy } from "@/content/admin";
import { DEMO_PERIOD, channels, dailyOrders, dailySales, kpis, lowStock, recentOrders, topProducts, type OrderStatus } from "@/content/admin-demo";
import { readAdminSession } from "@/lib/server/admin/auth";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

const card = "min-w-0 rounded-card border border-line-card bg-white/70 p-5 shadow-card";
const statusStyle: Record<OrderStatus, string> = {
  Processing: "bg-gold-500/20 text-gold-800",
  Shipped: "bg-forest-850/10 text-forest-850",
  Delivered: "bg-forest-850 text-on-dark",
};
const comingSoon = (label: string) => (
  <span data-coming-soon className="inline-flex cursor-default items-center gap-1 text-sm font-semibold text-ink-500">{label}<span className="text-xs font-normal">({adminCopy.comingSoon})</span></span>
);

/** /admin (D-128): protected by proxy.ts; the session is checked again here (defence in depth). */
export default function AdminDashboardPage() {
  const labels = dailySales.map((_, i) => `${DEMO_PERIOD.startDay + i} ${DEMO_PERIOD.month}`);
  return (
    <AdminShell account={<Suspense fallback={<span className="size-11" />}><AdminAccount /></Suspense>}>
      <p data-demo-notice role="note" className="mb-5 flex items-center gap-2 rounded-button border border-gold-700/50 bg-cream-200 px-4 py-2 text-sm text-ink-900"><Icon name="triangle-alert" className="size-4 shrink-0 text-gold-700" />{adminCopy.demoNotice}</p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl font-bold text-forest-850">Business Overview</h2>
        <p className="flex items-center gap-2 rounded-button border border-line-card bg-white/70 px-4 py-2 text-sm"><Icon name="calendar" className="size-5 text-forest-850" /><span className="font-semibold">{DEMO_PERIOD.label}</span><span className="text-ink-700">({DEMO_PERIOD.range}, demo)</span></p>
      </div>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" aria-label="Key figures">
        {kpis.map((k) => {
          const up = k.change >= 0;
          return (
            <li key={k.id} data-kpi={k.id} className={card}>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Icon name={k.icon} className="size-7 text-gold-700" />{k.label}</p>
              <p className="mt-3 font-serif text-3xl font-bold whitespace-nowrap text-forest-850 lining-nums xl:text-2xl 2xl:text-3xl">{k.format === "naira" ? naira(k.value) : count(k.value)}{k.suffix && <span className="ml-1 text-xl">{k.suffix}</span>}</p>
              <p className={`mt-1 flex items-center gap-1 text-sm font-semibold ${up ? "text-forest-850" : "text-error"}`}><Icon name={up ? "trending-up" : "trending-down"} className="size-4" />{up ? "+" : ""}{k.change}%<span className="sr-only">{up ? " increase" : " decrease"}</span></p>
              <p className="text-xs text-ink-700">vs. previous 30 days</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="sales-heading" className={card}>
          <SalesChart labels={labels} sales={dailySales} orders={dailyOrders} change={{ sales: kpis[0].change, orders: kpis[1].change }} comparison="vs. previous 30 days" />
        </section>
        <section aria-labelledby="channel-heading" className={card}>
          <h2 id="channel-heading" className="mb-4 font-serif text-2xl font-bold text-forest-850">Orders by Channel</h2>
          <ChannelDonut channels={channels} />
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-5">
          <section aria-labelledby="orders-heading" className={card}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><h2 id="orders-heading" className="font-serif text-2xl font-bold text-forest-850">Recent Orders</h2>{comingSoon("View all orders")}</div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-160 text-left text-sm">
                <thead><tr className="bg-cream-200 text-ink-900"><th scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">Order No.</th><th scope="col" className="px-3 py-2 font-semibold">Customer</th><th scope="col" className="px-3 py-2 font-semibold">Channel</th><th scope="col" className="px-3 py-2 font-semibold">Products</th><th scope="col" className="px-3 py-2 text-right font-semibold">Total</th><th scope="col" className="px-3 py-2 font-semibold">Status</th></tr></thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.ref} data-order={o.ref} className="border-b border-line-card last:border-0">
                      <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{o.ref}</td><td className="px-3 py-2.5">{o.customer}</td>
                      <td className="px-3 py-2.5"><span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs whitespace-nowrap">{o.channel}</span></td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{o.product}</td><td className="px-3 py-2.5 text-right whitespace-nowrap lining-nums">{naira(o.total)}</td>
                      <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[o.status]}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="actions-heading" className="relative isolate min-w-0 overflow-hidden rounded-card bg-forest-850 p-5 text-on-dark">
            <Image src="/images/hero/waterfall-bg.webp" alt="" aria-hidden="true" fill sizes="(min-width: 1280px) 60vw, 100vw" className="-z-20 object-cover object-[50%_80%] opacity-35" />
            <h2 id="actions-heading" className="font-serif text-2xl font-bold">Quick Actions</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {([["Create Order", "shopping-cart"], ["Add Product", "package"], ["Update Inventory", "boxes"]] as const).map(([label, icon]) => (
                <li key={label}><span data-coming-soon className="flex min-h-24 cursor-default flex-col items-center justify-center gap-2 rounded-button border border-gold-500/60 bg-forest-950/40 p-3 text-center text-sm font-semibold"><Icon name={icon} className="size-7 text-gold-500" />{label}<span className="text-xs font-normal text-on-dark-muted">{adminCopy.comingSoon}</span></span></li>
              ))}
              <li><Link href="/wholesale#enquiry" className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-button border border-gold-500 bg-forest-950/40 p-3 text-center text-sm font-semibold transition-colors hover:bg-forest-950/70 focus-ring-dark"><Icon name="handshake" className="size-7 text-gold-500" />New Wholesale Enquiry</Link></li>
            </ul>
          </section>
        </div>

        <div className="grid min-w-0 content-start gap-5">
          <section aria-labelledby="stock-heading" className={card}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><h2 id="stock-heading" className="font-serif text-2xl font-bold text-forest-850">Low-Stock Alerts</h2>{comingSoon("View inventory")}</div>
            <ul className="mt-3 divide-y divide-line-card">
              {lowStock.map((s) => (
                <li key={s.item} className="flex items-center gap-3 py-2.5 text-sm"><Icon name="triangle-alert" className="size-5 text-error" /><span className="flex-1">{s.item}</span><span className="rounded-full bg-error/10 px-2 py-0.5 font-semibold text-error lining-nums">{count(s.level)} {s.unit}<span className="sr-only"> left (low stock)</span></span></li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="top-heading" className={card}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><h2 id="top-heading" className="font-serif text-2xl font-bold text-forest-850">Top-Selling Products</h2>{comingSoon("View products")}</div>
            <ol className="mt-3 divide-y divide-line-card">
              {topProducts.map((p, i) => (
                <li key={p.id} data-top-product={p.id} className="flex items-center gap-3 py-3 text-sm">
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-bold text-forest-950">{i + 1}</span>
                  <Image src={p.image} alt="" width={56} height={56} className="size-14 shrink-0 object-contain" />
                  <span className="flex-1"><span className="block font-semibold">{p.name}</span><span className="text-ink-700">{count(p.units)} {p.unit} sold</span></span>
                  <span className="font-serif text-lg font-bold text-forest-850 lining-nums">{naira(p.revenue)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

/** Signed-in admin chip; re-checks the session server-side (proxy.ts already redirects anonymous visitors). */
async function AdminAccount() {
  const session = await readAdminSession();
  if (!session) redirect("/auth/admin");
  const initials = session.email.slice(0, 2).toUpperCase();
  return <span title={session.email} data-admin-account className="flex size-11 items-center justify-center rounded-full bg-forest-850 font-semibold text-on-dark">{initials === "AD" ? "RT" : initials}<span className="sr-only">Signed in as {session.email}</span></span>;
}
