import type { AbsolutePath, RouteKey } from "@/types/content";

export type HeroSlide = {
  id: string;
  title: string;
  description: string;
  cta: string;
  route: RouteKey;
  occasion?: "wedding" | "memorial" | "coronation";
  image: { src: AbsolutePath; alt: string };
  concept?: boolean;
};

/** Concepts invite enquiries, not purchases of unconfirmed custom products. */
export const heroSlides: readonly HeroSlide[] = [
  { id: "750ml", title: "Premium Natural Spring Water", description: "Discover ROCK-TAMA natural spring water from Nanka, Anambra State, Nigeria. Explore our bottle collection for your table and special moments.", cta: "Shop Now", route: "shop", image: { src: "/images/hero/bottle-750ml-rock-tama.webp", alt: "ROCK-TAMA 750 ml bottle with a forest-green label and gold cap" } },
  { id: "1500ml", title: "Everyday Hydration", description: "Make room for refreshment in your everyday routine. Explore the ROCK-TAMA collection, including our 1.5 litre bottle.", cta: "Explore Products", route: "shop", image: { src: "/images/hero/bottle-1-5l.webp", alt: "ROCK-TAMA 1.5 litre bottle with a forest-green label and gold cap" } },
  { id: "wedding", title: "Wedding Water Labels", description: "A personal touch for your celebration. Share your wedding label ideas, event date and quantity with our team to discuss the options.", cta: "Customise Your Water", route: "customLabels", occasion: "wedding", image: { src: "/images/hero/wedding.webp", alt: "Proposed ROCK-TAMA wedding bottle with an ivory floral label" }, concept: true },
  { id: "memorial", title: "Memorial Water Labels", description: "A thoughtful detail for a day of remembrance. Tell us about your memorial label requirements and the occasion you wish to honour.", cta: "Request Custom Label", route: "customLabels", occasion: "memorial", image: { src: "/images/hero/memorial.webp", alt: "Proposed ROCK-TAMA memorial bottle label concept" }, concept: true },
  { id: "coronation", title: "Royal & Coronation Events", description: "Mark a meaningful occasion with a considered label concept. Share your royal or coronation event requirements for an individual enquiry.", cta: "Request Custom Label", route: "customLabels", occasion: "coronation", image: { src: "/images/hero/coronation.webp", alt: "Proposed ROCK-TAMA royal celebration bottle label concept" }, concept: true },
];
