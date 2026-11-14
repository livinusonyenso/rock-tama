"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { enquirySchema, HONEYPOT_FIELD, type EnquiryField, type EnquiryFormState } from "@/lib/enquiry";
import { deliverEnquiry } from "@/lib/server/enquiries/deliver";
import { enquiryRateLimit, getDeliveryConfig } from "@/lib/server/env";
import { isRateLimited } from "@/lib/server/rate-limit";

const FAILED = "Your enquiry could not be sent right now. Please try again in a few minutes.";

/** Short, human-readable reference shown to the customer and included in the email. */
function newReference(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `RT-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

/**
 * Wholesale / product enquiry Server Action (F1). Validates on the server, applies spam
 * protection, delivers through the configured adapter, and reports success only after
 * delivery succeeded (D-066).
 */
export async function submitEnquiry(_previous: EnquiryFormState, formData: FormData): Promise<EnquiryFormState> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && key !== HONEYPOT_FIELD && !key.startsWith("$")) values[key] = value;
  }

  // Spam protection 1: hidden honeypot field. Humans never fill it; nothing is delivered.
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") {
    return { status: "error", message: FAILED, values };
  }

  // Spam protection 2: per-client rate limit.
  const requestHeaders = await headers();
  const client = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  const { max, windowMs } = enquiryRateLimit();
  if (isRateLimited(`enquiry:${client}`, max, windowMs)) {
    return { status: "error", message: "Too many enquiries were sent from this connection. Please wait a few minutes and try again.", values };
  }

  const parsed = enquirySchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors as Partial<Record<EnquiryField, string[]>>;
    const fieldErrors = Object.fromEntries(
      Object.entries(flat).map(([field, messages]) => [field, messages?.[0] ?? "Check this field."]),
    ) as Partial<Record<EnquiryField, string>>;
    return { status: "invalid", fieldErrors, values };
  }

  const record = { ...parsed.data, reference: newReference(), receivedAt: new Date().toISOString() };
  const result = await deliverEnquiry(record, getDeliveryConfig());
  if (!result.ok) {
    console.error(`[enquiry] delivery failed (${record.reference}): ${result.reason}`);
    return { status: "error", message: FAILED, values };
  }

  return { status: "success", reference: record.reference, email: record.email };
}
