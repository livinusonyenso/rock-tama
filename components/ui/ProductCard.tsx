import type { ReactNode } from "react";
import { OfferCard, type OfferCardLayout } from "@/components/ui/OfferCard";
import type { MediaAsset, Product } from "@/types/content";

type ProductCardProps = {
  product: Product;
  mediaVariants?: readonly MediaAsset[];
  mediaNotice?: string;
  /** The card's single action (e.g. "Select product" on /wholesale, "View product" on /shop). */
  action: ReactNode;
  headingLevel?: "h2" | "h3";
  /** Optional line above the action, e.g. the price ("Price on request"). */
  meta?: string;
  layout?: OfferCardLayout;
  /** Show the packaging line under the name (shop/wholesale cards; the homepage reference has none). */
  showPackaging?: boolean;
};

/** Catalogue product → OfferCard. All product facts come from content/products.ts. Server Component. */
export function ProductCard({ product, mediaVariants, mediaNotice, action, headingLevel, meta, layout = "media-top", showPackaging = true }: ProductCardProps) {
  return (
    <OfferCard
      title={product.name}
      text={product.summary}
      media={product.media}
      mediaVariants={mediaVariants}
      mediaNotice={mediaNotice}
      action={action}
      layout={layout}
      headingLevel={headingLevel}
      eyebrow={showPackaging ? product.packaging : undefined}
      meta={meta}
    />
  );
}
