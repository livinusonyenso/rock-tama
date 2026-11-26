import type { PageCalloutContent } from "@/components/ui/PageCallout";
import { storefrontMedia } from "@/content/media";
import { site } from "@/content/site";
import type { HomeOriginContent, HomeProductsContent } from "@/types/content";

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
    media: storefrontMedia.distributor,
    cta: { label: "Request Supply", route: "wholesale" },
    titleStyle: "italic",
  },
};

/** §6: factual owner-supplied origin; evidence-dependent labels stay in the claims register. */
export const homeOrigin: HomeOriginContent = {
  eyebrow: "Our Origin",
  heading: "From Nanka, Anambra State.",
  description: "ROCK-TAMA natural spring water originates from Nanka, Anambra State, Nigeria. This is where our story begins.",
  media: storefrontMedia.origin,
  // GeoNames 2329463 via Mapcarta; provenance and independent check in ASSET_SPECIFICATIONS.
  location: { latitude: 6.06042, longitude: 7.08306 },
  indicators: [
    { icon: "map-pin", label: "Nanka,\nAnambra State, Nigeria" },
    { icon: "leaf", label: "Naturally\nProtected Source", claim: "naturallyProtectedSource" },
    { icon: "layers", label: "Preserved\nNatural Purity", claim: "preservedNaturalPurity" },
  ],
};

export const homeQuality = {
  eyebrow: "Quality & Safety",
  heading: "Purity You Can Trust",
  headingClaim: "qualityPurityTrust",
  description: "ROCK-TAMA natural spring water from Nanka, Anambra State, Nigeria.",
  certification: { enabled: false, certificate: null } satisfies import("@/lib/certification").Certification,
} as const;

export const homeSupply = {
  heading: ["Supply for", "Business & Institutions"],
  description: "Discuss your water supply requirements for hotels, offices, retail and events.",
  cta: { label: "Request Wholesale", route: "wholesale" },
} as const;

/**
 * Standalone pages for the nav (D-140, D-141): page header, the homepage section, then a closing panel that only
 * points to working pages. No new story or quality claims: those need owner-supplied facts and evidence.
 */
export const sectionPages = {
  ourStory: {
    eyebrow: "About ROCK-TAMA",
    title: "Our Story",
    description: "Where ROCK-TAMA natural spring water comes from: Nanka, Anambra State, Nigeria.",
    callout: {
      heading: "Taste it for yourself",
      text: "Order ROCK-TAMA natural spring water for your home, or talk to us about supply for your business.",
      actions: [
        { label: "Shop now", route: "shop", variant: "primary" },
        { label: "Wholesale supply", route: "wholesale", variant: "outline-light" },
      ],
    },
  },
  quality: {
    eyebrow: "Our standards",
    title: "Quality & Safety",
    description: "How ROCK-TAMA looks after the quality and safety of its natural spring water.",
    callout: {
      heading: "Questions about our water?",
      text: "Ask us anything about ROCK-TAMA natural spring water and we will get back to you.",
      actions: [
        { label: "Contact us", route: "contact", variant: "primary" },
        { label: "Shop now", route: "shop", variant: "outline-light" },
      ],
    },
  },
} as const satisfies Record<string, { eyebrow: string; title: string; description: string; callout: PageCalloutContent }>;
