import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import { DemoOrders } from "@/components/account/DemoDashboardPanels";
import styles from "@/components/account/dashboard.module.css";
import { Icon } from "@/components/icons/Icon";
import { routes } from "@/content/routes";
import { accountDashboardSession } from "@/lib/server/account-dashboard";

export const metadata: Metadata = { title: "My orders" };

export default async function CustomerOrdersPage() {
  const session = await accountDashboardSession();
  if (!session) return <AccountUnavailable embedded />;
  if (session.kind === "distributor") redirect(routes.accountDashboard.path);

  return (
    <DashboardPanel path={routes.accountDashboardOrders.path}>
    {session.kind === "demo" ? <DemoOrders /> : (
    <section id="my-orders" className={`${styles.card} p-5 sm:p-6`} aria-labelledby="orders-heading">
      <div className="flex items-center gap-3">
        <Icon name="package" className="size-6 shrink-0 text-gold-700" />
        <h1 id="orders-heading" className="font-serif text-2xl font-bold text-forest-heading">My orders</h1>
      </div>
      <p className="mt-3 leading-relaxed text-ink-700">Your orders and their delivery status will appear here soon.</p>
      <Link href={routes.shop.path} className={`${styles.primary} mt-5 w-fit`}>Shop now</Link>
    </section>
    )}
    </DashboardPanel>
  );
}
