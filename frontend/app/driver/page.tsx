import { optionLabel } from "@/components/account/AccountDashboardLayout";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import { DriverDeliverySummary } from "@/components/account/DriverSampleDeliveries";
import styles from "@/components/account/dashboard.module.css";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { availabilities, vehicleTypes } from "@/content/accounts";
import { routes } from "@/content/routes";
import { driverDashboardAccount } from "@/lib/server/driver-dashboard";
import { driverSampleDeliveries } from "@/lib/server/driver-samples";

export default async function DriverOverviewPage() {
  const account = await driverDashboardAccount();
  const path = routes.driverDashboard.path;
  if (!account) return <DashboardPanel path={path}><AccountUnavailable embedded retryPath={path} /></DashboardPanel>;

  const { profile } = account;
  const approved = account.status === "approved";
  const samples = driverSampleDeliveries(account);
  const details = [
    { label: "Vehicle", value: optionLabel(vehicleTypes, account.vehicleType), icon: "truck" },
    { label: "Operating area", value: profile.operatingArea, icon: "map-pin" },
    { label: "Availability", value: optionLabel(availabilities, profile.availability), icon: "calendar" },
  ] as const;

  return (
    <DashboardPanel path={path}>
      <div className="grid gap-5 lg:gap-6">
        <section id="dashboard-overview" aria-labelledby="driver-welcome" className="rounded-card bg-linear-to-br from-forest-950 to-forest-700 p-5 text-on-dark sm:p-8">
          <p className="text-sm font-semibold text-gold-500">Driver overview</p>
          <h1 id="driver-welcome" className="mt-2 font-serif text-4xl leading-none font-bold wrap-anywhere sm:text-5xl">
            Welcome, {account.name}
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-on-dark-muted">
            {samples
              ? "Preview a delivery day with sample stops, delivery windows, and statuses."
              : approved
                ? "Check your assigned deliveries and keep your contact and vehicle details up to date."
                : "Review your application status and make sure we have the right contact and vehicle details."}
          </p>
          <ButtonLink
            href={approved ? routes.driverDeliveries.path : routes.driverProfile.path}
            variant="primary"
            size="sm"
            trailingIcon="arrow-right"
            className="mt-6"
          >
            {samples ? "View sample deliveries" : approved ? "View deliveries" : "View profile"}
          </ButtonLink>
        </section>

        {samples && <DriverDeliverySummary deliveries={samples} />}

        <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          <section data-account-status={account.status} aria-labelledby="driver-status" className={`${styles.card} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-button bg-cream-200 text-gold-700">
                <Icon name={approved ? "clipboard-check" : "calendar"} className="size-5" />
              </span>
              <span className={approved ? styles.greenStatus : styles.goldStatus}>{approved ? "Approved" : "Pending review"}</span>
            </div>
            <h2 id="driver-status" className="mt-4 font-serif text-2xl font-bold text-forest-heading">
              {approved ? "You are an approved driver" : "Application under review"}
            </h2>
            <p className="mt-2 leading-relaxed text-ink-700">
              {approved
                ? "When the logistics team assigns a delivery, it will appear under My deliveries."
                : "Our logistics team will review your application and contact you by phone or email. You can receive deliveries after approval."}
            </p>
          </section>

          <section aria-labelledby="driver-vehicle" className={`${styles.card} p-5 sm:p-6`}>
            <h2 id="driver-vehicle" className="font-serif text-2xl font-bold text-forest-heading">Vehicle and availability</h2>
            <dl className="mt-2 divide-y divide-line-card">
              {details.map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-3 py-2.5">
                  <Icon name={icon} className="mt-1 size-4 shrink-0 text-gold-700" />
                  <div className="min-w-0">
                    <dt className="text-sm text-ink-500">{label}</dt>
                    <dd className="font-semibold wrap-anywhere text-forest-heading">{value ?? "Not provided"}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </DashboardPanel>
  );
}
