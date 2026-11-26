import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { dashboardPath } from "@/lib/account/roles";
import { currentAccount } from "@/lib/server/api";

/** Protect every driver page even when the App Router reuses its parent layout. */
export const driverDashboardAccount = cache(async () => {
  const result = await currentAccount();
  if (result.state === "unavailable") return null;
  if (result.state === "signed-out") redirect("/account/login");
  if (result.account.role !== "driver") redirect(dashboardPath(result.account.role));
  return result.account;
});
