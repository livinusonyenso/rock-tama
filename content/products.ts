import { site } from "@/content/site";
import type { Product } from "@/types/content";

/**
 * Product catalogue (single source for shop pages, product cards, the hero carousel and the
 * enquiry form). Edit products here. `price: null` renders "Price on request" until the client
 * supplies prices (docs/ECOMMERCE_REQUIREMENTS.md). Images: ASSET_SPECIFICATIONS slots 2–4.
 */
export const products: readonly Product[] = [
  {
    slug: "750ml-glass-bottle",
    route: "product750ml",
    name: "750 ml Glass Bottle",
    shortName: "750 ml",
    summary: "A refined choice for premium drinking, hotels and personal use.",
    price: null,
    media: { label: "750 ml Bottle Image", alt: `${site.name} 750 ml glass bottle`, src: null, aspect: "3/10", shape: "bottle" },
  },
  {
    slug: "1-5l-bottle",
    route: "product15l",
    name: "1.5 L Bottle",
    shortName: "1.5 L",
    summary: "Ideal for home, office and everyday hydration.",
    price: null,
    media: { label: "1.5 L Bottle Image", alt: `${site.name} 1.5 litre bottle`, src: null, aspect: "3/8", shape: "bottle" },
  },
  {
    slug: "carton-packs",
    route: "productCartons",
    name: "Carton Packs",
    shortName: "Carton Packs",
    summary: "Convenient multi-bottle packs for retail and events.",
    price: null,
    media: { label: "Carton Pack Image", alt: `${site.name} carton pack`, src: null, aspect: "7/4", shape: "rect" },
  },
];

export const productBySlug = (slug: string) => products.find((product) => product.slug === slug);
