import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { isStrictLaunch } from "@/lib/server/payments/config";
import { ADMIN_COOKIE, ADMIN_SESSION_TTL_MS, signAdminSession, verifyAdminSession, type AdminSession } from "@/lib/server/admin/session-token";

/**
 * Admin sign-in (D-128). Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD. Until they are set, a **demo
 * default login** works on development and staging only; a strict public launch refuses the default (and the
 * build guard blocks the launch), so a known password can never open the live admin.
 */
export const DEMO_ADMIN = { email: "admin@rocktama.demo", password: "RockTama-Demo-2026" } as const;

export function adminCredentials(env: NodeJS.ProcessEnv = process.env): { email: string; password: string; demo: boolean } | null {
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) return { email: env.ADMIN_EMAIL.trim().toLowerCase(), password: env.ADMIN_PASSWORD, demo: false };
  if (isStrictLaunch(env)) return null;
  return { ...DEMO_ADMIN, demo: true };
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
    secure: process.env.NODE_ENV === "production" && !!process.env.VERCEL,
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
