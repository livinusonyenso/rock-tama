import type { Metadata } from "next";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import { DriverSampleDeliveryList } from "@/components/account/DriverSampleDeliveries";
import styles from "@/components/account/dashboard.module.css";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { routes } from "@/content/routes";
import { driverDashboardAccount } from "@/lib/server/driver-dashboard";
import { driverSampleDeliveries } from "@/lib/server/driver-samples";

export const metadata: Metadata = { title: "My deliveries" };

export default async function DriverDeliveriesPage() {
  const account = await driverDashboardAccount();
  const path = routes.driverDeliveries.path;
  if (!account) return <DashboardPanel path={path}><AccountUnavailable embedded retryPath={path} /></DashboardPanel>;
  const approved = account.status === "approved";
  const samples = driverSampleDeliveries(account);

  return (
    <DashboardPanel path={path}>
      <section id="my-deliveries" aria-labelledby="deliveries-heading">
        <h1 id="deliveries-heading" className="font-serif text-4xl font-bold text-forest-heading">My deliveries</h1>
        {samples ? <DriverSampleDeliveryList deliveries={samples} /> : (
          <div className={`${styles.card} mt-5 grid justify-items-center p-6 text-center sm:p-12`}>
            <span className="grid size-14 place-items-center rounded-full bg-sage-100 text-forest-heading">
              <Icon name={approved ? "package-search" : "calendar"} className="size-7" />
            </span>
            <h2 className="mt-4 font-serif text-2xl font-bold text-forest-heading">
              {approved ? "No deliveries assigned" : "Awaiting approval"}
            </h2>
            <p data-deliveries-empty className="mt-2 max-w-md leading-relaxed text-ink-700">
              {approved
                ? "New assignments from the logistics team will appear here."
                : "Deliveries are assigned after your application is approved."}
            </p>
            <ButtonLink href={approved ? routes.driverSupport.path : routes.driverDashboard.path} variant="outline-light" size="sm" surface="light" className="mt-5">
              {approved ? "Get delivery help" : "Check application status"}
            </ButtonLink>
          </div>
        )}
      </section>
    </DashboardPanel>
  );
}
