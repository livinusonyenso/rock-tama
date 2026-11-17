import "server-only";
import { z } from "zod";
import { variantById, type BasketLine } from "@/content/commerce";

/** Basket lines as submitted from the browser: validated, de-duplicated, bounded. Prices are never taken from the client. */
export const basketSchema = z
  .array(z.object({ variantId: z.string().refine((id) => !!variantById(id)), quantity: z.number().int().min(1).max(10000) }))
  .min(1)
  .max(5)
  .refine((lines) => new Set(lines.map((l) => l.variantId)).size === lines.length);

export type PricedLine = { variantId: string; quantity: number; label: string; detail: string; unitKobo: number | null; lineKobo: number | null };
export type PricedBasket = { lines: PricedLine[]; totalKobo: number; unpriced: PricedLine[] };

/** Prices a basket from the server-side price list (content/commerce.ts). Amounts in kobo (₦1 = 100 kobo). */
export function priceBasket(lines: readonly BasketLine[]): PricedBasket {
  const priced = lines.map(({ variantId, quantity }) => {
    const variant = variantById(variantId)!;
    const unitKobo = variant.amount === null ? null : Math.round(variant.amount * 100);
    return { variantId, quantity, label: variant.label, detail: variant.detail, unitKobo, lineKobo: unitKobo === null ? null : unitKobo * quantity };
  });
  return {
    lines: priced,
    totalKobo: priced.reduce((sum, line) => sum + (line.lineKobo ?? 0), 0),
    unpriced: priced.filter((line) => line.unitKobo === null),
  };
}

export const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(kobo / 100);

/** Payment reference shown to the customer and used with the provider: RT-PAY-YYYYMMDD-XXXXXXXX. */
export function newPaymentReference(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `RT-PAY-${date}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

/** Order details carried with the payment (Paystack metadata / signed test token), so no database is needed. */
export type PaymentMetadata = {
  customer: { name: string; email: string; phone: string; address: string; city: string; state: string; notes: string };
  lines: BasketLine[];
};
