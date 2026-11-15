"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { NavLink } from "@/components/layout/NavLink";
import type { NavChild } from "@/lib/navigation";

const subscribe = () => () => {};

type ShopMenuProps = {
  label: string;
  /** Destination of the parent item, used before JavaScript enhances the menu (e.g. /shop). */
  parentHref: string;
  items: NavChild[];
  /** Shared nav-item styling from SiteHeader (uppercase, underline via data-current). */
  triggerClassName: string;
  /** Server-rendered chevron icon. */
  chevron: ReactNode;
};

/**
 * Desktop Shop dropdown (D-048, D-051): disclosure navigation pattern. Before hydration (and without
 * JavaScript) it is a plain link to the parent destination; after hydration a button toggles a list
 * of links. Escape closes and returns focus; outside clicks, tabbing away, choosing a link and route
 * changes close it. No hover-to-open.
 */
export function ShopMenu({ label, parentHref, items, triggerClassName, chevron }: ShopMenuProps) {
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const isCurrent = pathname === parentHref || items.some((item) => item.href === pathname);

  // Close on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Close on a pointer press outside the menu.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!enhanced) {
    return (
      <Link href={parentHref} data-current={isCurrent || undefined} className={`focus-ring hover:text-gold-700 ${triggerClassName}`}>
        {label}
        {chevron}
      </Link>
    );
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };
  const onBlur = (event: FocusEvent) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        data-current={isCurrent || undefined}
        onClick={() => setOpen((value) => !value)}
        className={`focus-ring cursor-pointer hover:text-gold-700 ${triggerClassName}`}
      >
        {label}
        <span aria-hidden="true" className={`inline-flex transition-transform duration-150 ease-standard motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
          {chevron}
        </span>
      </button>
      <ul
        id={listId}
        hidden={!open}
        className="absolute top-full left-1/2 z-50 mt-4 w-64 -translate-x-1/2 animate-enter rounded-card border border-line-card bg-ivory-100 p-2 shadow-card-hover enter-duration-150 enter-rise-4"
      >
        {items.map((item) => (
          <li key={item.href}>
            <NavLink
              href={item.href}
              className="block rounded-button px-4 py-3 text-base font-medium text-ink-900 aria-[current=page]:bg-cream-200 aria-[current=page]:text-forest-heading"
            >
              <span onClick={() => setOpen(false)}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
