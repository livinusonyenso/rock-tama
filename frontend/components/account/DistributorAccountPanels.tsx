import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { businessTypes, monthlyVolumes } from "@/content/accounts";
import type { DistributorAccount } from "@/lib/server/api";
import { ProfileCard, formatAddress, optionLabel, rows } from "./AccountDashboardLayout";
import styles from "./dashboard.module.css";

export function DistributorOverview({ account }: { account: DistributorAccount }) {
  const approved = account.canAccessDistributorFeatures;
  return (
    <section id="dashboard-overview" aria-labelledby="dashboard-overview-heading">
      <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-700">Your ROCK-TAMA account</p>
      <h1 id="dashboard-overview-heading" className="mt-2 font-serif text-3xl font-bold wrap-anywhere text-forest-heading sm:text-4xl">
        Welcome, {account.name}
      </h1>
      <div data-account-status={account.status} role="status" className={`${styles.card} mt-6 p-5 sm:p-6`}>
        <div className="flex items-center gap-3">
          <Icon name={approved ? "clipboard-check" : "calendar"} className="size-6 shrink-0 text-gold-700" />
          <h2 className="font-serif text-2xl font-bold text-forest-heading">{approved ? "Distributor account approved" : "Application pending review"}</h2>
        </div>
        <p className="mt-3 leading-relaxed text-ink-700">
          {approved
            ? "Your business is approved as a ROCK-TAMA distributor. Distributor ordering tools are being prepared; until then, browse products or contact our supply team."
            : `Thank you for applying, ${account.company}. Our team reviews every distributor application before distributor access is granted, and will contact you by email or phone. You can still shop as a guest in the meantime.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/shop" className={styles.primary}><Icon name="shopping-cart" className="size-5" />Browse products</Link>
          <Link href="/wholesale#enquiry" className="flex min-h-12 items-center rounded-button border border-forest-850 px-5 text-sm font-semibold text-forest-850 focus-ring">Contact supply team</Link>
        </div>
      </div>
    </section>
  );
}

const yesNo = (value: boolean | undefined) => value === undefined ? null : value ? "Yes" : "No";

export function DistributorProfile({ account }: { account: DistributorAccount }) {
  const details = account.profile;
  return <ProfileCard heading="h1" rows={rows([
    ["Contact person", account.name],
    ["Position", details.position],
    ["Business", account.company],
    ["Type of business", optionLabel(businessTypes, details.businessType)],
    ["CAC number", details.cacNumber],
    ["Email", account.email],
    ["Phone", account.phone ?? "Not provided"],
    ["Business address", formatAddress(details.address) ?? account.location ?? "Not provided"],
    ["Areas to supply", details.supplyAreas],
    ["Expected monthly volume", optionLabel(monthlyVolumes, details.monthlyVolume)],
    ["Storage space", yesNo(details.hasStorage)],
    ["Own delivery vehicle", yesNo(details.hasVehicle)],
    ["Account status", account.canAccessDistributorFeatures ? "Approved distributor" : "Pending review"],
  ])} />;
}
