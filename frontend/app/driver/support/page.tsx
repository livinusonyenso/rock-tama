import type { Metadata } from "next";
import { AccountUnavailable } from "@/components/account/AccountUnavailable";
import { DashboardPanel } from "@/components/account/DashboardPanel";
import styles from "@/components/account/dashboard.module.css";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { contact } from "@/content/contact";
import { routes } from "@/content/routes";
import { emailHref, whatsappChatHref } from "@/lib/contact";
import { driverDashboardAccount } from "@/lib/server/driver-dashboard";

export const metadata: Metadata = { title: "Driver help and support" };

export default async function DriverSupportPage() {
  const account = await driverDashboardAccount();
  const path = routes.driverSupport.path;
  if (!account) return <DashboardPanel path={path}><AccountUnavailable embedded retryPath={path} /></DashboardPanel>;

  const whatsapp = contact.whatsapp.placeholder
    ? null
    : whatsappChatHref(contact.whatsapp.number, "Hello ROCK-TAMA, I need help with my driver account.");

  return (
    <DashboardPanel path={path}>
      <section id="driver-support" aria-labelledby="driver-support-heading">
        <h1 id="driver-support-heading" className="font-serif text-4xl font-bold text-forest-heading">Help &amp; support</h1>
        <p className="mt-2 leading-relaxed text-ink-700">Get help with your driver application, profile updates or an assigned delivery.</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section className={`${styles.card} flex flex-col items-start p-5 sm:p-6`}>
            <Icon name="message-circle" className="size-6 text-gold-700" />
            <h2 className="mt-3 font-serif text-2xl font-bold text-forest-heading">WhatsApp</h2>
            <p className="mt-1 mb-5 text-ink-700">{contact.whatsapp.display}</p>
            <ButtonLink href={whatsapp} variant="outline-light" size="sm" surface="light" className="mt-auto">Message us</ButtonLink>
          </section>
          <section className={`${styles.card} flex flex-col items-start p-5 sm:p-6`}>
            <Icon name="mail" className="size-6 text-gold-700" />
            <h2 className="mt-3 font-serif text-2xl font-bold text-forest-heading">Email</h2>
            <p className="mt-1 mb-5 max-w-full wrap-anywhere text-ink-700">{contact.email.address}</p>
            <ButtonLink href={emailHref()} variant="outline-light" size="sm" surface="light" className="mt-auto">Email us</ButtonLink>
          </section>
        </div>
      </section>
    </DashboardPanel>
  );
}
