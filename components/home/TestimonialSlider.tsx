"use client";

import { Children, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

type Props = {
  /** Accessible name of the carousel region and its scroll track. */
  label: string;
  /** One accessible name per slide, e.g. "Store Owner, Supermarket, Onitsha". */
  slideLabels: readonly string[];
  intervalMs?: number;
  /** Server-rendered testimonial cards, one per slide. */
  children: ReactNode;
};

const noopSubscribe = () => () => {};

/** Distance between two card starts (card width + gap), measured so it follows the responsive layout. */
const stepOf = (el: HTMLUListElement) => {
  const cards = el.children;
  if (cards.length < 2) return el.clientWidth || 1;
  return (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft || 1;
};
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

/**
 * Testimonial slider (D-112, controls removed by the owner in D-113). A native CSS scroll-snap track does the
 * sliding (smooth scrolling, touch swipe, keyboard scrolling, works without JavaScript); this island only adds
 * autoplay: one card every `intervalMs`, looping. With no visible Pause control, autoplay pauses on hover, on
 * keyboard focus and on a hidden tab, and **stops for good** once the visitor swipes, drags, wheels or uses the
 * keyboard on the track (WCAG 2.2.2). Reduced motion: no autoplay.
 */
export function TestimonialSlider({ label, slideLabels, intervalMs = 5000, children }: Props) {
  const enhanced = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const items = Children.toArray(children);
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [positions, setPositions] = useState(1);
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const rotating = enhanced && !stopped && !reduced && !hovered && !focused && !hidden && positions > 1;

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const size = stepOf(el);
    const count = Math.max(1, Math.round((el.scrollWidth - el.clientWidth) / size) + 1);
    setPositions(count);
    setActive(Math.min(count - 1, Math.round(el.scrollLeft / size)));
  }, []);

  const advance = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const target = active + 1 > positions - 1 ? 0 : active + 1;
    el.scrollTo({ left: target * stepOf(el), behavior: "smooth" });
  }, [active, positions]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    // Any direct interaction with the track hands control to the visitor: autoplay stops for good.
    const stop = () => setStopped(true);
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", stop, { passive: true });
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("keydown", stop);
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("wheel", stop);
      el.removeEventListener("keydown", stop);
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(advance, intervalMs);
    return () => window.clearInterval(timer);
  }, [rotating, advance, intervalMs]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}
      data-carousel-index={active} data-carousel-rotating={rotating || undefined} data-carousel-stopped={stopped || undefined}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      {/* Scrollable region: focusable so keyboard users can scroll it with the arrow keys. */}
      <ul ref={track} tabIndex={0} aria-label={label} data-enhanced={enhanced || undefined}
        className="-mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth scroll-px-1 px-1 py-2 focus-ring motion-reduce:scroll-auto data-enhanced:[scrollbar-width:none] data-enhanced:[&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => (
          <li key={slideLabels[index] ?? index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}: ${slideLabels[index]}`}
            className="shrink-0 basis-full snap-start md:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
