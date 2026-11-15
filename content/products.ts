import { storefrontMedia } from "@/content/media";
import { site } from "@/content/site";
import type { Product } from "@/types/content";

/**
 * Product catalogue: the single source for /shop, product pages, the hero carousel, homepage and
 * wholesale product cards, and the enquiry form. Edit products here.
 *
 * - `price: null` renders "Price on request" until the client supplies verified prices.
 * - Only `kind: "standard"` + `status: "available"` products are listed or offered (`listedProducts`).
 *   Customised/event offerings and future products stay recorded as "unconfirmed" until the client
 *   confirms them (D-081); they are never shown as available.
 * - Images: shared owner-supplied artwork in content/media.ts; originals and provenance in docs/assets.
 */
export const products: readonly Product[] = [
  {
    slug: "750ml-glass-bottle",
    kind: "standard",
    status: "available",
    route: "product750ml",
    name: "750 ml Glass Bottle",
    shortName: "750 ml",
    packaging: "Single bottle",
    summary: "A refined choice for premium drinking, hotels and personal use.",
    price: null,
    media: storefrontMedia.bottle750,
    // Hero carousel first slide keeps the reference's 2:5 hero bottle (D-073).
    heroMedia: { ...storefrontMedia.bottle750, label: "Hero Product Image", aspect: "2/5" },
  },
  {
    slug: "1-5l-bottle",
    kind: "standard",
    status: "available",
    route: "product15l",
    name: "1.5 L Bottle",
    shortName: "1.5 L",
    packaging: "Single bottle",
    summary: "Ideal for home, office and everyday hydration.",
    price: null,
    media: storefrontMedia.bottle15,
  },
  {
    slug: "carton-packs",
    kind: "standard",
    status: "available",
    route: "productCartons",
    name: "Carton Packs",
    shortName: "Carton Packs",
    // Pack size (bottles per carton) to be confirmed by the client; do not invent it.
    packaging: "Multi-bottle carton",
    summary: "Convenient multi-bottle packs for retail and events.",
    price: null,
    media: storefrontMedia.cartons,
  },
  // ---- Recorded but NOT offered until the client confirms them (D-081) ----
  {
    slug: "sachet-water",
    kind: "future",
    status: "unconfirmed",
    route: null,
    name: "Sachet Water",
    shortName: "Sachet",
    packaging: "To be confirmed",
    summary: "Possible future product; details to be confirmed by the client.",
    price: null,
    media: { label: "Sachet Water Image", alt: `${site.name} sachet water`, src: null, aspect: "4/5", shape: "rect" },
  },
  {
    slug: "custom-event-water",
    kind: "custom",
    status: "unconfirmed",
    route: null,
    name: "Customised & Event Water",
    shortName: "Custom",
    packaging: "To be confirmed",
    summary: "Customised or event water offering; details to be confirmed by the client.",
    price: null,
    media: { label: "Custom Water Image", alt: `${site.name} customised event water`, src: null, aspect: "4/5", shape: "rect" },
  },
];

/** Products that may be listed, linked, sold or offered in forms. */
export const listedProducts: readonly Product[] = products.filter(
  (product) => product.kind === "standard" && product.status === "available",
);

/** Looks up a listed product only; unconfirmed products are never resolvable by URL. */
export const productBySlug = (slug: string) => listedProducts.find((product) => product.slug === slug);
