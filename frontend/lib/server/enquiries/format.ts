import "server-only";
import { productBySlug } from "@/content/products";
import { MIXED_PRODUCTS, type Enquiry } from "@/lib/enquiry";

export type EnquiryRecord = Enquiry & { reference: string; receivedAt: string };

export const productLabel = (slug: string) =>
  slug === MIXED_PRODUCTS ? "Several products" : (productBySlug(slug)?.name ?? slug);

export function enquirySubject(record: EnquiryRecord): string {
  return `Wholesale enquiry ${record.reference}: ${productLabel(record.product)} × ${record.quantity} ${record.unit} (${record.name})`;
}

export function enquiryText(record: EnquiryRecord): string {
  return [
    `Reference: ${record.reference}`,
    `Received: ${record.receivedAt}`,
    "",
    `Name / business: ${record.name}`,
    `Email: ${record.email}`,
    `Phone: ${record.phone}`,
    `Product: ${productLabel(record.product)}`,
    `Quantity: ${record.quantity} ${record.unit}`,
    `Delivery location: ${record.location}`,
    "",
    "Additional requirements:",
    record.message || "(none)",
  ].join("\n");
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export function enquiryHtml(record: EnquiryRecord): string {
  return `<pre style="font:14px/1.5 system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(enquiryText(record))}</pre>`;
}
