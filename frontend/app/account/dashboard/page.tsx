import { redirect } from "next/navigation";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import { DemoOverview } from "@/components/account/DemoDashboardPanels";
import { DistributorOverview } from "@/components/account/DistributorAccountPanels";
import { routes } from "@/content/routes";
import { accountDashboardSession } from "@/lib/server/account-dashboard";

export default async function DashboardPage() {
  const session = await accountDashboardSession();
  if (session?.kind === "customer") redirect(routes.accountDashboardOverview.path);

  return (
    <DashboardPanel path={routes.accountDashboard.path}>
      {!session ? <AccountUnavailable embedded /> : session.kind === "demo"
        ? <DemoOverview email={session.email} />
        : <DistributorOverview account={session.account} />}
    </DashboardPanel>
  );
}
