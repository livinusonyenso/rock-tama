"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Workspaces with their own navigation use a dedicated layout. */
const BARE = [/^\/admin(\/|$)/, /^\/auth(\/|$)/, /^\/driver(\/|$)/];

/** Shows the server-rendered storefront chrome on shopping and public account pages. */
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
