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
};

/**
 * Fixed-aspect image slot (D-009). With `media.src` it renders next/image (contain, bottom
 * aligned); without it, a labelled placeholder of exactly the same box, so swapping in the
 * real photo never changes layout. The placeholder is decorative (aria-hidden).
 */
export function MediaFrame({ media, className = "", sizes, priority = false, compact = false }: MediaFrameProps) {
  const box = { aspectRatio: media.aspect };

  if (media.src) {
    return (
      <div className={`relative ${className}`} style={box}>
        <Image src={media.src} alt={media.alt} fill sizes={sizes} priority={priority} className="object-contain object-bottom" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={`relative ${className}`} style={box}>
      {media.shape === "bottle" ? (
        <svg viewBox="0 0 40 100" preserveAspectRatio="none" className="absolute inset-0 size-full drop-shadow-xl">
          <path d={BOTTLE_PATH} className="fill-placeholder stroke-on-dark/80" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <div className="absolute inset-0 rounded-card bg-placeholder" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 text-center text-placeholder-ink">
        <Icon name="image" strokeWidth={1.25} className={compact ? "h-auto w-1/2 max-w-12" : "h-auto w-2/5"} />
        <span className={compact ? "max-w-[85%] text-xs leading-tight" : "max-w-[60%] text-lg leading-tight lg:text-2xl"}>
          {media.label}
        </span>
      </div>
    </div>
  );
}
