import { IconFeature } from "@/components/ui/IconFeature";
import { Container } from "@/components/ui/Container";
import { purityHighlights } from "@/content/highlights";

/**
 * Purity / trust indicators (UI_BREAKDOWN §04): six highlights from content/highlights.ts.
 * Static (it sits directly under the animated hero). Server Component.
 */
export function TrustStrip() {
  return (
    <section aria-label="Purity highlights" className="border-t border-line-dark/60 bg-forest-800 text-on-dark">
      <Container size="wide">
        {/* Track = least-squares fit of the reference column centres: 6 × 221.6px (max-w-332), centred at
            x≈734 @1440, i.e. 10px inside the frame's right edge (lg:ml-auto lg:mr-2.5). */}
        <ul className="mx-auto grid max-w-332 grid-cols-2 gap-x-4 gap-y-8 py-8 sm:grid-cols-3 lg:mr-2.5 lg:ml-auto lg:grid-cols-6 lg:gap-0 lg:py-3">
          {purityHighlights.map((highlight) => (
            <li
              key={highlight.claim}
              data-claim={highlight.claim}
              className="relative lg:after:absolute lg:after:top-1/2 lg:after:right-0 lg:after:h-15 lg:after:w-px lg:after:-translate-y-1/2 lg:after:bg-line-dark-strong/50 lg:last:after:hidden"
            >
              <IconFeature icon={highlight.icon} label={highlight.label} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
