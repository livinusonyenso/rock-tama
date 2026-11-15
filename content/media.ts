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
