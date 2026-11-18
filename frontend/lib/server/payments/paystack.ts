import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentConfig } from "@/lib/server/payments/config";
import type { PaymentMetadata } from "@/lib/server/payments/order";

type Paystack = Extract<PaymentConfig, { kind: "paystack" }>;
type InitializeInput = { email: string; amountKobo: number; reference: string; callbackUrl: string; metadata: PaymentMetadata; channels?: string[] };
export type ProviderTransaction = {
  status: "success" | "failed" | "abandoned" | "pending";
  reference: string;
  amountKobo: number;
  currency: string;
  paidAt: string | null;
  channel: string | null;
  metadata: unknown;
};

const call = async (config: Paystack, path: string, init?: RequestInit) => {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${config.secretKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as { status?: boolean; message?: string; data?: Record<string, unknown> } | null;
  if (!response.ok || !body?.status || !body.data) throw new Error(`Paystack ${path} failed (${response.status}): ${body?.message ?? "no response body"}`);
  return body.data;
};

/** https://paystack.com/docs/api/transaction/#initialize — returns the hosted payment page URL. */
export async function initializeTransaction(config: Paystack, input: InitializeInput): Promise<string> {
  const data = await call(config, "/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      ...(input.channels && { channels: input.channels }),
    }),
  });
  const url = String(data.authorization_url ?? "");
  if (!url.startsWith("https://") && !url.startsWith(config.baseUrl)) throw new Error("Paystack returned no authorization URL.");
  return url;
}

/** https://paystack.com/docs/api/transaction/#verify — the only source of truth for a payment's outcome. */
export async function verifyTransaction(config: Paystack, reference: string): Promise<ProviderTransaction> {
  const data = await call(config, `/transaction/verify/${encodeURIComponent(reference)}`);
  const status = String(data.status);
  return {
    status: status === "success" || status === "failed" || status === "abandoned" ? status : "pending",
    reference: String(data.reference ?? ""),
    amountKobo: Number(data.amount),
    currency: String(data.currency ?? ""),
    paidAt: typeof data.paid_at === "string" ? data.paid_at : null,
    channel: typeof data.channel === "string" ? data.channel : null,
    metadata: typeof data.metadata === "string" ? safeJson(data.metadata) : data.metadata,
  };
}

const safeJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

/** Webhook authenticity: x-paystack-signature = HMAC-SHA512(raw body, secret key). Constant-time comparison. */
export function isValidWebhookSignature(secretKey: string, rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha512", secretKey).update(rawBody).digest("hex"));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
