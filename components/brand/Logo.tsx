import Image from "next/image";
import { site } from "@/content/site";
import type { LogoAsset } from "@/types/content";

type LogoVariant = "header" | "footer";

type VariantConfig = {
  asset: LogoAsset;
  /** Default rendered height; width follows the asset's aspect ratio. */
  height: string;
  /** Placeholder styling for the background the variant sits on. */
  placeholder: string;
};

const variants: Record<LogoVariant, VariantConfig> = {
  header: {
    asset: site.logos.horizontal,
    height: "h-10 lg:h-16", // 40px in the 64px mobile header, 64px in the 84px desktop header
    placeholder: "border-placeholder-ink/40 bg-placeholder/50 text-placeholder-ink",
  },
  footer: {
    asset: site.logos.stackedLight, // separate light-colour file for the dark footer (D-038)
    height: "h-20 lg:h-24", // 80px mobile, 96px desktop
    placeholder: "border-on-dark-muted/40 bg-on-dark/5 text-on-dark-muted",
  },
};

type LogoProps = {
  variant: LogoVariant;
  /** Replaces the variant's default height classes, e.g. "h-12". Width always follows the aspect ratio. */
  className?: string;
};

/**
 * Brand logo (D-020). Renders the official file once `available` is true in
 * `content/site.ts`; until then, a same-size labelled placeholder. Renders the
 * image only; callers decide whether it's a link.
 */
export function Logo({ variant, className }: LogoProps) {
  const { asset, height, placeholder } = variants[variant];
  const sizing = className ?? height;

  if (asset.available) {
    return (
      <Image
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        className={`w-auto ${sizing}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={asset.alt}
      style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
      className={`inline-flex shrink-0 items-center justify-center rounded-button border border-dashed px-2 text-center text-xs font-semibold uppercase tracking-eyebrow ${placeholder} ${sizing}`}
    >
      <span aria-hidden="true">{asset.alt} logo</span>
    </span>
  );
}
