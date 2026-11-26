import type { Metadata } from "next";
import { ProfileCard, formatAddress, rows } from "@/components/account/AccountDashboardLayout";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import { DemoProfile } from "@/components/account/DemoDashboardPanels";
import { DistributorProfile } from "@/components/account/DistributorAccountPanels";
import { routes } from "@/content/routes";
import { accountDashboardSession } from "@/lib/server/account-dashboard";

export const metadata: Metadata = { title: "My profile" };

export default async function AccountProfilePage() {
  const session = await accountDashboardSession();
  if (!session) return <AccountUnavailable embedded />;

  return (
    <DashboardPanel path={routes.accountDashboardProfile.path}>
      {session.kind === "demo" ? <DemoProfile email={session.email} />
        : session.kind === "distributor" ? <DistributorProfile account={session.account} />
        : <ProfileCard heading="h1" rows={rows([
          ["Name", session.account.name],
          ["Email", session.account.email],
          ["Phone", session.account.phone ?? "Not provided"],
          ["Delivery address", formatAddress(session.account.profile.address) ?? session.account.location],
          ["Account type", "Customer"],
        ])} />}
    </DashboardPanel>
  );
}
