import type { ReactNode } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { MediaAsset } from "@/types/content";

export type OfferCardLayout = "media-top" | "media-side" | "media-middle";

type OfferCardProps = {
  title: string;
  text: string;
  media: MediaAsset;
  /** The card's single action. */
  action: ReactNode;
  /**
   * media-top: image area, then text (shop/wholesale cards). media-side: image left, text right
   * (reference cards 1–2). media-middle: title and text, image, centred action (reference cards 3–4).
   */
  layout?: OfferCardLayout;
  headingLevel?: "h2" | "h3";
  titleStyle?: "italic";
  /** Small gold line under the title (e.g. packaging). */
  eyebrow?: string;
  /** Line above the action (e.g. price). */
  meta?: string;
  className?: string;
};

const isLandscape = (media: MediaAsset) => {
  const [w, h] = media.aspect.split("/").map(Number);
  return w > h;
};

/**
 * Presentational card shared by products and service offers (COMPONENT_ARCHITECTURE §5).
 * Server Component; only the action is interactive. Hover = slightly deeper shadow + 2px lift
 * (no lift with reduced motion).
 */
export function OfferCard({ title, text, media, action, layout = "media-top", headingLevel: Heading = "h3", titleStyle, eyebrow, meta, className = "" }: OfferCardProps) {
  const landscape = isLandscape(media);
  const frame = (sizeClass: string) => (
    <MediaFrame media={media} compact sizes="(min-width: 1024px) 272px, 60vw" className={landscape ? "w-full max-w-68" : sizeClass} />
  );
  const titleClass = `font-serif text-card-title font-bold leading-tight text-ink-900 lining-nums ${titleStyle === "italic" ? "italic" : ""}`;
  const shell = `flex h-full rounded-card border border-line-card bg-cream-200 shadow-card transition-[box-shadow,translate] duration-150 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`;

  if (layout === "media-side") {
    return (
      <article className={`${shell} flex-col items-stretch gap-4 p-5 sm:flex-row`}>
        {/* Stacked below sm: a half-width image leaves too little room for the action at 320px. */}
        <div className="flex shrink-0 items-end justify-center sm:w-1/2">{frame("h-52 sm:h-60 lg:h-64")}</div>
        <div className="flex min-w-0 flex-1 flex-col sm:pt-6">
          <Heading className={titleClass}>{title}</Heading>
          {eyebrow && <p className="mt-1 text-sm font-semibold uppercase tracking-eyebrow text-gold-700">{eyebrow}</p>}
          <p className="mt-3 text-base leading-snug text-ink-700">{text}</p>
          {meta && <p className="mt-3 font-serif text-xl font-semibold text-forest-heading lining-nums">{meta}</p>}
          <div className="mt-auto pt-4">{action}</div>
        </div>
      </article>
    );
  }

  if (layout === "media-middle") {
    return (
      <article className={`${shell} flex-col items-center px-5 pt-4 pb-5`}>
        <div className="w-full max-w-60 self-center text-center">
          <Heading className={titleClass}>{title}</Heading>
          <p className="mt-1.5 text-base leading-snug text-ink-700">{text}</p>
        </div>
        {/* w-full: without it the wrapper shrinks to its content and a landscape frame collapses */}
        <div className="flex w-full flex-1 items-center justify-center py-2.5">{frame("h-36")}</div>
        <div>{action}</div>
      </article>
    );
  }

  return (
    <article className={`${shell} flex-col p-6`}>
      {/* Fixed image area so cards align regardless of each product's proportions. */}
      <div className="flex h-56 items-end justify-center">{frame("h-full")}</div>
      <Heading className={`mt-6 ${titleClass}`}>{title}</Heading>
      {eyebrow && <p className="mt-1 text-sm font-semibold uppercase tracking-eyebrow text-gold-700">{eyebrow}</p>}
      <p className="mt-3 text-base text-ink-700">{text}</p>
      {meta && <p className="mt-4 font-serif text-xl font-semibold text-forest-heading lining-nums">{meta}</p>}
      <div className="mt-auto pt-6">{action}</div>
    </article>
  );
}
