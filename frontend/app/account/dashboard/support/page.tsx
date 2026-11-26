import type { Metadata } from "next";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import { DemoSupplyHelp } from "@/components/account/DemoDashboardPanels";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { routes } from "@/content/routes";
import { accountDashboardSession } from "@/lib/server/account-dashboard";

export const metadata: Metadata = { title: "Help & support" };

export default async function AccountSupportPage() {
  const session = await accountDashboardSession();
  if (!session) return <AccountUnavailable embedded />;

  return (
    <DashboardPanel path={routes.accountDashboardSupport.path}>
      <section aria-labelledby="dashboard-support-heading">
        <h1 id="dashboard-support-heading" className="font-serif text-3xl font-bold text-forest-heading">Help &amp; support</h1>
        <p className="mt-2 mb-6 leading-relaxed text-ink-700">Contact our team with questions about an order or delivery.</p>
        <ContactChannels withWholesale={false} />
        {session.kind !== "customer" && <DemoSupplyHelp />}
      </section>
    </DashboardPanel>
  );
}
