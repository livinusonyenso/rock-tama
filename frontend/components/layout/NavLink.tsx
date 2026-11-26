"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { navigationCopy } from "@/content/navigation";

const tones = {
  light: "focus-ring hover:text-gold-700", // ivory header
  dark: "focus-ring-dark hover:text-gold-500", // forest-green drawer
} as const;

type NavLinkProps = {
  /** From `resolveHref()` / `resolveNavItem()`. `null` means the destination isn't available yet. */
  href: string | null;
  children: ReactNode;
  className?: string;
  /** Surface the link sits on; sets hover colour and focus ring. */
  tone?: keyof typeof tones;
  /**
   * How a pending item says "Coming soon": `hidden` = screen-reader text only
   * (desktop, matches the reference); `visible` = a visible tag that is also the
   * accessible text (mobile drawer, where touch users get no hover hint).
   */
  pendingLabel?: "hidden" | "visible";
};

/**
 * Navigation entry (D-027). A resolvable href renders a link that marks itself
 * `aria-current="page"` on an exact path match; interim anchors (`/#…`) are
 * never "current". A `null` href renders non-interactive text (`data-pending`)
 * with "Coming soon": no `href="#"`, no hover, default cursor, not focusable.
 * Client Component only because it needs `usePathname()`.
 */
export function NavLink({ href, children, className = "", tone = "light", pendingLabel = "hidden" }: NavLinkProps) {
  const pathname = usePathname();

  if (href === null) {
    return (
      <span data-pending="" className={`cursor-default ${className}`}>
        {children}
        {pendingLabel === "visible" ? (
          <span className="shrink-0 font-sans text-xs font-semibold uppercase tracking-eyebrow">
            {navigationCopy.comingSoon}
          </span>
        ) : (
          // normal-case: don't inherit the nav's uppercase, which some screen readers spell out
          <span className="sr-only normal-case"> ({navigationCopy.comingSoon})</span>
        )}
      </span>
    );
  }

  const isCurrent = !href.includes("#") && pathname === href;

  return (
    <Link href={href} aria-current={isCurrent ? "page" : undefined} className={`${tones[tone]} ${className}`}>
      {children}
    </Link>
  );
}
