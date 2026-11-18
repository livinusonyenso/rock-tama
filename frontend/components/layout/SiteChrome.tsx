"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Paths with their own full-screen UI (admin portal, D-128): no shop announcement bar, header or footer. */
const BARE = [/^\/admin(\/|$)/, /^\/auth(\/|$)/];

/**
 * Shows the storefront chrome (server-rendered, passed in) everywhere except the admin portal. Chosen over
 * route groups so no existing page has to move (D-128).
 */
export function SiteChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const bare = BARE.some((pattern) => pattern.test(pathname));
  return (
    <>
      {!bare && header}
      {children}
      {!bare && footer}
    </>
  );
}
