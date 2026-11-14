import { homeSections, routes } from "@/content/routes";
import type { RouteKey } from "@/types/content";

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
