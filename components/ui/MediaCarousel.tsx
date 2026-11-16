"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const noopSubscribe = () => () => {};
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

type Props = { frames: ReactNode[]; label: string; aspect: string; className?: string; icons: { previous: ReactNode; next: ReactNode; pause: ReactNode; play: ReactNode } };

/** Image-only card carousel. Frames stay server-rendered; geometry and copy never change. */
export function MediaCarousel({ frames, label, aspect, className = "", icons }: Props) {
  const enhanced = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const enabled = useRef(false);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const rotating = visible && !reduced && !paused && !hovered && !focused;

  const select = useCallback(async (next: number, manual = true) => {
    const token = ++request.current;
    if (manual) { setPaused(true); enabled.current = false; }
    const target = (next + frames.length) % frames.length;
    if (target === index) return;
    const image = root.current?.querySelector<HTMLImageElement>(`[data-media-slide="${target}"] img`);
    if (image) { image.loading = "eager"; await image.decode().catch(() => {}); }
    if (token !== request.current || (!manual && !enabled.current)) return;
    setIndex(target);
  }, [frames.length, index]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let intersecting = false;
    const sync = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(entries => { intersecting = entries[0].isIntersecting && entries[0].intersectionRatio >= .25; sync(); }, { threshold: .25 });
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => () => { request.current++; }, []);

  useEffect(() => {
    enabled.current = rotating;
    if (!rotating || frames.length < 2) return;
    const timer = window.setInterval(() => { void select(index + 1, false); }, 4000);
    return () => { enabled.current = false; window.clearInterval(timer); };
  }, [rotating, frames.length, index, select]);

  const button = "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gold-700 bg-cream-200 text-xl text-forest-850 focus-ring";
  return <div ref={root} role="region" aria-roledescription="carousel" aria-label={`${label} image variants`}
    data-media-carousel data-media-index={index} data-media-rotating={rotating || undefined}
    className={`media-carousel ${className}`} style={{ aspectRatio: aspect }}
    onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onPointerDown={event => {
      if (event.pointerType === "mouse" || !event.isPrimary || (event.target as Element).closest("button")) return;
      gesture.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId);
    }} onPointerCancel={() => { gesture.current = null; }} onPointerUp={event => {
      const start = gesture.current; gesture.current = null; if (!start) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2) void select(index + (dx < 0 ? 1 : -1));
    }}>
    <div className="absolute inset-0 overflow-hidden" aria-live={rotating ? "off" : "polite"}>
      {frames.map((frame, i) => <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${frames.length}`}
        data-media-slide={i} aria-hidden={i !== index} inert={i !== index}
        className="media-carousel-slide" style={{ opacity: i === index ? 1 : 0, translate: i === index ? "0" : i < index ? "-32px 0" : "32px 0" }}>{frame}</div>)}
    </div>
    {enhanced && <div className="media-carousel-controls" role="group" aria-label={`${label} image controls`}>
      <button type="button" className={button} aria-label={`Previous ${label} image`} onClick={() => { void select(index - 1); }}>{icons.previous}</button>
      <button type="button" className={button} aria-label={`Next ${label} image`} onClick={() => { void select(index + 1); }}>{icons.next}</button>
      <button type="button" className={button} aria-label={paused ? `Play ${label} images` : `Pause ${label} images`} disabled={reduced} onClick={() => setPaused(value => !value)}>
        {paused ? icons.play : icons.pause}
      </button>
    </div>}
  </div>;
}
