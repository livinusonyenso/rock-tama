"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

type Slide = { id: string; title: string };
type Props = {
  slides: readonly Slide[];
  intro: ReactNode;
  copy: ReactNode[];
  frames: ReactNode[];
  icons: { previous: ReactNode; next: ReactNode; pause: ReactNode; play: ReactNode };
  intervalMs?: number;
};

const noopSubscribe = () => () => {};
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

/** Interactivity only: content, image frames and icons are passed from the Server Component. */
export function HeroCarousel({ slides, intro, copy, frames, icons, intervalMs = 4000 }: Props) {
  const enhanced = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState(-1);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const autoAllowed = useRef(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const rotating = enhanced && playing && !reduced && !hovered && !focused && !hidden;

  const select = useCallback(async (next: number, step: number, manual = true) => {
    if (manual) { setPlaying(false); autoAllowed.current = false; }
    const token = ++request.current;
    const target = (next + slides.length) % slides.length;
    if (target === index) return;
    // Decode before exposing a new bottle, so slow connections never flash an empty frame.
    const image = root.current?.querySelector<HTMLImageElement>(`[data-frame="${target}"] img`);
    if (image) {
      image.loading = "eager";
      await image.decode().catch(() => {});
    }
    if (token !== request.current || (!manual && !autoAllowed.current)) return;
    setPrevious(index);
    setDirection(step);
    setIndex(target);
  }, [index, slides.length]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => () => { request.current++; }, []);

  useEffect(() => {
    autoAllowed.current = rotating;
    if (!rotating || slides.length < 2) return;
    const timer = window.setInterval(() => { void select(index + 1, 1, false); }, intervalMs);
    return () => { autoAllowed.current = false; window.clearInterval(timer); };
  }, [rotating, index, intervalMs, select, slides.length]);

  const control = "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-on-dark-muted/60 text-on-dark transition-colors hover:border-gold-500 hover:text-gold-500 focus-ring-dark";

  return (
    <div ref={root} role="region" aria-roledescription="carousel" aria-label="ROCK-TAMA water and occasion labels"
      data-carousel-index={index} data-carousel-rotating={rotating || undefined}
      onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      className="hero-carousel" style={{ "--carousel-direction": direction } as CSSProperties}>
      <div className="hero-carousel-copy">
        {intro}
        <div className="hero-copy-stack" aria-live={rotating ? "off" : "polite"} aria-atomic="true">
          {slides.map((slide, i) => (
            <div key={slide.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}: ${slide.title}`}
              aria-hidden={i !== index} inert={i !== index} data-slide={slide.id} data-active={i === index}
              className="hero-slide-copy">
              {copy[i]}
            </div>
          ))}
        </div>
      </div>
      <div className="hero-bottle-stage animate-enter enter-delay-120 enter-duration-750 enter-rise-16 enter-scale-98"
        onPointerDown={event => {
          if (!enhanced || event.pointerType === "mouse" || !event.isPrimary) return;
          swipe.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { swipe.current = null; }}
        onPointerUp={event => {
          const start = swipe.current;
          swipe.current = null;
          if (!start) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) void select(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        }}>
        {slides.map((slide, i) => (
          <div key={slide.id} data-frame={i} aria-hidden={i !== index} inert={i !== index}
            className="hero-bottle-frame" style={{ opacity: i === index ? 1 : 0, translate: i === index ? "0" : `${(i === previous ? -1 : 1) * direction * 48}px 0` }}>
            {frames[i]}
          </div>
        ))}
      </div>
      {enhanced && (
        <div className="hero-carousel-controls">
          <div role="group" aria-label="Choose a slide" className="flex items-center gap-1">
            {slides.map((slide, i) => (
              <button key={slide.id} type="button" aria-label={`Show ${slide.title}`} aria-pressed={i === index}
                onClick={() => { void select(i, i >= index ? 1 : -1); }} className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full focus-ring-dark">
                <span aria-hidden="true" className={`size-3 rounded-full border-2 ${i === index ? "border-gold-500 bg-gold-500" : "border-on-dark bg-forest-900/50"}`} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className={control} aria-label="Previous slide" onClick={() => { void select(index - 1, -1); }}>{icons.previous}</button>
            <button type="button" className={control} aria-label="Next slide" onClick={() => { void select(index + 1, 1); }}>{icons.next}</button>
            <button type="button" className={control} data-carousel-toggle aria-label={playing && !reduced ? "Stop automatic slide show" : "Start automatic slide show"}
              disabled={reduced} onClick={() => setPlaying(value => !value)}>{playing && !reduced ? icons.pause : icons.play}</button>
          </div>
          {reduced && <span className="text-sm text-on-dark-muted">Automatic playback off: reduced motion</span>}
        </div>
      )}
    </div>
  );
}
