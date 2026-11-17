import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin session token (D-128): HMAC-signed, expiring. Deliberately no `import "server-only"`: proxy.ts (Node.js
 * runtime, not a React Server Component) imports it to protect /admin before any page renders. Never import it
 * from client code: it reads the session secret from the environment.
 */
export const ADMIN_COOKIE = "rt_admin";
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export type AdminSession = { email: string; expires: number };

export const adminSessionSecret = (env: NodeJS.ProcessEnv = process.env) =>
  env.ADMIN_SESSION_SECRET ?? env.PAYMENT_TOKEN_SECRET ?? env.PAYSTACK_SECRET_KEY ?? "rocktama-demo-admin-session";

export function signAdminSession(email: string, secret = adminSessionSecret(), now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ email, expires: now + ADMIN_SESSION_TTL_MS })).toString("base64url");
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}

export function verifyAdminSession(token: string | undefined, secret = adminSessionSecret(), now = Date.now()): AdminSession | null {
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
