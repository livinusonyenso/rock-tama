import Image from "next/image";
import type { ReactNode } from "react";
import { qualityBackground } from "@/content/media";

const { src, width, height } = qualityBackground;

// Wide screens: the same artwork twice at a reduced scale (one download), anchored left for the waterfall and
// right for the leaves, fading into the artwork's own mist colour so the text sits on a calm centre.
const layer = "absolute bottom-0 h-[165%] w-auto max-w-none select-none object-cover";

/**
 * One continuous decorative spring backdrop behind Quality & Safety and the supply banner (owner design,
 * 2026-11-16, D-108). Server Component; images are decorative (empty alt + aria-hidden) and lazy (below the
 * fold). Below `xl` the band is tall, so a single cover image is used instead of the layered composition.
 */
export function WaterBand({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden bg-spring-mist">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* Kept laid out but invisible where unused (display:none gave next/image "height 0" warnings); a tiny
            `sizes` at those widths means only a thumbnail-size file is fetched there (D-126). */}
        <Image src={src} alt="" fill sizes="(min-width: 1280px) 16px, 100vw" className="object-cover object-[50%_68%] xl:invisible" />
        {/* Below xl the content stacks over the whole artwork, so soften it to keep every label readable. */}
        <div className="absolute inset-0 bg-spring-mist/65 xl:hidden" />
        <Image src={src} alt="" width={width} height={height} sizes="(min-width: 1280px) 900px, 16px"
          className={`${layer} invisible left-0 mask-[linear-gradient(to_right,black_45%,transparent_75%)] xl:visible`} />
        <Image src={src} alt="" width={width} height={height} sizes="(min-width: 1280px) 900px, 16px"
          className={`${layer} invisible right-0 mask-[linear-gradient(to_left,black_15%,transparent_45%)] xl:visible`} />
      </div>
      {children}
    </div>
  );
}
