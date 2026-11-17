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
    height: "h-12 xl:h-16", // 48px mobile/compact desktop, 64px wide desktop
    placeholder: "border-placeholder-ink/40 bg-placeholder/50 text-placeholder-ink",
  },
  footer: {
    asset: site.logos.stacked, // supplied dark lettering needs an ivory backing
    height: "h-20 lg:h-24", // 80px mobile, 96px desktop
    placeholder: "border-on-dark-muted/40 bg-on-dark/5 text-on-dark-muted",
  },
};

type LogoProps = {
  variant: LogoVariant;
  /** Replaces the variant's default height classes, e.g. "h-12". Width always follows the aspect ratio. */
  className?: string;
  /** Load immediately when the logo is above the fold (e.g. admin sidebar and sign-in, D-129). */
  eager?: boolean;
};

/**
 * Brand logo (D-020). Renders the supplied file once `available` is true in
 * `content/site.ts`; until then, a same-size labelled placeholder. Renders the
 * image only; callers decide whether it's a link.
 */
export function Logo({ variant, className, eager }: LogoProps) {
  const { asset, height, placeholder } = variants[variant];
  const sizing = className ?? height;

  if (asset.available) {
    return (
      <span className={variant === "footer" ? "inline-flex max-w-full rounded-button bg-ivory-100 p-3" : "inline-flex"}>
        <Image
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          sizes={variant === "header" ? "(min-width: 1280px) 163px, 122px" : "(min-width: 1024px) 199px, 166px"}
          loading={eager || variant === "header" ? "eager" : "lazy"}
          className={variant === "footer" && !className ? "h-auto w-42 object-contain lg:w-50" : `w-auto object-contain ${sizing}`}
        />
      </span>
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
