import { homeSections, routes } from "@/content/routes";
import type { NavItem, Product, RouteKey } from "@/types/content";

/**
 * Returns a destination that exists right now, or `null` when the route isn't
 * available yet (D-026). Callers render `null` as non-interactive text (D-027);
 * never fall back to "#".
 *
 * 1. Live route -> its path.
 * 2. Planned route whose interim homepage section is built -> "/#<section>".
 * 3. Otherwise -> null.
 */
export function resolveHref(key: RouteKey): string | null {
  const route = routes[key];

  if (route.status === "live") return route.path;

  if (route.interimSection && homeSections[route.interimSection].built) {
    return `/#${route.interimSection}`;
  }

  return null;
}

/** A product's page, via the route registry (null for products without a live page). */
export function productHref(product: Product): string | null {
  return product.route ? resolveHref(product.route) : null;
}

/**
 * Product-specific wholesale quote URL: a pre-built page with the product preselected, jumping to the
 * enquiry form. Works without JavaScript (D-076). null while /wholesale is unavailable.
 */
export function wholesaleQuoteHref(slug: string): string | null {
  const base = resolveHref("wholesale");
  return base ? `${base}/${slug}#enquiry` : null;
}

/** An available dropdown entry. */
export type NavChild = { label: string; href: string };

/**
 * Available children of a dropdown item (Shop), in data order; unavailable ones are omitted (D-052).
 * Shared by the desktop ShopMenu and the mobile drawer. Replaced the temporary build guard (D-050)
 * when ShopMenu shipped in F2.
 */
export function resolveNavChildren(item: NavItem): NavChild[] {
  return (item.children ?? []).flatMap((child) => {
    const href = resolveHref(child.route);
    return href ? [{ label: child.label, href }] : [];
  });
}

/**
 * Destination for a top-level nav item without a dropdown. Items with a dropdown (Shop) render
 * as ShopMenu when resolveNavChildren() has entries, otherwise as pending text (D-048).
 */
export function resolveNavItem(item: NavItem): string | null {
  return item.children ? null : resolveHref(item.route);
}
