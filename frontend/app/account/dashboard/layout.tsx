import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { endDemoSession } from "@/app/account/demo-actions";
import { AccountDashboardLayout, type DashboardLink } from "@/components/account/AccountDashboardLayout";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DemoDashboardNotice, demoDisplayName } from "@/components/account/DemoDashboardPanels";
import { routes } from "@/content/routes";
import { accountDashboardSession } from "@/lib/server/account-dashboard";

export const metadata: Metadata = { title: "My account", robots: { index: false, follow: false } };

async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await accountDashboardSession();
  if (!session) return <AccountUnavailable />;

  const customer = session.kind === "customer";
  const demo = session.kind === "demo";
  const identity = demo
    ? { name: demoDisplayName(session.email), role: "demo" as const, subtitle: "Demo workspace" }
    : { name: session.account.name, role: session.account.role, subtitle: session.account.company ?? undefined };
  const links: DashboardLink[] = [
    { href: customer ? routes.accountDashboardOverview.path : routes.accountDashboard.path, label: "Overview", icon: "layers" },
  ];
  if (customer || demo) links.push({
    href: routes.accountDashboardOrders.path,
    label: demo ? "Sample orders" : "My orders",
    icon: "package",
  });
  links.push(
    { href: routes.accountDashboardProfile.path, label: "My profile", icon: "user" },
    { href: routes.accountDashboardSupport.path, label: "Help & support", icon: "message-circle" },
  );
  const demoLogout = demo ? (
    <form action={endDemoSession}>
      <button type="submit" className="min-h-11 w-full text-left text-sm underline underline-offset-4 focus-ring-dark">Log out</button>
    </form>
  ) : undefined;

  return (
    <AccountDashboardLayout identity={identity} portal={customer ? "My account" : "Distributor portal"} links={links} logout={demoLogout}>
      {demo && <DemoDashboardNotice />}
      {children}
    </AccountDashboardLayout>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main id="main" className="flex-1 bg-ivory-50 p-12 text-center" aria-busy="true">Loading your dashboard…</main>}>
      <AccountLayout>{children}</AccountLayout>
    </Suspense>
  );
}
