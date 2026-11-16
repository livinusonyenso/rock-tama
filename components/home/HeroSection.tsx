import Image from "next/image";
import { heroBackground } from "@/content/media";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { HeroProductCarousel, type CarouselSlide } from "@/components/home/HeroProductCarousel";
import { Icon } from "@/components/icons/Icon";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { hero } from "@/content/hero";
import { productBySlug } from "@/content/products";
import { productHref, resolveHref } from "@/lib/navigation";
import type { Product } from "@/types/content";

/**
 * Homepage hero (UI_BREAKDOWN §03). Server Component; no client JavaScript.
 * CTAs resolve through the route registry, so they become live links as soon as
 * /shop and /wholesale genuinely work (D-067).
 */
export function HeroSection() {
  const products = hero.carousel.products.map(productBySlug).filter((product): product is Product => Boolean(product));
  const slides: CarouselSlide[] = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    shortName: product.shortName,
    href: productHref(product),
  }));
  // Frames are server-rendered and passed to the client carousel (no image/icon code in the client bundle).
  // Portrait products fill the frame height; landscape ones (cartons) fill its width.
  const frames = products.map((product, i) => {
    const media = product.heroMedia ?? product.media;
    const [w, h] = media.aspect.split("/").map(Number);
    return (
      <MediaFrame
        key={product.slug}
        media={media}
        priority={i === 0}
        sizes={w > h ? "(min-width: 1024px) 288px, 256px" : `(min-width: 1024px) ${Math.ceil(480 * w / h)}px, (min-width: 768px) ${Math.ceil(352 * w / h)}px, (min-width: 640px) ${Math.ceil(320 * w / h)}px, ${Math.ceil(288 * w / h)}px`}
        className={w > h ? "w-full" : "h-full"}
      />
    );
  });

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-hero text-on-dark">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" data-hero-background>
        <Image src={heroBackground.src} alt="" fill preload sizes="100vw" className="hero-background-image object-cover" />
        <div className="hero-background-overlay absolute inset-0" />
      </div>
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
          <div data-hero-actions className="mt-8 flex animate-enter flex-col gap-4 enter-delay-340 sm:flex-row sm:flex-wrap sm:gap-5 lg:mt-4">
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
          <HeroProductCarousel
            slides={slides}
            frames={frames}
            intervalMs={hero.carousel.intervalMs}
            labels={{
              region: hero.carousel.label,
              controls: hero.carousel.controlsLabel,
              pause: hero.carousel.pauseLabel,
              play: hero.carousel.playLabel,
              view: hero.carousel.viewLabel,
            }}
            icons={{
              pause: <Icon name="pause" strokeWidth={1.75} className="size-5" />,
              play: <Icon name="play" strokeWidth={1.75} className="size-5" />,
            }}
          />
        </div>
      </Container>
    </section>
  );
}
