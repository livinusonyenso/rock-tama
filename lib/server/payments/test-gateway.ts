import "server-only";
import type { PaymentMetadata } from "@/lib/server/payments/order";
import { readPayload, signPayload } from "@/lib/server/payments/token";

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
};

export const createTestToken = (secret: string, payment: TestPayment, ttlMs = 30 * 60 * 1000) => signPayload(secret, payment, ttlMs);
export const readTestToken = (secret: string, token: string | null | undefined) => readPayload<TestPayment>(secret, token);
