import "server-only";
import { basketSchema, naira, priceBasket, type PaymentMetadata, type PricedBasket } from "@/lib/server/payments/order";
import { getPaymentConfig, type PaymentConfig } from "@/lib/server/payments/config";
import { verifyTransaction } from "@/lib/server/payments/paystack";
import { readTestToken } from "@/lib/server/payments/test-gateway";
import { deliverEnquiry } from "@/lib/server/enquiries/deliver";
import { getDeliveryConfig } from "@/lib/server/env";
import { MIXED_PRODUCTS } from "@/lib/enquiry";
import { deliverPaymentReceipt } from "@/lib/server/payments/receipt";
import { variantById } from "@/content/commerce";

export type VerifiedPayment =
  | { status: "paid"; reference: string; amountKobo: number; channel: string | null; test: boolean; paidAt: string | null; metadata: PaymentMetadata; basket: PricedBasket }
  | { status: "failed" | "pending"; reference: string }
  | { status: "invalid"; reference: string; reason: string };

const isMetadata = (value: unknown): value is PaymentMetadata => {
  const meta = value as PaymentMetadata | null;
  return !!meta?.customer && typeof meta.customer.email === "string" && basketSchema.safeParse(meta.lines).success;
};

/**
 * Verifies a payment with its provider (D-122). Paid only when the provider says "success" AND the amount
 * equals the server-side price of the basket carried with the payment AND the currency is NGN.
 * Read-only: safe to call while rendering the confirmation page.
 */
export async function verifyPayment(reference: string, token?: string | null, config: PaymentConfig = getPaymentConfig()): Promise<VerifiedPayment> {
  if (!/^RT-PAY-\d{8}-[A-Z0-9]{8}$/.test(reference)) return { status: "invalid", reference, reason: "Unknown payment reference." };

  if (config.kind === "test") {
    const payment = readTestToken(config.secret, token);
    if (!payment || payment.reference !== reference) return { status: "invalid", reference, reason: "This test payment could not be verified." };
    if (payment.outcome !== "success") return { status: payment.outcome === "failed" ? "failed" : "pending", reference };
    return check(reference, payment.amountKobo, "NGN", null, true, payment.metadata);
  }
  if (config.kind === "paystack") {
    try {
      const tx = await verifyTransaction(config, reference);
      if (tx.reference !== reference) return { status: "invalid", reference, reason: "Reference mismatch." };
      if (tx.status !== "success") return { status: tx.status === "pending" ? "pending" : "failed", reference };
      return check(reference, tx.amountKobo, tx.currency, tx.channel, !config.live, tx.metadata, tx.paidAt);
    } catch (error) {
      console.error(`[payment] verification failed (${reference}): ${(error as Error).message}`);
      return { status: "pending", reference };
    }
  }
  return { status: "invalid", reference, reason: "Online payment is not configured." };
}

function check(reference: string, amountKobo: number, currency: string, channel: string | null, test: boolean, metadata: unknown, paidAt: string | null = null): VerifiedPayment {
  if (!isMetadata(metadata)) return { status: "invalid", reference, reason: "The order details for this payment are missing." };
  const basket = priceBasket(metadata.lines);
  if (basket.unpriced.length > 0 || currency !== "NGN" || amountKobo !== basket.totalKobo) {
    console.error(`[payment] amount check failed (${reference}): paid ${amountKobo} ${currency}, expected ${basket.totalKobo} NGN`);
    return { status: "invalid", reference, reason: "The amount paid does not match the order. Our team will contact you." };
  }
  return { status: "paid", reference, amountKobo, channel, test, paidAt, metadata, basket };
}

// Per-instance de-duplication: the browser return and the webhook can both confirm the same payment.
const notified = new Set<string>();
const receipts = new Set<string>();
const inFlight = new Map<string, Promise<boolean>>();

/**
 * Sends the merchant notification and customer receipt separately (email in production).
 * Failed channels remain retryable; webhook returns 500 until both adapters accept delivery.
 * Called only after verifyPayment() returned "paid", from the return handler and the webhook.
 */
export async function notifyPaidOrder(payment: Extract<VerifiedPayment, { status: "paid" }>): Promise<boolean> {
  if (payment.status !== "paid") return false;
  const existing = inFlight.get(payment.reference);
  if (existing) return existing;
  const task = notifyBoth(payment);
  inFlight.set(payment.reference, task);
  try { return await task; } finally { inFlight.delete(payment.reference); }
}

async function notifyBoth(payment: Extract<VerifiedPayment, { status: "paid" }>): Promise<boolean> {
  if (notified.has(payment.reference) && receipts.has(payment.reference)) return true;
  const { customer } = payment.metadata;
  const single = payment.basket.lines.length === 1 ? payment.basket.lines[0] : null;
  const variant = single ? variantById(single.variantId) : undefined;
  const result = notified.has(payment.reference) ? { ok: true as const } : await deliverEnquiry(
    {
      reference: payment.reference,
      receivedAt: new Date().toISOString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      product: variant ? variant.product : MIXED_PRODUCTS,
      // Same convention as the order request: mixed baskets are expressed in bottles (draft carton = 12 bottles).
      quantity: single ? single.quantity * (variant?.unit === "cartons" ? 1 : (variant?.bottles ?? 1)) : payment.basket.lines.reduce((n, l) => { const v = variantById(l.variantId); return n + l.quantity * (v?.unit === "cartons" ? 12 : (v?.bottles ?? 1)); }, 0),
      unit: variant?.unit === "cartons" ? "cartons" : "bottles",
      location: `${customer.address}, ${customer.city}, ${customer.state}`,
      consent: "yes",
      message: [
        payment.test ? "TEST PAYMENT — no money was charged. Do not fulfil." : "PAID ONLINE via Paystack. Fulfil after confirming in the Paystack dashboard.",
        `Amount paid: ${naira(payment.amountKobo)}${payment.channel ? ` (${payment.channel})` : ""}`,
        ...payment.basket.lines.map((l) => `${l.quantity} × ${l.label} (${l.detail}) — ${naira(l.lineKobo ?? 0)}`),
        "Delivery fee not included: arrange with the customer.",
        customer.notes ? `Delivery notes: ${customer.notes}` : "",
      ].filter(Boolean).join("\n"),
    },
    getDeliveryConfig(),
  );
  if (!result.ok) {
    console.error(`[payment] order notification failed (${payment.reference}): ${result.reason}`);
  } else {
    notified.add(payment.reference);
  }
  const receipt = receipts.has(payment.reference) ? { ok: true as const } : await deliverPaymentReceipt(payment, getDeliveryConfig());
  if (receipt.ok) receipts.add(payment.reference);
  else console.error(`[payment] customer receipt failed (${payment.reference}): ${receipt.reason}`);
  return result.ok && receipt.ok;
}
