import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { contact } from "@/content/contact";
import { emailHref, phoneHref, whatsappHref } from "@/lib/contact";
import { resolveHref } from "@/lib/navigation";
import type { IconName } from "@/types/content";

type Channel = { id: string; icon: IconName; title: string; value: string; text: string; action: string; href: string | null };

type ContactChannelsProps = {
  /** h2 on the Contact page; h3 under the homepage section's h2. */
  headingLevel?: "h2" | "h3";
  /** The Contact page adds a wholesale pointer; the homepage omits it (the supply banner sits right above). */
  withWholesale?: boolean;
};

/**
 * WhatsApp + email cards and an optional wholesale pointer (D-111; homepage reuse D-117). Server Component. A placeholder channel shows its
 * value but its action renders as non-interactive "Coming soon" (ButtonLink with href null).
 */
export function ContactChannels({ headingLevel: Heading = "h2", withWholesale = true }: ContactChannelsProps) {
  const channels: Channel[] = [
    { id: "whatsapp", icon: "message-circle", title: contact.whatsapp.title, value: contact.whatsapp.display, text: contact.whatsapp.text, action: contact.whatsapp.action, href: whatsappHref() },
    { id: "phone", icon: "phone", title: contact.phone.title, value: contact.phone.display, text: contact.phone.text, action: contact.phone.action, href: phoneHref() },
    { id: "email", icon: "mail", title: contact.email.title, value: contact.email.address, text: contact.email.text, action: contact.email.action, href: emailHref() },
  ];

  return (
    <>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <li key={channel.id} data-channel={channel.id}>
            <article aria-labelledby={`contact-${channel.id}`} className="flex h-full flex-col rounded-card border border-line-card bg-cream-200 p-6 shadow-card lg:p-8">
              <span aria-hidden="true" className="flex size-13 items-center justify-center rounded-full bg-sage-200/80 text-forest-heading">
                <Icon name={channel.icon} className="size-7" />
              </span>
              <Heading id={`contact-${channel.id}`} className="mt-4 font-serif text-card-title font-bold text-ink-900">{channel.title}</Heading>
              <p className="mt-1 text-lg font-semibold text-forest-heading wrap-anywhere">{channel.value}</p>
              <p className="mt-2 text-base text-ink-700">{channel.text}</p>
              <div className="mt-auto pt-6">
                <ButtonLink href={channel.href} variant="outline-light" size="sm" surface="light" trailingIcon="chevron-right">{channel.action}</ButtonLink>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {withWholesale && <aside aria-labelledby="contact-wholesale" className="mt-6 flex flex-col gap-4 rounded-card bg-forest-850 p-6 text-on-dark md:flex-row md:items-center md:justify-between lg:p-8">
        <div>
          <h2 id="contact-wholesale" className="font-serif text-card-title font-bold">{contact.wholesale.title}</h2>
          <p className="mt-1 text-base text-on-dark-muted">{contact.wholesale.text}</p>
        </div>
        <ButtonLink href={resolveHref("wholesale")} variant="primary" size="sm" trailingIcon="chevron-right" className="shrink-0">{contact.wholesale.action}</ButtonLink>
      </aside>}
    </>
  );
}
