import "server-only";
import { cookies } from "next/headers";
import { vehicleTypes, type AccountRole, type VehicleType } from "@/content/accounts";

/**
 * Server-only access to the Express API (D-134). API_URL is read at request time and never reaches the
 * browser: it has no NEXT_PUBLIC_ prefix, and this module is server-only.
 */
export const SESSION_COOKIE_NAMES = ["__Host-rocktama_session", "rocktama_session"] as const;

/** The signed-in user from GET /me (D-137). company is set for distributors, vehicleType for drivers. */
export type Account = {
  id: string;
  email: string;
  name: string;
  company: string | null;
  phone: string | null;
  location: string | null;
  role: AccountRole;
  status: "pending" | "approved";
  vehicleType: VehicleType | null;
  canAccessDistributorFeatures: boolean;
};

export type DistributorAccount = Account & { role: "distributor"; company: string };

export function isDistributor(account: Account): account is DistributorAccount {
  return account.role === "distributor" && account.company !== null;
}

export type AccountState =
  | { state: "signed-in"; account: Account }
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

const roles: readonly string[] = ["customer", "driver", "distributor", "admin"];
const nullableString = (value: unknown) => value === null || typeof value === "string";

/** Shape check of the API response; anything unexpected is treated as "unavailable", never as signed in. */
function isAccount(value: unknown): value is Account {
  const user = value as Account | null;
  if (!user || typeof user.id !== "string" || typeof user.email !== "string" || typeof user.name !== "string") return false;
  if (!roles.includes(user.role) || (user.status !== "pending" && user.status !== "approved")) return false;
  if (!nullableString(user.company) || !nullableString(user.phone) || !nullableString(user.location)) return false;
  if (user.role === "distributor" && user.company === null) return false;
  // Older APIs omit vehicleType; treat that as null.
  const vehicle = user.vehicleType ?? null;
  if (vehicle !== null && !vehicleTypes.some((type) => type.value === vehicle)) return false;
  if ((user.role === "driver") !== (vehicle !== null)) return false;
  user.vehicleType = vehicle;
  return user.canAccessDistributorFeatures === (user.role === "distributor" && user.status === "approved");
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
