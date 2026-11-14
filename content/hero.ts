import { site } from "@/content/site";
import type { HeroContent } from "@/types/content";

/** Homepage hero (UI_BREAKDOWN §03). Edit copy here, not in the component. */
export const hero: HeroContent = {
  eyebrow: "Natural Spring Water from Africa",
  heading: site.heroDisplayName,
  tagline: "Pure by Nature. African at Heart.",
  // Development copy from the reference, grammar corrected ("Nigeria. Naturally…").
  // The process claims "naturally filtered through ancient rock formations" and
  // "bottled at the source" must be confirmed before publication (D-068,
  // PROJECT_OVERVIEW evidence table).
  description:
    "A premium natural spring water from Nanka, Anambra State, Nigeria. Naturally filtered through ancient rock formations, preserved in its pure, natural state and bottled at the source to deliver exceptional purity, freshness and balance.",
  actions: [
    { label: "Shop Now", route: "shop", icon: "shopping-cart", variant: "primary" },
    { label: "Request Wholesale", route: "wholesale", icon: "warehouse", variant: "outline-dark" },
  ],
  media: {
    label: "Hero Product Image",
    alt: `${site.name} natural spring water bottle`,
    src: null, // official photography pending (ASSET_SPECIFICATIONS slot 1)
    aspect: "2/5",
    shape: "bottle",
  },
};
