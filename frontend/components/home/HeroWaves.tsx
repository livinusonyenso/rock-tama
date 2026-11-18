/**
 * Decorative hero background (UI_BREAKDOWN §03): two soft wave layers drawn in the
 * hero's 1440×525 coordinate space, traced from the reference (back wave rising to the
 * right behind the bottle, front wave across the bottom). Static by design
 * (ANIMATION_SYSTEM §9). Server Component, aria-hidden.
 */
export function HeroWaves() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 525"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 -z-10 size-full"
    >
      <defs>
        <linearGradient id="hero-wave-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:var(--color-forest-600)]" />
          <stop offset="1" className="[stop-color:var(--color-forest-800)]" />
        </linearGradient>
        <linearGradient id="hero-wave-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:var(--color-forest-600)]" />
          <stop offset="1" className="[stop-color:var(--color-forest-700)]" />
        </linearGradient>
      </defs>
      <path
        d="M0 452C250 440 520 448 740 400C960 352 1180 262 1440 236V525H0Z"
        fill="url(#hero-wave-back)"
        opacity="0.55"
      />
      <path
        d="M0 478C230 454 470 450 700 486C900 516 1160 452 1440 404V525H0Z"
        fill="url(#hero-wave-front)"
        opacity="0.6"
      />
    </svg>
  );
}
