import "server-only";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { DeliveryConfig } from "@/lib/server/env";
import { enquiryHtml, enquirySubject, enquiryText, type EnquiryRecord } from "@/lib/server/enquiries/format";

export type DeliveryResult = { ok: true } | { ok: false; reason: string };

/** Files sent with a notification, e.g. a bank-transfer receipt (D-124). Already validated by the caller. */
export type Attachment = { filename: string; contentType: string; content: Buffer };

/** Delivers an enquiry with the configured adapter. Never reports success unless delivery succeeded. */
export async function deliverEnquiry(record: EnquiryRecord, config: DeliveryConfig, attachments: readonly Attachment[] = []): Promise<DeliveryResult> {
  switch (config.kind) {
    case "dev-file":
      return deliverToFile(record, config.path, attachments);
    case "resend":
      return deliverWithResend(record, config, attachments);
    case "unconfigured":
      return { ok: false, reason: `Enquiry delivery is not configured: ${config.reason}` };
  }
}

/** Development only: one JSON line per enquiry in a git-ignored file. */
async function deliverToFile(record: EnquiryRecord, path: string, attachments: readonly Attachment[]): Promise<DeliveryResult> {
  try {
    await mkdir(dirname(path), { recursive: true });
    const saved: string[] = [];
    if (attachments.length > 0) {
      const folder = join(dirname(path), "receipts", record.reference);
      await mkdir(folder, { recursive: true });
      for (const file of attachments) {
        await writeFile(join(folder, file.filename), file.content);
        saved.push(join("receipts", record.reference, file.filename));
      }
    }
    await appendFile(path, `${JSON.stringify(saved.length ? { ...record, attachments: saved } : record)}\n`, "utf8");
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: `Could not write the development enquiry store: ${(error as Error).message}` };
  }
}

/** Production: Resend REST API (https://resend.com/docs/api-reference/emails/send-email). */
async function deliverWithResend(
  record: EnquiryRecord,
  config: Extract<DeliveryConfig, { kind: "resend" }>,
  attachments: readonly Attachment[],
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
        ...(attachments.length > 0 && {
          attachments: attachments.map((file) => ({ filename: file.filename, content: file.content.toString("base64") })),
        }),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { ok: false, reason: `Email provider responded ${response.status}.` };
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: `Email provider unreachable: ${(error as Error).message}` };
  }
}
