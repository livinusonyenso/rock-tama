import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { PaymentMetadata } from "@/lib/server/payments/order";
import { readPayload, signPayload } from "@/lib/server/payments/token";

/**
 * The order between "Continue to payment" and payment (D-124): customer + basket in a signed, httpOnly,
 * short-lived cookie. Keeps personal details out of URLs and browser history; no database needed.
 * Prices are never stored: every step re-prices the basket on the server.
 */
export type PendingOrder = PaymentMetadata & { orderRef: string };

const COOKIE = "rt_order";
const TTL_MS = 60 * 60 * 1000;
export const paymentTokenSecret = () =>
  process.env.PAYMENT_TOKEN_SECRET ?? process.env.PAYSTACK_SECRET_KEY ?? process.env.PAYMENT_TEST_SECRET ?? "rocktama-test-gateway";

/** Order reference customers quote in a bank transfer narration: RT-ORD-YYYYMMDD-XXXXXX. */
export function newOrderReference(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `RT-ORD-${date}-${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`;
}

export async function savePendingOrder(order: PendingOrder) {
  (await cookies()).set(COOKIE, signPayload(paymentTokenSecret(), order, TTL_MS), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !!process.env.VERCEL,
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function readPendingOrder(): Promise<PendingOrder | null> {
  // Expiry must use the request clock, never an instant-navigation prerender.
  await connection();
  return readPayload<PendingOrder>(paymentTokenSecret(), (await cookies()).get(COOKIE)?.value);
}

export async function clearPendingOrder() {
  (await cookies()).delete(COOKIE);
}

export const PENDING_ORDER_COOKIE = COOKIE;
