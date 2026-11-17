import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** HMAC-signed, expiring payload (base64url JSON + signature). Tamper-evident, not encrypted: never put secrets in it. */
export function signPayload<T extends object>(secret: string, payload: T, ttlMs: number): string {
  const body = Buffer.from(JSON.stringify({ ...payload, expires: Date.now() + ttlMs })).toString("base64url");
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}

export function readPayload<T extends object>(secret: string, token: string | null | undefined): (T & { expires: number }) | null {
  const [body, signature] = String(token ?? "").split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("base64url"));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { expires: number };
    return typeof payload.expires === "number" && payload.expires > Date.now() ? payload : null;
  } catch {
    return null;
  }
}
