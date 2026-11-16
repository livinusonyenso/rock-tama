import type { CSSProperties } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import type { MediaAsset } from "@/types/content";

// Generic bottle outline in a 40×100 box, traced from the reference placeholder's proportions
// (cap 11.5–28.5, shoulders 12–28%, full-width body, rounded base). Not brand artwork (D-068).
const BOTTLE_PATH =
  "M13 0.5H27Q28.5 0.5 28.5 2V9Q28.5 10 27.5 10.5V12C34 15 39.5 20 39.5 28V95Q39.5 99.5 35 99.5H5Q0.5 99.5 0.5 95V28C0.5 20 6 15 12.5 12V10.5Q11.5 10 11.5 9V2Q11.5 0.5 13 0.5Z";

type MediaFrameProps = {
  media: MediaAsset;
  /** Sizing classes (usually a height); width follows the aspect ratio. */
  className?: string;
  /** next/image `sizes` for the real image. */
  sizes?: string;
  /** Load eagerly as a likely LCP element. */
  priority?: boolean;
  /** Smaller placeholder label for small frames (e.g. product cards). */
  compact?: boolean;
  /** Cover is for photography; existing product frames keep contain/bottom defaults. */
  fit?: "contain" | "cover";
  objectPosition?: string;
  /** Alternate aspect below md, identical for placeholder and real image. */
  mobileAspect?: MediaAsset["aspect"];
  /** Restrained landscape placeholder artwork (not product silhouette sizing). */
  landscape?: boolean;
};

/**
 * Fixed-aspect image slot (D-009). With `media.src` it renders next/image (contain, bottom
 * aligned); without it, a labelled placeholder of exactly the same box, so swapping in the
 * real photo never changes layout. The placeholder is decorative (aria-hidden).
 */
export function MediaFrame({ media, className = "", sizes, priority = false, compact = false, fit = "contain", objectPosition, mobileAspect, landscape = false }: MediaFrameProps) {
  const box = (mobileAspect
    ? { "--media-aspect": media.aspect, "--media-mobile-aspect": mobileAspect }
    : { aspectRatio: media.aspect }) as CSSProperties;
  const position = objectPosition ?? media.objectPosition;
  const frameClass = `relative ${mobileAspect ? "media-frame-responsive" : ""} ${className}`;

  if (media.src) {
    return (
      <div className={frameClass} style={box} data-claims={media.claims?.join(" ")}>
        <Image src={media.src} alt={media.alt} fill sizes={sizes} preload={priority} className={fit === "cover" ? "rounded-card object-cover" : "object-contain object-bottom"} style={position ? { objectPosition: position } : undefined} />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={frameClass} style={box}>
      {media.shape === "bottle" ? (
        <svg viewBox="0 0 40 100" preserveAspectRatio="none" className="absolute inset-0 size-full drop-shadow-xl">
          <path d={BOTTLE_PATH} className="fill-placeholder stroke-on-dark/80" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <div className="absolute inset-0 rounded-card bg-placeholder" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 text-center text-placeholder-ink">
        <Icon name="image" strokeWidth={1.25} className={landscape ? "size-14" : compact ? "h-auto w-1/2 max-w-12" : "h-auto w-2/5"} />
        <span className={landscape ? "max-w-60 text-lg leading-tight lg:text-2xl" : compact ? "max-w-[85%] text-xs leading-tight" : "max-w-[60%] text-lg leading-tight lg:text-2xl"}>
          {media.label}
        </span>
      </div>
    </div>
  );
}
