import { Icon } from "@/components/icons/Icon";
import type { DriverSampleDelivery } from "@/lib/server/driver-samples";
import styles from "./dashboard.module.css";

const statuses = {
  scheduled: { label: "Scheduled", icon: "calendar", badge: styles.goldStatus },
  inTransit: { label: "In transit", icon: "truck", badge: "w-fit rounded-full bg-forest-700 px-3 py-1 text-xs font-semibold text-on-dark" },
  delivered: { label: "Delivered", icon: "clipboard-check", badge: styles.greenStatus },
} as const;

export function DriverDeliverySummary({ deliveries }: { deliveries: readonly DriverSampleDelivery[] }) {
  return (
    <section aria-labelledby="driver-sample-summary">
      <h2 id="driver-sample-summary" className="font-serif text-2xl font-bold text-forest-heading">Sample delivery summary</h2>
      <dl className="mt-3 grid grid-cols-3 gap-2 sm:gap-4">
        {Object.entries(statuses).map(([status, { label, icon }]) => (
          <div key={status} className={`${styles.card} p-3 sm:p-5`}>
            <Icon name={icon} className="size-5 text-gold-700" />
            <dt className="mt-2 text-sm leading-tight text-ink-700">{label}</dt>
            <dd className="mt-1 font-serif text-3xl font-bold leading-none text-forest-heading">
              {deliveries.filter(delivery => delivery.status === status).length}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function DriverSampleDeliveryList({ deliveries }: { deliveries: readonly DriverSampleDelivery[] }) {
  return (
    <>
      <p className="mt-2 text-ink-700">Sample data for the demo driver. Delivery details are fictional.</p>
      <ul className="mt-5 grid gap-4">
        {deliveries.map(delivery => {
          const { label, badge } = statuses[delivery.status];
          return (
            <li key={delivery.reference} className={`${styles.card} p-4 sm:p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gold-700">{delivery.reference}</p>
                <span className={badge}>{label}</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-forest-heading">{delivery.area}</h2>
              <p className="mt-1 text-sm text-ink-700">{delivery.destination}</p>
              <dl className="mt-4 grid gap-3 border-t border-line-card pt-3 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-2 text-sm text-ink-500"><Icon name="package" className="size-4 text-gold-700" /> Load</dt>
                  <dd className="mt-1 font-semibold text-forest-heading">{delivery.load}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm text-ink-500"><Icon name="calendar" className="size-4 text-gold-700" /> {delivery.status === "delivered" ? "Completed" : "Delivery window"}</dt>
                  <dd className="mt-1 font-semibold text-forest-heading">{delivery.timing}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}
