import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types/content";

type IconFeatureProps = {
  icon: IconName;
  label: string;
  /** Surface: dark green (gold icon, light text) or light (gold icon, ink text). */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Icon above a short label (COMPONENT_ARCHITECTURE §5). Shared by the trust strip, origin,
 * quality and supply sections. "\n" in the label is a line break on wide screens only, so short
 * columns on small screens wrap naturally. Server Component; icon is decorative.
 */
export function IconFeature({ icon, label, tone = "dark", className = "" }: IconFeatureProps) {
  const [first, ...rest] = label.split("\n");
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <Icon name={icon} strokeWidth={1.5} className="size-9 shrink-0 text-gold-500 lg:size-12" />
      {/* min-h for two lines keeps single-line labels vertically centred against two-line ones */}
      <p className={`mt-1.5 flex min-h-[2lh] items-center text-base leading-snug font-medium lg:text-xl lg:leading-5 ${tone === "dark" ? "text-on-dark" : "text-ink-900"}`}>
        <span>
          {first}
          {rest.length > 0 && (
            <>
              <br className="hidden lg:block" />
              <span className="lg:hidden"> </span>
              {rest.join(" ")}
            </>
          )}
        </span>
      </p>
    </div>
  );
}
