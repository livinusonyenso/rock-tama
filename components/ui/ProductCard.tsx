import type { ReactNode } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { Product } from "@/types/content";

type ProductCardProps = {
  product: Product;
  /** The card's single action (e.g. "Select product" on /wholesale, "View product" on /shop). */
  action: ReactNode;
  /** Heading level for the product name within the page outline. */
  headingLevel?: "h2" | "h3";
};

/**
 * Shared product card (COMPONENT_ARCHITECTURE §5), driven by the typed catalogue. Server Component.
 * Only the action is interactive; the hover shadow is subtle and has no movement.
 */
export function ProductCard({ product, action, headingLevel: Heading = "h3" }: ProductCardProps) {
  const [w, h] = product.media.aspect.split("/").map(Number);
  const landscape = w > h;

  return (
    <article className="flex h-full flex-col rounded-card border border-line-card bg-cream-200 p-6 shadow-card transition-shadow duration-150 ease-standard hover:shadow-card-hover motion-reduce:transition-none">
      {/* Fixed image area so cards align regardless of each product's proportions. */}
      <div className="flex h-56 items-end justify-center">
        <MediaFrame
          media={product.media}
          sizes="(min-width: 1024px) 240px, 60vw"
          compact
          className={landscape ? "w-full max-w-64" : "h-full"}
        />
      </div>
      {/* lining-nums: Cormorant defaults to old-style figures ("750" reads like "75o") */}
      <Heading className="mt-6 font-serif text-card-title font-bold text-ink-900 lining-nums">{product.name}</Heading>
      <p className="mt-1 text-sm font-semibold uppercase tracking-eyebrow text-gold-700">{product.packaging}</p>
      <p className="mt-3 text-base text-ink-700">{product.summary}</p>
      <div className="mt-auto pt-6">{action}</div>
    </article>
  );
}
