import { HeroWaves } from "@/components/home/HeroWaves";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { hero } from "@/content/hero";
import { resolveHref } from "@/lib/navigation";

/**
 * Homepage hero (UI_BREAKDOWN §03). Server Component; no client JavaScript.
 * CTAs resolve through the route registry, so they become live links as soon as
 * /shop and /wholesale genuinely work (D-067).
 */
export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-hero text-on-dark">
      <HeroWaves />
      <Container className="grid gap-10 pt-12 md:grid-cols-2 md:gap-6 lg:min-h-hero lg:pt-0">
        <div className="md:self-center lg:self-start lg:pt-11">
          {/* Entrance storyboard (D-068, ANIMATION_SYSTEM §9): CSS only, done by ≈870ms, off with reduced motion */}
          <p className="animate-enter text-sm font-semibold uppercase tracking-eyebrow text-gold-500 lg:text-hero-eyebrow lg:tracking-hero-eyebrow">
            {hero.eyebrow}
          </p>
          <span aria-hidden="true" className="mt-3 block h-0.5 w-12 animate-enter bg-gold-500 lg:h-px lg:w-16" />
          <h1
            id="hero-heading"
            className="mt-4 animate-enter font-serif text-5xl font-bold leading-none enter-delay-80 enter-duration-600 enter-rise-12 sm:text-6xl md:text-5xl lg:mt-3 lg:text-7xl xl:text-display"
          >
            {hero.heading}
          </h1>
          <p className="mt-3 animate-enter font-serif text-2xl font-semibold italic enter-fade enter-delay-200 sm:text-3xl md:text-2xl lg:mt-0 lg:text-4xl xl:text-tagline">{hero.tagline}</p>
          <p className="mt-5 max-w-120 animate-enter text-base leading-relaxed text-on-dark enter-delay-260 lg:mt-2 lg:max-w-120 lg:text-xl lg:leading-snug">{hero.description}</p>
          <div className="mt-8 flex animate-enter flex-col gap-4 enter-delay-340 sm:flex-row sm:flex-wrap sm:gap-5 lg:mt-4">
            {hero.actions.map((action) => (
              <ButtonLink
                key={action.label}
                href={resolveHref(action.route)}
                variant={action.variant}
                icon={action.icon}
                className="sm:min-w-56 lg:min-w-62"
              >
                {action.label}
              </ButtonLink>
            ))}
          </div>
        </div>

        <div className="flex animate-enter justify-center pb-6 enter-delay-120 enter-duration-750 enter-rise-16 enter-scale-98 md:self-end md:pb-5">
          <MediaFrame
            media={hero.media}
            priority
            sizes="(min-width: 1024px) 190px, 140px"
            className="h-72 sm:h-80 md:h-88 lg:h-hero-media"
          />
        </div>
      </Container>
    </section>
  );
}
