import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { ProfileCard } from "./AccountDashboardLayout";
import { DashboardBasketCount } from "./DashboardBasketCount";
import styles from "./dashboard.module.css";

const samples = [
  { id: "DEMO-1003", product: "Pack of 12 · 750 ml", quantity: "4 packs", status: "Processing", tone: "gold" },
  { id: "DEMO-1002", product: "Carton · 12 × 1.5 L", quantity: "2 cartons", status: "In transit", tone: "green" },
  { id: "DEMO-1001", product: "Pack of 12 · 750 ml", quantity: "6 packs", status: "Delivered", tone: "green" },
];

export function demoDisplayName(email: string) {
  return email.split("@")[0].replace(/[._-]+/g, " ") || "Distributor";
}

export function DemoDashboardNotice() {
  return (
    <div className={`${styles.notice} mb-6`} role="note">
      <Icon name="image" className="size-5 shrink-0" />
      <p><strong>Demo dashboard.</strong> Orders and status labels are examples. No real account, orders or distributor approval exist.</p>
    </div>
  );
}

export function DemoOverview({ email }: { email: string }) {
  return (
    <section id="dashboard-overview" aria-labelledby="dashboard-overview-heading">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-700">Your ROCK-TAMA workspace</p>
          <h1 id="dashboard-overview-heading" className="mt-2 font-serif text-3xl font-bold wrap-anywhere text-forest-heading sm:text-4xl">
            Welcome, <span className="capitalize">{demoDisplayName(email)}</span>
          </h1>
          <p className="mt-2 text-sm text-ink-700">Explore your distributor dashboard and plan your next order.</p>
        </div>
        <Link href="/shop" className={styles.primary}><Icon name="shopping-cart" className="size-5" />Start an order</Link>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}><Icon name="package-search" className="text-gold-700" /><span>Sample orders</span><strong>{samples.length}</strong><small>Illustrative order history</small></div>
        <div className={styles.stat}><Icon name="shopping-cart" className="text-gold-700" /><span>Your basket</span><DashboardBasketCount /><small>Selections saved in this browser</small></div>
        <div className={styles.stat}><Icon name="user" className="text-gold-700" /><span>Account access</span><strong className="!text-2xl">Demo only</strong><small>Business approval not granted</small></div>
      </div>
    </section>
  );
}

export function DemoOrders() {
  return (
    <section id="sample-orders" className={styles.card} aria-labelledby="sample-orders-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-card p-5 sm:p-6">
        <div>
          <h1 id="sample-orders-heading" className="font-serif text-2xl font-bold text-forest-heading">Sample orders</h1>
          <p className="mt-1 text-sm text-ink-500">Sample data — no orders have been placed.</p>
        </div>
        <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-gold-700">DEMO</span>
      </div>
      <ul className="divide-y divide-line-card">
        {samples.map(order => (
          <li key={order.id} className={styles.order}>
            <div>
              <p className="text-xs font-semibold tracking-wide text-gold-700">{order.id}</p>
              <h2 className="mt-1 font-serif text-xl font-semibold">{order.product}</h2>
              <p className="mt-1 text-sm text-ink-500">{order.quantity} · Sample order</p>
            </div>
            <span className={order.tone === "gold" ? styles.goldStatus : styles.greenStatus}>{order.status}</span>
            <details className={styles.details}>
              <summary>View sample</summary>
              <p className="mt-3 text-sm leading-relaxed">This is an example of an order for {order.quantity}. No payment, shipment or delivery is associated with this record.</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DemoProfile({ email }: { email: string }) {
  return <ProfileCard heading="h1" rows={[
    ["Demo email", email],
    ["Business profile", "Not connected"],
    ["Distributor approval", "Not assessed in demo mode"],
  ]} note="Your real business profile is available from your distributor account." />;
}

export function DemoSupplyHelp() {
  return (
    <section className={`${styles.card} mt-6 bg-cream-200 p-5 sm:p-6`} aria-labelledby="supply-help-heading">
      <Icon name="warehouse" className="size-8 text-gold-700" />
      <h2 id="supply-help-heading" className="mt-4 font-serif text-2xl font-bold text-forest-heading">Let’s plan your supply</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">Tell our team about your business, delivery location and the products you need.</p>
      <Link href="/wholesale#enquiry" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold-700 underline focus-ring">
        Request a quotation<Icon name="arrow-right" className="size-4" />
      </Link>
    </section>
  );
}
