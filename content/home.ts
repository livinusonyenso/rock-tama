import { site } from "@/content/site";
import type { HomeProductsContent } from "@/types/content";

/**
 * Homepage §5 "Our Products" (UI_BREAKDOWN §05). Product names, descriptions and images come from
 * the catalogue (content/products.ts); only the order and card CTA labels are set here. Distributor
 * Supply is a wholesale service offer, not a product, so it has its own record (D-087).
 */
export const homeProducts: HomeProductsContent = {
  eyebrow: "Our Products",
  heading: `The ${site.heroDisplayName} Range`,
  subtitle: "Natural spring water for everyday hydration, premium hospitality and bulk supply.",
  products: [
    { slug: "750ml-glass-bottle", ctaLabel: "Shop 750 ml" },
    { slug: "1-5l-bottle", ctaLabel: "Shop 1.5 L" },
    { slug: "carton-packs", ctaLabel: "Shop Cartons" },
  ],
  distributorOffer: {
    title: "Distributor Supply",
    text: "Bulk volumes for supermarkets, retailers, hotels and institutions.",
    media: { label: "Distributor Supply Image", alt: `${site.name} distributor supply pallet`, src: null, aspect: "2/1", shape: "rect" },
    cta: { label: "Request Supply", route: "wholesale" },
    titleStyle: "italic",
  },
};
