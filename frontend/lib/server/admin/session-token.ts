import { createHmac, timingSafeEqual } from "node:crypto";
import { demoAuthEnabled } from "@/lib/demo-auth";

/**
 * Admin session token (D-128): HMAC-signed, expiring. Deliberately no `import "server-only"`: proxy.ts (Node.js
 * runtime, not a React Server Component) imports it to protect /admin before any page renders. Never import it
 * from client code: it reads the session secret from the environment.
 */
export const ADMIN_COOKIE = "rt_admin";
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export type AdminSession = { email: string; expires: number };

export const ADMIN_SESSION_SECRET_MIN_LENGTH = 32;
const DEMO_ADMIN_SESSION_SECRET = "rocktama-demo-admin-session";

/**
 * Signing secret for the admin cookie (D-133), or null when admin sessions must be refused (fail closed).
 * A dedicated ADMIN_SESSION_SECRET of at least 32 characters is required; it never falls back to payment
 * keys. The public demo secret is used only for the demo login, never alongside real credentials.
 */
export function adminSessionSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const secret = env.ADMIN_SESSION_SECRET?.trim();
  if (secret && secret.length >= ADMIN_SESSION_SECRET_MIN_LENGTH) return secret;
  const realCredentials = Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD);
  return demoAuthEnabled(env) && !realCredentials ? DEMO_ADMIN_SESSION_SECRET : null;
}

export function signAdminSession(email: string, secret = adminSessionSecret(), now = Date.now()): string {
  if (!secret) throw new Error("Admin sessions are not configured (ADMIN_SESSION_SECRET).");
  const body = Buffer.from(JSON.stringify({ email, expires: now + ADMIN_SESSION_TTL_MS })).toString("base64url");
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}

export function verifyAdminSession(token: string | undefined, secret = adminSessionSecret(), now = Date.now()): AdminSession | null {
  if (!secret) return null;
  const [body, signature] = String(token ?? "").split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("base64url"));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminSession;
    return typeof session.email === "string" && typeof session.expires === "number" && session.expires > now ? session : null;
  } catch {
    return null;
  }
}
