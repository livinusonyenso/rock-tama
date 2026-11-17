import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentMetadata } from "@/lib/server/payments/order";

/**
 * Built-in test gateway (D-122, the "dummy flow" until Paystack keys are added). The pending payment travels
 * in an HMAC-signed token, so the amount and basket can't be altered in the browser. No money moves.
 */
export type TestPayment = {
  reference: string;
  amountKobo: number;
  email: string;
  metadata: PaymentMetadata;
  outcome?: "success" | "failed";
  expires: number;
};

const sign = (secret: string, body: string) => createHmac("sha256", secret).update(body).digest("base64url");

export function createTestToken(secret: string, payment: Omit<TestPayment, "expires">, ttlMs = 30 * 60 * 1000): string {
  const body = Buffer.from(JSON.stringify({ ...payment, expires: Date.now() + ttlMs })).toString("base64url");
  return `${body}.${sign(secret, body)}`;
}

export function readTestToken(secret: string, token: string | null | undefined): TestPayment | null {
  const [body, signature] = String(token ?? "").split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(secret, body));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const payment = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TestPayment;
    return payment.expires > Date.now() ? payment : null;
  } catch {
    return null;
  }
}
