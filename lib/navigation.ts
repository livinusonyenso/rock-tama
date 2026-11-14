import { homeSections, routes } from "@/content/routes";
import type { NavItem, RouteKey } from "@/types/content";

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

/**
 * Destination for a top-level nav item, shared by the desktop and mobile
 * headers. An item with a dropdown (Shop) is interactive only through its
 * children's availability, never its own route (D-048). While none are
 * available it resolves to `null`.
 */
export function resolveNavItem(item: NavItem): string | null {
  if (!item.children) return resolveHref(item.route);

  const available = item.children
    .map((child) => resolveHref(child.route))
    .filter((href): href is string => href !== null);

  if (available.length > 0) {
    // Temporary guard (D-050): fails the build/prerender instead of shipping a
    // link that shows a dropdown arrow but has no dropdown. M2.5b replaces this
    // throw with ShopMenu (desktop) and the nested list (mobile).
    throw new Error(
      `"${item.label}" now has an available destination (${available[0]}) but its dropdown (ShopMenu) ` +
        "is not implemented. Build task M2.5b (docs/IMPLEMENTATION_PLAN.md, M5; D-048) in the same change " +
        "that makes the destination available.",
    );
  }

  return null;
}
