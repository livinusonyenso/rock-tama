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
  customLabels: { status: "live", path: "/custom-labels" },
  wholesale: { status: "live", path: "/wholesale" }, // F1: working enquiry flow
  franchise: { status: "live", path: "/franchise" },
  ourStory: { status: "planned", path: "/our-story", interimSection: "origin" },
  quality: { status: "planned", path: "/quality", interimSection: "quality" },
  contact: { status: "live", path: "/contact" }, // D-111: WhatsApp + email (placeholders until supplied)
  search: { status: "planned", path: "/search" },
  account: { status: "live", path: "/account" },
  deliveryReturns: { status: "planned", path: "/delivery-returns" },
  faqs: { status: "planned", path: "/faqs" },
  terms: { status: "planned", path: "/terms" },
  privacy: { status: "planned", path: "/privacy" },
  checkout: { status: "live", path: "/checkout" }, // D-121: the cart and checkout are one page; /cart redirects here
};

/**
 * Homepage sections usable as interim anchors. Mark a section built only in the
 * change that renders it with the matching id (e.g. <section id="products">).
 */
export const homeSections: Record<HomeSectionId, HomeSection> = {
  products: { built: true }, // §5 Our Products (id="products" on the homepage)
  origin: { built: true }, // §6 Our Origin
  quality: { built: true }, // §7
  wholesale: { built: true }, // §8
};
