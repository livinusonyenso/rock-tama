import "server-only";
import { z } from "zod";

/**
 * How enquiries are delivered (D-072). Read at request time, never at module load.
 * - Production: Resend REST API (ENQUIRY_DELIVERY=resend + RESEND_API_KEY + ENQUIRY_TO + ENQUIRY_FROM).
 * - Local development: a git-ignored file store (.data/enquiries.jsonl) by default.
 * - On a hosted platform (Vercel) without configuration: "unconfigured", so forms report an honest error,
 *   and production deploy builds fail (next.config.ts).
 */
export type DeliveryConfig =
  | { kind: "resend"; apiKey: string; baseUrl: string; to: string[]; from: string }
  | { kind: "dev-file"; path: string }
  | { kind: "unconfigured"; reason: string };

const emailList = z
  .string()
  .transform((value) => value.split(",").map((part) => part.trim()).filter(Boolean))
  .pipe(z.array(z.email()).min(1));

export function getDeliveryConfig(env: NodeJS.ProcessEnv = process.env): DeliveryConfig {
  const hosted = Boolean(env.VERCEL);
  const mode = env.ENQUIRY_DELIVERY ?? (hosted ? undefined : "dev-file");

  if (mode === "dev-file") {
    if (hosted) return { kind: "unconfigured", reason: "The development delivery adapter cannot run on a hosted platform." };
    return { kind: "dev-file", path: `${process.cwd()}/.data/enquiries.jsonl` };
  }

  if (mode === "resend") {
    const to = emailList.safeParse(env.ENQUIRY_TO ?? "");
    if (!env.RESEND_API_KEY) return { kind: "unconfigured", reason: "RESEND_API_KEY is not set." };
    if (!to.success) return { kind: "unconfigured", reason: "ENQUIRY_TO must be one or more valid email addresses." };
    if (!env.ENQUIRY_FROM) return { kind: "unconfigured", reason: "ENQUIRY_FROM is not set." };
    return {
      kind: "resend",
      apiKey: env.RESEND_API_KEY,
      baseUrl: env.RESEND_API_BASE_URL ?? "https://api.resend.com",
      to: to.data,
      from: env.ENQUIRY_FROM,
    };
  }

  return { kind: "unconfigured", reason: mode ? `Unknown ENQUIRY_DELIVERY "${mode}".` : "ENQUIRY_DELIVERY is not set." };
}

/** Max enquiry submissions per client per window (default 5 per 10 minutes). */
export const enquiryRateLimit = (env: NodeJS.ProcessEnv = process.env) => ({
  max: Number(env.ENQUIRY_RATE_LIMIT ?? 5),
  windowMs: 10 * 60 * 1000,
});
