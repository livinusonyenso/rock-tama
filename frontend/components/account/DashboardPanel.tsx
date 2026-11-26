"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** App Router can keep a visited page alive. Remove its panel when another route is active. */
export function DashboardPanel({ path, children }: { path: string; children: ReactNode }) {
  const pathname = usePathname();
  return pathname === path ? <div data-dashboard-panel={path}>{children}</div> : null;
}
