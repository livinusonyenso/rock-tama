"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type SelectProductLinkProps = {
  /** Pre-built product URL, e.g. /wholesale/750ml-glass-bottle#enquiry (works without JavaScript). */
  href: string;
  slug: string;
  productName: string;
  className?: string;
  children: ReactNode;
};

/**
 * "Select product" on /wholesale (D-076). Without JavaScript it is a normal link to the pre-built
 * product page. With JavaScript, on the same page, it sets the enquiry form's product directly
 * (keeping anything already typed), updates the URL, scrolls to the form (instantly with reduced
 * motion), focuses the product field and announces the selection. No shared state needed.
 */
export function SelectProductLink({ href, slug, productName, className, children }: SelectProductLinkProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const select = document.getElementById("product") as HTMLSelectElement | null;
    const section = document.getElementById("enquiry");
    // Fall back to normal navigation if the form isn't on the page (e.g. after a successful submission).
    if (!select || !section || ![...select.options].some((option) => option.value === slug)) return;

    event.preventDefault();
    select.value = slug;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    window.history.replaceState(window.history.state, "", href);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    select.focus({ preventScroll: true });
    const status = document.getElementById("product-selection-status");
    if (status) status.textContent = `${productName} selected. Complete the enquiry form below.`;
  };

  return (
    <Link href={href} onClick={onClick} className={className} data-select-product={slug}>
      {children}
    </Link>
  );
}
