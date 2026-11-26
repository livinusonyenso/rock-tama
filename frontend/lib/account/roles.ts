import { accountTypes, type AccountRole, type AccountType } from "@/content/accounts";
import { routes } from "@/content/routes";

/** A valid account type from the registration page's `?type=` value; customer when missing or unknown. */
export function parseAccountType(value: string | string[] | undefined): AccountType {
  return accountTypes.find((type) => type === value) ?? "customer";
}

/** Where each role lands after signing in (D-137). Used by the login form and the server-side redirects. */
export function dashboardPath(role: AccountRole): string {
  if (role === "customer") return routes.accountDashboardOverview.path;
  if (role === "driver") return routes.driverDashboard.path;
  if (role === "admin") return routes.admin.path;
  return routes.accountDashboard.path;
}
