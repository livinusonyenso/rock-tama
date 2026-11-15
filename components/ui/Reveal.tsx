"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger delay in ms (e.g. 80 per card). */
  delay?: number;
  className?: string;
};

/**
 * Scroll reveal (ANIMATION_SYSTEM §4.4; approved for §5). Content is visible by default: only after
 * JavaScript runs, and only for elements starting below the viewport, does it set data-reveal="hidden";
 * it switches to "shown" when the element enters the viewport (once). Without JavaScript, with reduced
 * motion, or above the fold, nothing is hidden. No React state: a DOM attribute + CSS transition.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return; // already visible: never hide

    element.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      // The root extends far upward so an element that is jumped past (anchor link, End key, restored
      // scroll) also counts as reached; IntersectionObserver gives no callback when an element skips the viewport.
      { rootMargin: "100000px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}>
      {children}
    </div>
  );
}
