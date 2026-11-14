import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { DeliveryConfig } from "@/lib/server/env";
import { enquiryHtml, enquirySubject, enquiryText, type EnquiryRecord } from "@/lib/server/enquiries/format";

export type DeliveryResult = { ok: true } | { ok: false; reason: string };

/** Delivers an enquiry with the configured adapter. Never reports success unless delivery succeeded. */
export async function deliverEnquiry(record: EnquiryRecord, config: DeliveryConfig): Promise<DeliveryResult> {
  switch (config.kind) {
    case "dev-file":
      return deliverToFile(record, config.path);
    case "resend":
      return deliverWithResend(record, config);
    case "unconfigured":
      return { ok: false, reason: `Enquiry delivery is not configured: ${config.reason}` };
  }
}

/** Development only: one JSON line per enquiry in a git-ignored file. */
async function deliverToFile(record: EnquiryRecord, path: string): Promise<DeliveryResult> {
  try {
    await mkdir(dirname(path), { recursive: true });
    await appendFile(path, `${JSON.stringify(record)}\n`, "utf8");
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: `Could not write the development enquiry store: ${(error as Error).message}` };
  }
}

/** Production: Resend REST API (https://resend.com/docs/api-reference/emails/send-email). */
async function deliverWithResend(
  record: EnquiryRecord,
  config: Extract<DeliveryConfig, { kind: "resend" }>,
): Promise<DeliveryResult> {
  try {
    const response = await fetch(`${config.baseUrl}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.from,
        to: config.to,
        reply_to: record.email,
        subject: enquirySubject(record),
        text: enquiryText(record),
        html: enquiryHtml(record),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { ok: false, reason: `Email provider responded ${response.status}.` };
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: `Email provider unreachable: ${(error as Error).message}` };
  }
}
