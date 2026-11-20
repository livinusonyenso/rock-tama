import "server-only";
import { cookies } from "next/headers";

/**
 * Server-only access to the Express API (D-134). API_URL is read at request time and never reaches the
 * browser: it has no NEXT_PUBLIC_ prefix, and this module is server-only.
 */
export const SESSION_COOKIE_NAMES = ["__Host-rocktama_session", "rocktama_session"] as const;

export type DistributorAccount = {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string | null;
  location: string | null;
  role: "distributor";
  status: "pending" | "approved";
  canAccessDistributorFeatures: boolean;
};

export type AccountState =
  | { state: "signed-in"; account: DistributorAccount }
  | { state: "signed-out" }
  | { state: "unavailable" };

/** The API origin from API_URL (for example http://127.0.0.1:4000), or null when unset or malformed. */
export function apiBaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  const url = URL.parse(env.API_URL?.trim() ?? "");
  if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
  if (url.pathname !== "/" || url.search || url.hash) return null;
  return url.origin;
}

/** Keep only the session cookie, so storefront cookies (basket, checkout, admin, demo) never reach the API. */
export function sessionCookieHeader(header: string | null | undefined): string | null {
  const names = new Set<string>(SESSION_COOKIE_NAMES);
  const kept = (header ?? "").split(";").map((part) => part.trim()).filter((part) => names.has(part.split("=", 1)[0]));
  return kept.length ? kept.join("; ") : null;
}

function isAccount(value: unknown): value is DistributorAccount {
  const user = value as DistributorAccount | null;
  return !!user && typeof user.id === "string" && typeof user.email === "string" && user.role === "distributor"
    && typeof user.name === "string" && typeof user.company === "string"
    && (user.phone === null || typeof user.phone === "string") && (user.location === null || typeof user.location === "string")
    && (user.status === "pending" || user.status === "approved")
    && user.canAccessDistributorFeatures === (user.status === "approved");
}

/**
 * Who is signed in, decided by Express on every call (never cached). Use inside <Suspense>: it reads cookies().
 * "unavailable" means the API could not answer; callers must not treat it as signed in.
 */
export async function currentAccount(env: NodeJS.ProcessEnv = process.env): Promise<AccountState> {
  const jar = await cookies();
  const cookie = sessionCookieHeader(jar.getAll().map(({ name, value }) => `${name}=${value}`).join("; "));
  if (!cookie) return { state: "signed-out" };
  const base = apiBaseUrl(env);
  if (!base) return { state: "unavailable" };
  try {
    const response = await fetch(`${base}/api/v1/auth/me`, {
      headers: { cookie, accept: "application/json" },
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (response.status === 401) return { state: "signed-out" };
    if (!response.ok) return { state: "unavailable" };
    const body = (await response.json()) as { user?: unknown };
    return isAccount(body.user) ? { state: "signed-in", account: body.user } : { state: "unavailable" };
  } catch {
    return { state: "unavailable" };
  }
}
