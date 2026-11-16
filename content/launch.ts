import { contact } from "./contact";
import { footer } from "./footer";
import { testimonials } from "./testimonials";

/**
 * Temporary content that must be replaced before a public launch (D-111): placeholder contact details,
 * sample testimonials and "#" social links. Read by next.config.ts: strict production launches
 * (DEPLOY_MODE=production) fail while any remain; staging builds warn and stay noindex.
 * Relative imports: next.config.ts loads this file outside the app's path aliases.
 */
export function launchPlaceholders(): string[] {
  const pending: string[] = [];
  if (contact.whatsapp.placeholder) pending.push("WhatsApp number (content/contact.ts)");
  if (contact.email.placeholder) pending.push("contact email (content/contact.ts)");
  if (testimonials.sample) pending.push("sample testimonials (content/testimonials.ts)");
  const unsetSocials = footer.socials.filter((social) => social.href === "#").map((social) => social.label);
  if (unsetSocials.length > 0) pending.push(`social links ${unsetSocials.join(", ")} (content/footer.ts)`);
  return pending;
}
