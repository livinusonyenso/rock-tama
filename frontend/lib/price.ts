import type { Price } from "@/types/content";

export const PRICE_ON_REQUEST = "Price on request";

/** Formats a verified price, or "Price on request" when none is set (never an invented price). */
export function formatPrice(price: Price | null): string {
  if (!price) return PRICE_ON_REQUEST;
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: price.currency, maximumFractionDigits: 0 }).format(price.amount);
}
