import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE, parseDemoSession } from "@/lib/account/demo";
import { dashboardPath } from "@/lib/account/roles";
import { currentAccount, isDistributor } from "@/lib/server/api";

/** Each page checks access even when Next.js reuses the sidebar during navigation. */
export const accountDashboardSession = cache(async () => {
  const result = await currentAccount();
  if (result.state === "signed-in") {
    const { account } = result;
    if (account.role === "customer") return { kind: "customer", account } as const;
    if (isDistributor(account)) return { kind: "distributor", account } as const;
    redirect(dashboardPath(account.role));
  }
  const demo = parseDemoSession((await cookies()).get(DEMO_COOKIE)?.value);
  if (demo) return { kind: "demo", ...demo } as const;
  if (result.state === "unavailable") return null;
  redirect("/account/login");
});
