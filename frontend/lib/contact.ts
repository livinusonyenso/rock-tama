import { contact } from "@/content/contact";

/** WhatsApp click-to-chat URL for an international number in digits-only format. */
export function whatsappChatHref(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp click-to-chat link, or null while the number is a placeholder (renders as "Coming soon"). */
export function whatsappHref(): string | null {
  const { placeholder, number, greeting } = contact.whatsapp;
  if (placeholder) return null;
  return whatsappChatHref(number, greeting);
}

/** mailto link with a subject, or null while the address is a placeholder. */
export function emailHref(): string | null {
  const { placeholder, address, subject } = contact.email;
  if (placeholder) return null;
  return `mailto:${address}?subject=${encodeURIComponent(subject)}`;
}
