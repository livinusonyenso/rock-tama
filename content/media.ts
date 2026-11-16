import { site } from "@/content/site";
import type { MediaAsset } from "@/types/content";

/** Owner-supplied artwork. One image reference shared by home, catalogue and enquiry pages. */
export const storefrontMedia = {
  bottle750: { label: "750 ml Bottle Image", alt: `${site.name} 750 ml glass bottle with a gold cap and green-and-cream label`, src: "/images/products/750ml-glass-bottle.webp", aspect: "3/10", shape: "bottle" },
  bottle15: { label: "1.5 L Bottle Image", alt: `${site.name} 1.5 litre bottle with a gold cap and green-and-cream label`, src: "/images/products/1-5l-bottle.webp", aspect: "3/8", shape: "bottle" },
  cartons: { label: "Carton Pack Image", alt: `${site.name} branded multi-bottle pack`, src: "/images/products/carton-packs.webp", aspect: "7/4", shape: "rect" },
  distributor: { label: "Distributor Supply Image", alt: `Stacked ${site.name} branded packs on a distributor pallet`, src: "/images/services/distributor-supply.webp", aspect: "2/1", shape: "rect" },
  origin: { label: "Story Section Image (Landscape)", alt: "Illustrated green landscape with a flowing stream, trees and distant hills", src: "/images/origin/origin-landscape.webp", aspect: "3/1", shape: "rect", objectPosition: "50% 60%" },
} as const satisfies Record<string, MediaAsset>;

/** Decorative supplied artwork; not documentary photography of the Nanka spring. */
export const heroBackground = { src: "/images/hero/waterfall-bg.webp", width: 1672, height: 941 } as const;

/** Home range image variants only. No SKU, availability or pack-quantity changes. */
export const rangeMediaVariants: Partial<Record<string, readonly MediaAsset[]>> = {
  "750ml-glass-bottle": [storefrontMedia.bottle750, { label: "Proposed alternative 750 ml packaging", alt: "Proposed alternative ROCK-TAMA 750 ml bottle packaging, not confirmed glass packaging", src: "/images/hero/bottle-750ml-rock-tama.webp", aspect: storefrontMedia.bottle750.aspect, shape: "bottle" }],
  "1-5l-bottle": [storefrontMedia.bottle15, { label: "Alternative 1.5 L bottle artwork", alt: "Alternative ROCK-TAMA 1.5 litre bottle artwork with a green label and gold cap", src: "/images/hero/bottle-1-5l.webp", aspect: storefrontMedia.bottle15.aspect, shape: "bottle" }],
  "carton-packs": [storefrontMedia.cartons,
    ...["carton-closed-front", "carton-closed-angle", "carton-open-row", "carton-open-angle", "carton-closed-wide", "carton-closed-side", "closed-carton"].map(name => ({
      label: "Alternative carton packaging artwork", alt: `Proposed ROCK-TAMA carton packaging — ${name.replaceAll("-", " ")}`,
      src: `/images/products/${name}.webp` as const, aspect: "4/3" as const,
      claims: name.startsWith("carton-open") ? ["palletPackConfiguration"] as const : name === "closed-carton" ? ["ultraPure", "lowTds", "heavyMetalsNotDetected", "odourlessTastelessAtSource", "cartonPackConfiguration"] as const : ["cartonPackConfiguration"] as const,
    })),
  ],
  distributor: [storefrontMedia.distributor,
    ...["warehouse-pallet", "warehouse-pack-stack", "warehouse-carton-stack"].map(name => ({
      label: "Warehouse pallet artwork", alt: `Proposed ROCK-TAMA warehouse supply — ${name.replaceAll("-", " ")}`,
      src: `/images/products/${name}.webp` as const, aspect: "1/1" as const, fit: "cover" as const, objectPosition: "50% 100%", claims: ["palletPackConfiguration"] as const,
    })),
  ],
};

export const rangeMediaNotices: Partial<Record<string, string>> = {
  "750ml-glass-bottle": "Alternative bottle: proposed packaging",
};
