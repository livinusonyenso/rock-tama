import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AccountDashboardLayout, type DashboardLink } from "@/components/account/AccountDashboardLayout";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { routes } from "@/content/routes";
import { driverDashboardAccount } from "@/lib/server/driver-dashboard";

export const metadata: Metadata = { title: "Driver portal", robots: { index: false, follow: false } };

const links: DashboardLink[] = [
  { href: routes.driverDashboard.path, label: "Overview", icon: "layers" },
  { href: routes.driverDeliveries.path, label: "My deliveries", icon: "truck" },
  { href: routes.driverProfile.path, label: "My profile", icon: "user" },
  { href: routes.driverSupport.path, label: "Help & support", icon: "message-circle" },
];

async function DriverWorkspace({ children }: { children: ReactNode }) {
  const account = await driverDashboardAccount();
  if (!account) return <AccountUnavailable retryPath={routes.driverDashboard.path} />;
  return <AccountDashboardLayout identity={account} portal="Driver portal" links={links}>{children}</AccountDashboardLayout>;
}

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line-card bg-ivory-100">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:bg-ivory-100 focus:p-3 focus-ring">
          Skip to driver content
        </a>
        <Container size="wide" className="flex min-h-16 items-center justify-between gap-4 py-2">
          <Link href={routes.driverDashboard.path} className="inline-flex min-h-11 items-center rounded-button focus-ring">
            <Logo variant="header" className="h-9 sm:h-10" />
          </Link>
          <Link href={routes.shop.path} className="inline-flex min-h-11 items-center gap-2 rounded-button px-2 text-sm font-semibold text-forest-heading hover:text-gold-700 focus-ring">
            <Icon name="store" className="size-4" /> Storefront
          </Link>
        </Container>
      </header>
      <Suspense fallback={<main id="main" className="flex-1 bg-ivory-50 p-8 text-center" aria-busy="true">Loading your dashboard…</main>}>
        <DriverWorkspace>{children}</DriverWorkspace>
      </Suspense>
    </>
  );
}
