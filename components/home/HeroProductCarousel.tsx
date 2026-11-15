"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type FocusEvent, type ReactNode } from "react";

export type CarouselSlide = { slug: string; name: string; shortName: string; href: string | null };

type HeroProductCarouselProps = {
  slides: CarouselSlide[];
  /** Server-rendered product frames (MediaFrame), one per slide, same order. */
  frames: ReactNode[];
  intervalMs: number;
  labels: { region: string; controls: string; pause: string; play: string; view: string };
  icons: { pause: ReactNode; play: ReactNode };
};

const noopSubscribe = () => () => {};
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (callback: () => void) => {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

/**
 * Hero Product Carousel (D-073): APG carousel pattern with React state + CSS transitions.
 * - Auto-rotates every `intervalMs` with a 600ms slide-and-fade; Pause/Play button (WCAG 2.2.2).
 * - Pauses while hovered, while it contains focus, and while the tab is hidden.
 * - Choosing a product stops auto-rotation until Play is pressed.
 * - Reduced motion: no auto-rotation by default and instant changes.
 * - Before hydration / without JavaScript: first slide only, product labels are links.
 */
export function HeroProductCarousel({ slides, frames, intervalMs, labels, icons }: HeroProductCarouselProps) {
  const enhanced = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(reducedMotionQuery).matches, () => false);
  const [index, setIndex] = useState(0);
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null); // null = default for the motion preference
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const playing = userPlaying ?? !reducedMotion;
  const rotating = enhanced && playing && !hovered && !focused && !tabHidden;

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), intervalMs);
    return () => window.clearInterval(timer);
  }, [rotating, intervalMs, slides.length]);

  const select = (next: number) => {
    setIndex(next);
    setUserPlaying(false); // manual choice stops auto-rotation until Play is pressed
  };
  // Focus inside pauses rotation, except on the Pause/Play control itself (APG carousel), so pressing
  // Play actually starts rotation.
  const isToggle = (node: EventTarget | null) => node instanceof Element && node.hasAttribute("data-carousel-toggle");
  const onFocus = (event: FocusEvent<HTMLDivElement>) => setFocused(!isToggle(event.target));
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!event.currentTarget.contains(next) || isToggle(next)) setFocused(false);
  };

  const active = slides[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.region}
      data-carousel-index={index}
      data-carousel-rotating={rotating || undefined}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={onFocus}
      onBlur={onBlur}
      className="flex flex-col items-center gap-6 lg:relative lg:block"
    >
      {/* Fixed frame: switching products never changes the hero's dimensions. */}
      <div aria-live={rotating ? "off" : "polite"} className="relative h-72 w-56 sm:h-80 sm:w-64 md:h-88 lg:h-hero-media lg:w-72">
        {slides.map((slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={slide.slug}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}: ${slide.name}`}
              aria-hidden={!isActive}
              inert={!isActive}
              data-slide={slide.slug}
              className={[
                "absolute inset-0 flex items-end justify-center transition-[opacity,translate] duration-600 ease-out-soft motion-reduce:transition-none",
                isActive ? "translate-x-0 opacity-100" : i < index ? "-translate-x-6 opacity-0" : "translate-x-6 opacity-0",
              ].join(" ")}
            >
              {(enhanced || i === 0) && frames[i]}
            </div>
          );
        })}
      </div>

      {/* Product labels (+ Pause/Play): beside the bottle on desktop, below it on smaller screens. */}
      <div className="flex flex-col items-center gap-3 lg:absolute lg:top-1/2 lg:left-full lg:ml-6 lg:-translate-y-1/2 lg:items-start">
        <div role="group" aria-label={labels.controls} className="flex flex-wrap justify-center gap-2 lg:flex-col">
          {slides.map((slide, i) => {
            const isActive = i === index;
            const look = `inline-flex min-h-11 items-center whitespace-nowrap rounded-button border px-4 text-sm font-semibold uppercase tracking-nav transition-colors duration-150 ease-standard ${
              isActive ? "border-gold-500 bg-gold-500/15 text-gold-200" : "border-line-dark/70 text-on-dark-muted hover:border-gold-500 hover:text-on-dark"
            }`;
            if (!enhanced) {
              // Without JavaScript the labels are honest links to the product pages.
              return slide.href ? (
                <Link key={slide.slug} href={slide.href} className={`${look} focus-ring-dark`}>
                  {slide.shortName}
                </Link>
              ) : null;
            }
            return (
              <button
                key={slide.slug}
                type="button"
                aria-pressed={isActive}
                aria-label={`${slide.name}`}
                onClick={() => select(i)}
                className={`${look} cursor-pointer focus-ring-dark`}
              >
                {slide.shortName}
              </button>
            );
          })}
        </div>

        {enhanced && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUserPlaying(!playing)}
              aria-label={playing ? labels.pause : labels.play}
              data-carousel-toggle
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-dark/70 text-on-dark-muted transition-colors duration-150 ease-standard hover:border-gold-500 hover:text-gold-500 focus-ring-dark"
            >
              {playing ? icons.pause : icons.play}
            </button>
            {active.href && (
              <Link href={active.href} className="text-sm font-semibold text-gold-500 underline-offset-4 hover:text-gold-400 hover:underline focus-ring-dark">
                {labels.view} {active.name}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
