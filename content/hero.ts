import { site } from "@/content/site";
import type { HeroContent } from "@/types/content";

/** Homepage hero (UI_BREAKDOWN §03). Edit copy here, not in the component. */
export const hero: HeroContent = {
  eyebrow: "Natural Spring Water from Africa",
  heading: site.heroDisplayName,
  tagline: "Pure by Nature. African at Heart.",
  // Development copy from the reference, grammar corrected ("Nigeria. Naturally…").
  // Contains registered claims (content/claims.ts): rockFiltered, bottledAtSource. They must be
  // verified before a production deployment (D-068, D-078).
  description:
    "A premium natural spring water from Nanka, Anambra State, Nigeria. Naturally filtered through ancient rock formations, preserved in its pure, natural state and bottled at the source to deliver exceptional purity, freshness and balance.",
  actions: [
    { label: "Shop Now", route: "shop", icon: "shopping-cart", variant: "primary" },
    { label: "Request Wholesale", route: "wholesale", icon: "warehouse", variant: "outline-dark" },
  ],
  // Hero Product Carousel (D-073). Images come from each product's heroMedia/media in
  // content/products.ts; the first slide keeps the reference's 2:5 hero bottle.
  carousel: {
    products: ["750ml-glass-bottle", "1-5l-bottle", "carton-packs"],
    intervalMs: 6000,
    label: `${site.name} products`,
    controlsLabel: "Choose a product",
    pauseLabel: "Stop automatic slide show",
    playLabel: "Start automatic slide show",
    viewLabel: "View",
  },
};
