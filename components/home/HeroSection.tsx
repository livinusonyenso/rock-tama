import Image from "next/image";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { hero } from "@/content/hero";
import { heroSlides } from "@/content/hero-slides";
import { heroBackground } from "@/content/media";
import { resolveHref } from "@/lib/navigation";

/** Static background and content stay on the server; only carousel behaviour is interactive. */
export function HeroSection() {
  const copy = heroSlides.map(slide => {
    const base = resolveHref(slide.route);
    const href = base && slide.occasion ? `${base}?occasion=${slide.occasion}` : base;
    return <div key={slide.id}>
      <h2 className="font-serif text-2xl font-semibold md:text-3xl">{slide.title}</h2>
      <p className="mt-3 max-w-120 text-base leading-relaxed lg:text-lg">{slide.description}</p>
      <p className="mt-2 min-h-5 text-sm text-on-dark-muted">{slide.concept ? "Proposed label concept · enquire about available options" : "Explore the ROCK-TAMA collection"}</p>
      <div data-hero-actions className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink href={href} variant="primary" icon={slide.concept ? "file-text" : "shopping-cart"}>{slide.cta}</ButtonLink>
        <ButtonLink href={resolveHref("wholesale")} variant="outline-dark" icon="warehouse">Request Wholesale</ButtonLink>
      </div>
    </div>;
  });
  const frames = heroSlides.map((slide, index) => <Image key={slide.id} src={slide.image.src} alt={slide.image.alt}
    fill preload={index === 0} loading={index === 0 ? undefined : "lazy"} sizes="(min-width: 1024px) 190px, (min-width: 768px) 160px, 120px" className="object-contain" />);
  return <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-hero text-on-dark">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" data-hero-background>
      <Image src={heroBackground.src} alt="" fill preload sizes="100vw" className="hero-background-image object-cover" />
      <div className="hero-background-overlay absolute inset-0" />
    </div>
    <Container>
      <HeroCarousel slides={heroSlides} copy={copy} frames={frames} intervalMs={4000}
        intro={<div className="animate-enter">
          <p className="text-sm font-semibold uppercase tracking-eyebrow text-gold-500 lg:text-lg">{hero.eyebrow}</p>
          <span aria-hidden="true" className="my-4 block h-0.5 w-16 bg-gold-500" />
          <h1 id="hero-heading" className="font-serif text-5xl font-bold leading-none sm:text-6xl md:text-5xl lg:text-7xl xl:text-display">{hero.heading}</h1>
          <p className="mt-3 mb-6 font-serif text-2xl font-semibold italic lg:text-3xl">{hero.tagline}</p>
        </div>}
        icons={{ previous: <Icon name="chevron-right" className="size-5 rotate-180" />, next: <Icon name="chevron-right" className="size-5" />, pause: <Icon name="pause" className="size-5" />, play: <Icon name="play" className="size-5" /> }} />
    </Container>
  </section>;
}
