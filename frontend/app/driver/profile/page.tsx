import type { Metadata } from "next";
import Link from "next/link";
import { formatAddress, optionLabel, rows } from "@/components/account/AccountDashboardLayout";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import styles from "@/components/account/dashboard.module.css";
import { Icon } from "@/components/icons/Icon";
import { availabilities, vehicleTypes } from "@/content/accounts";
import { routes } from "@/content/routes";
import { driverDashboardAccount } from "@/lib/server/driver-dashboard";
import type { IconName } from "@/types/content";

export const metadata: Metadata = { title: "My driver profile" };

function ProfileDetails({ heading, icon, details }: { heading: string; icon: IconName; details: [string, string][] }) {
  return (
    <section className={`${styles.card} p-5 sm:p-6`}>
      <h2 className="flex items-center gap-3 font-serif text-2xl font-bold text-forest-heading">
        <Icon name={icon} className="size-5 shrink-0 text-gold-700" />{heading}
      </h2>
      <dl className="mt-4 grid gap-4 min-[30rem]:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0 border-t border-line-card pt-3">
            <dt className="text-sm text-ink-500">{label}</dt>
            <dd className="mt-1 font-semibold wrap-anywhere text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function DriverProfilePage() {
  const account = await driverDashboardAccount();
  const path = routes.driverProfile.path;
  if (!account) return <DashboardPanel path={path}><AccountUnavailable embedded retryPath={path} /></DashboardPanel>;

  const { profile } = account;
  const id = profile.idType && profile.idLast4
    ? `${profile.idType === "nin" ? "NIN" : "Driver’s licence"} •••• ${profile.idLast4}`
    : null;

  return (
    <DashboardPanel path={path}>
      <section id="account-profile" aria-labelledby="profile-heading">
        <h1 id="profile-heading" className="font-serif text-4xl font-bold text-forest-heading">My profile</h1>
        <p className="mt-2 text-ink-700">
          Need to update your details?{" "}
          <Link href={routes.driverSupport.path} className="rounded-sm font-semibold text-gold-700 underline underline-offset-4 focus-ring">
            Contact support
          </Link>
          .
        </p>
        <div className="mt-5 grid gap-4">
          <ProfileDetails heading="Contact details" icon="user" details={[
            ["Name", account.name],
            ["Email", account.email],
            ["Phone", account.phone ?? "Not provided"],
            ["Home address", formatAddress(profile.address) ?? account.location ?? "Not provided"],
          ]} />
          <ProfileDetails heading="Vehicle and coverage" icon="truck" details={[
            ["Vehicle", optionLabel(vehicleTypes, account.vehicleType) ?? "Not provided"],
            ["Plate number", profile.plateNumber ?? "Not provided"],
            ["Operating area", profile.operatingArea ?? "Not provided"],
            ["Availability", optionLabel(availabilities, profile.availability) ?? "Not provided"],
          ]} />
          {(id || profile.licenceExpiry) && (
            <ProfileDetails heading="Identification" icon="clipboard-check" details={rows([
              ["ID on file", id],
              ["Licence expiry", profile.licenceExpiry],
            ])} />
          )}
        </div>
      </section>
    </DashboardPanel>
  );
}
