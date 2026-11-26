import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import styles from "@/components/account/dashboard.module.css";
import { Icon } from "@/components/icons/Icon";
import { routes } from "@/content/routes";
import { accountDashboardSession } from "@/lib/server/account-dashboard";

export default async function CustomerOverviewPage() {
  const session = await accountDashboardSession();
  if (!session) return <AccountUnavailable embedded />;
  if (session.kind !== "customer") redirect(routes.accountDashboard.path);
  const { account } = session;

  return (
    <DashboardPanel path={routes.accountDashboardOverview.path}>
    <section id="dashboard-overview" aria-labelledby="dashboard-overview-heading">
      <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-700">Your ROCK-TAMA account</p>
      <h1 id="dashboard-overview-heading" className="mt-2 font-serif text-3xl font-bold wrap-anywhere text-forest-heading sm:text-4xl">
        Welcome, {account.name}
      </h1>
      <div data-account-status={account.status} role="status" className={`${styles.card} mt-6 p-5 sm:p-6`}>
        <div className="flex items-center gap-3">
          <Icon name="clipboard-check" className="size-6 shrink-0 text-gold-700" />
          <h2 className="font-serif text-2xl font-bold text-forest-heading">Your customer account is ready</h2>
        </div>
        <p className="mt-3 leading-relaxed text-ink-700">Order ROCK-TAMA natural spring water for your home or business. Choose your products, then complete checkout with your delivery details.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={routes.shop.path} className={styles.primary}><Icon name="shopping-cart" className="size-5" />Shop now</Link>
          <Link href={routes.accountDashboardSupport.path} className="flex min-h-12 items-center rounded-button border border-forest-850 px-5 text-sm font-semibold text-forest-850 focus-ring">
            Contact us
          </Link>
        </div>
      </div>
    </section>
    </DashboardPanel>
  );
}
