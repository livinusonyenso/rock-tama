import type { HomeSection, HomeSectionId, RouteDefinition, RouteKey } from "@/types/content";

/**
 * Route plan and current availability (D-015, D-026).
 * When a page ships, change its status to "live" in the same commit.
 * Use `resolveHref` from `@/lib/navigation` to turn a key into a link.
 */
export const routes: Record<RouteKey, RouteDefinition> = {
  home: { status: "live", path: "/" },
  shop: { status: "live", path: "/shop" }, // F2
  product750ml: { status: "live", path: "/shop/750ml-glass-bottle" }, // F2
  product15l: { status: "live", path: "/shop/1-5l-bottle" }, // F2
  productCartons: { status: "live", path: "/shop/carton-packs" }, // F2
  wholesale: { status: "live", path: "/wholesale" }, // F1: working enquiry flow
  ourStory: { status: "planned", path: "/our-story", interimSection: "origin" },
  quality: { status: "planned", path: "/quality", interimSection: "quality" },
  contact: { status: "planned", path: "/contact" },
  search: { status: "planned", path: "/search" },
  account: { status: "planned", path: "/account" },
  cart: { status: "planned", path: "/cart" },
};

/**
 * Homepage sections usable as interim anchors. Mark a section built only in the
 * change that renders it with the matching id (e.g. <section id="products">).
 */
export const homeSections: Record<HomeSectionId, HomeSection> = {
  products: { built: false }, // M5
  origin: { built: false }, // M6
  quality: { built: false }, // M6
  wholesale: { built: false }, // M7
};
