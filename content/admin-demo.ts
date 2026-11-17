import { variantById } from "@/content/commerce";
import type { IconName } from "@/types/content";

/**
 * DEMO DATA for the admin dashboard (D-128). The site has no database yet: orders and enquiries are delivered
 * by email, so there are no live figures to show. Everything here is illustrative and the dashboard says so.
 * Built from the real catalogue and prices so it stays internally consistent:
 * - product revenue = units × shop price; the 30-day sales series is scaled to sum exactly to that revenue;
 * - channel counts add up to total orders; recent-order totals = quantity × price.
 * Replace this module with real queries once orders are stored (same shapes).
 */

export const DEMO_PERIOD = { label: "Last 30 days", range: "1 – 30 Mar 2026", days: 30, startDay: 1, month: "Mar" } as const;

const price = (id: string) => variantById(id)?.amount ?? 0;

type TopProduct = { id: string; name: string; units: number; unit: string; image: string; revenue: number };
export const topProducts: TopProduct[] = [
  { id: "1500-carton", name: "Carton (12 × 1.5 L)", units: 820, unit: "cartons", image: "/images/products/carton-closed-front.webp" },
  { id: "750-pack12", name: "Pack of 12 (750 ml)", units: 1120, unit: "packs", image: "/images/products/carton-packs.webp" },
  { id: "750-single", name: "750 ml Bottle", units: 6400, unit: "bottles", image: "/images/products/750ml-glass-bottle.webp" },
].map((p) => ({ ...p, revenue: p.units * price(p.id) }));

const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);

/** Deterministic, gently rising daily curve scaled so the 30 days sum exactly to the product revenue. */
function series(total: number, base: number, slope: number, wave: number, phase: number): number[] {
  const raw = Array.from({ length: DEMO_PERIOD.days }, (_, i) => Math.max(1, base + i * slope + wave * Math.sin(i * 0.9 + phase)));
  const scale = total / raw.reduce((a, b) => a + b, 0);
  const rounded = raw.map((v) => Math.round(v * scale));
  rounded[rounded.length - 1] += total - rounded.reduce((a, b) => a + b, 0);
  return rounded;
}

const TOTAL_ORDERS = 1248;
export const dailySales = series(totalRevenue, 420, 22, 70, 0); // naira per day
export const dailyOrders = series(TOTAL_ORDERS, 28, 0.9, 5, 0.6); // orders per day

type Kpi = { id: string; label: string; value: number; format: "naira" | "number"; suffix?: string; change: number; icon: IconName };
export const kpis: Kpi[] = [
  { id: "sales", label: "Total Sales", value: totalRevenue, format: "naira", change: 18.6, icon: "coins" },
  { id: "orders", label: "Total Orders", value: TOTAL_ORDERS, format: "number", change: 16.2, icon: "shopping-cart" },
  { id: "enquiries", label: "Wholesale Enquiries", value: 37, format: "number", change: 23.3, icon: "handshake" },
  { id: "inventory", label: "Inventory Stock", value: 28460, format: "number", suffix: "units", change: -5.1, icon: "boxes" },
  { id: "customers", label: "Customers", value: 9320, format: "number", change: 14.8, icon: "users" },
];

/** Orders by channel: shares of total orders (last channel takes the rounding remainder). */
const shares = [
  { id: "online", label: "Online Store", share: 0.62, color: "#0f7d4a" },
  { id: "wholesale", label: "Wholesale", share: 0.24, color: "#cf8a10" },
  { id: "retail", label: "Retail Partners", share: 0.1, color: "#4b84e0" },
  { id: "corporate", label: "Corporate / Events", share: 0.04, color: "#b5482c" },
] as const;
export const channels = shares.map((c, i) => ({
  ...c,
  orders: i < shares.length - 1 ? Math.round(TOTAL_ORDERS * c.share) : TOTAL_ORDERS - shares.slice(0, -1).reduce((n, s) => n + Math.round(TOTAL_ORDERS * s.share), 0),
}));

export type OrderStatus = "Processing" | "Shipped" | "Delivered";
/** Short pack names for the orders table. */
const shortName: Record<string, string> = { "750-single": "750 ml", "750-pack12": "Pack of 12", "1500-carton": "Carton (12 × 1.5 L)" };
const order = (ref: string, customer: string, channel: string, variant: string, quantity: number, status: OrderStatus) =>
  ({ ref, customer, channel, product: `${shortName[variant] ?? variant} × ${quantity}`, total: price(variant) * quantity, status });
export const recentOrders = [
  order("RT-10486", "Greenview Hotel", "Wholesale", "1500-carton", 20, "Processing"),
  order("RT-10485", "Emeka O.", "Online Store", "750-single", 2, "Shipped"),
  order("RT-10484", "Lagos Continental", "Corporate", "750-pack12", 15, "Processing"),
  order("RT-10483", "Amina B.", "Online Store", "750-pack12", 1, "Delivered"),
  order("RT-10482", "BluePeak Retail", "Retail Partner", "1500-carton", 10, "Shipped"),
];

export const lowStock = [
  { item: "750 ml Bottle", level: 420, unit: "units" },
  { item: "Pack of 12 (750 ml)", level: 95, unit: "packs" },
  { item: "Carton (12 × 1.5 L)", level: 85, unit: "cartons" },
];

/** Sidebar badge counts (demo). */
export const badges = { orders: 12, enquiries: 4, notifications: 3 } as const;
