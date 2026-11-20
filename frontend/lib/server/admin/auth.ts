import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { demoAuthEnabled } from "@/lib/demo-auth";
import { ADMIN_COOKIE, ADMIN_SESSION_TTL_MS, adminSessionSecret, signAdminSession, verifyAdminSession, type AdminSession } from "@/lib/server/admin/session-token";

/**
 * Admin sign-in (D-128, D-133). Real credentials come from ADMIN_EMAIL / ADMIN_PASSWORD and also need a
 * dedicated ADMIN_SESSION_SECRET (32+ characters); without one, sign-in is unavailable. The **demo default
 * login** exists only while demo sign-ins are enabled (see lib/demo-auth.ts): never with DEPLOY_MODE=production,
 * and on a production server only with an explicit DEMO_AUTH=enabled. Anything missing fails closed.
 */
export const DEMO_ADMIN = { email: "admin@rocktama.demo", password: "RockTama-Demo-2026" } as const;

export function adminCredentials(env: NodeJS.ProcessEnv = process.env): { email: string; password: string; demo: boolean } | null {
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    return adminSessionSecret(env) ? { email: env.ADMIN_EMAIL.trim().toLowerCase(), password: env.ADMIN_PASSWORD, demo: false } : null;
  }
  return demoAuthEnabled(env) ? { ...DEMO_ADMIN, demo: true } : null;
}

/** Constant-time comparison of two strings (hash first so lengths can't leak). */
const sameSecret = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export function checkCredentials(email: string, password: string): boolean {
  const expected = adminCredentials();
  if (!expected) return false;
  // Evaluate both comparisons so timing doesn't reveal which part was wrong.
  const emailOk = sameSecret(email.trim().toLowerCase(), expected.email);
  const passwordOk = sameSecret(password, expected.password);
  return emailOk && passwordOk;
}

export async function startAdminSession(email: string) {
  (await cookies()).set(ADMIN_COOKIE, signAdminSession(email.trim().toLowerCase()), {
    httpOnly: true,
    sameSite: "strict",
    // Production servers mark the cookie Secure. Only the demo login on a non-Vercel `next start`
    // (local HTTP preview) omits it; real credentials always get Secure.
    secure: process.env.NODE_ENV === "production" && (!!process.env.VERCEL || !adminCredentials()?.demo),
    path: "/",
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });
}

export async function readAdminSession(): Promise<AdminSession | null> {
  // Request-time only: the expiry check reads the clock, which Cache Components must never prerender (D-129).
  await connection();
  return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
