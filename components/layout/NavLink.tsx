"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { navigationCopy } from "@/content/navigation";

type NavLinkProps = {
  /** From `resolveHref()`. `null` means the destination isn't available yet. */
  href: string | null;
  children: ReactNode;
  className?: string;
};

/**
 * Navigation entry (D-027). A resolvable href renders a link that marks itself
 * `aria-current="page"` on an exact path match; interim anchors (`/#…`) are
 * never "current". A `null` href renders non-interactive text with
 * screen-reader "coming soon" text: no `href="#"`, no hover, default cursor.
 * Client Component only because it needs `usePathname()`.
 */
export function NavLink({ href, children, className = "" }: NavLinkProps) {
  const pathname = usePathname();

  if (href === null) {
    return (
      <span className={`cursor-default ${className}`}>
        {children}
        {/* normal-case: don't inherit the nav's uppercase, which some screen readers spell out */}
        <span className="sr-only normal-case"> ({navigationCopy.comingSoon})</span>
      </span>
    );
  }

  const isCurrent = !href.includes("#") && pathname === href;

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={`focus-ring hover:text-gold-700 ${className}`}
    >
      {children}
    </Link>
  );
}
