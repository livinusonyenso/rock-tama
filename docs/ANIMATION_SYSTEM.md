# Animation System

**Status: [PROPOSED]**, created 2026-11-15 at the owner's request. Nothing here is approved until the owner reviews each animation's behaviour (see `DECISIONS.md`). The one animation already approved and shipped is the mobile drawer slide-in (D-054).

## 1. Principles [PROPOSED]

1. **Motion serves content.** It guides attention (hero → product → action) or confirms an interaction. No decoration for its own sake.
2. **Premium = restrained.** Short distances (8–16px), opacity + transform only, soft deceleration. No bounce, elastic, spin, perpetual float or parallax without explicit owner approval.
3. **Never block reading or interaction.** Above-the-fold content is readable within ~1s; controls are clickable from the first frame.
4. **Content never depends on animation.** Elements are visible with CSS animations disabled, with reduced motion, and without JavaScript.
5. **No layout shift.** Animate `opacity` and `transform` only; never `width`, `height`, `top`/`left`, margins or anything that reflows.
6. **One system, used consistently.** The same durations, easing and distances in every section, from the tokens below.

## 2. Technology choice [PROPOSED]

| Need | Technique | Why |
|---|---|---|
| Hover, focus, press, colour/shadow feedback | **CSS transitions** (Tailwind `transition-*`) | Zero JS; the browser's compositor |
| On-load entrance sequences (hero) | **CSS `@keyframes` + per-element delays**, defined once in `globals.css` | Runs from the first paint of server-rendered HTML, so no hydration step, no flash, no JS; works without JavaScript; easy to disable with reduced motion |
| Open/close of overlays (drawer, future dropdown) | **CSS transitions + `@starting-style`** (as in `MobileNav`) | Native; no library |
| Scroll-triggered section reveals | **Decided at §5 (D-088): (a) `components/ui/Reveal.tsx`**, an `IntersectionObserver` island that sets `data-reveal`; CSS in `globals.css` does the fade + 16px rise (600ms, `--ease-out-soft`, stagger via `--reveal-delay`) | Works in every browser (scroll-driven animations don't yet); visible without JS; no library |
| Complex orchestrated or gesture-driven sequences | **`motion` (Motion for React)**, only if a real requirement appears | See §8 |

**Not used:** GSAP, Three.js, or more than one animation library, without owner approval.

## 3. Tokens [easing implemented M3; durations applied per element]

Implemented: `--ease-standard`, `--ease-out-soft`, the `enter` keyframes, `animate-enter` (declared in `@theme inline` so per-element variables resolve on each element), and utilities `enter-delay-<ms>`, `enter-duration-<ms>`, `enter-rise-<px>`, `enter-fade`, `enter-scale-<percent>`. Reduced motion: one unlayered `@media (prefers-reduced-motion: reduce) { .animate-enter { animation: none } }` rule. The duration values below are the conventions those utilities use.

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 150ms | Hover/press feedback |
| `--motion-base` | 250ms | UI state changes (colour, shadow, drawer = 200ms existing) |
| `--motion-enter` | 450ms | Content entrance (eyebrow, text, buttons) |
| `--motion-enter-slow` | 600ms | Headline entrance |
| `--motion-media` | 750ms | Hero product image entrance |
| `--ease-out-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances (fast start, long soft settle) |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | UI state transitions |
| Entrance distance | 8px (text, buttons), 12px (headline), 16px (media) | `translateY` only |
| Scale | ≥ 0.98 → 1 | Media only; never above 1.03 on hover |
| Stagger step | 60–100ms | Between related elements |
| Sequence budget | ≤ ~1000ms to final state; first element starts at 0ms | Above-the-fold groups |

## 4. Reusable patterns [PROPOSED]

1. **`enter` (fade + rise):** keyframes from `opacity: 0; transform: translateY(var(--enter-distance))` to the natural state. `animation-fill-mode: both` + a `--enter-delay` custom property per element. Utility classes `animate-enter`, `animate-enter-fade` (no movement) and `animate-enter-media` (rise + 0.98 scale).
2. **Interactive feedback:** buttons and links use `transition` on `background-color`, `border-color`, `color`, `box-shadow`, `transform` with `--motion-fast` and `--ease-standard`; hover lift at most `translateY(-1px)`; active state returns to 0.
3. **Overlay open:** `@starting-style` + `transition-discrete` (existing drawer).
4. **Scroll reveal [IMPLEMENTED §5]:** `Reveal`, once per element, 16px rise; hides nothing that starts in the viewport, nothing without JS, nothing with reduced motion; elements jumped past are revealed too. §5 storyboard: heading block, then the 4 cards staggered 0/80/160/240ms; card hover = shadow + 2px lift (150ms, none with reduced motion); buttons keep their existing colour transitions.

## 5. Reduced motion (mandatory)

- `@media (prefers-reduced-motion: reduce)`: all entrance animations are **removed** (`animation: none`, content at its final state immediately); transforms on hover are removed; colour/opacity feedback may stay (≤150ms).
- Tailwind: `motion-reduce:animate-none motion-reduce:transition-none` (or the equivalent in the shared utilities, so components don't repeat it).
- Verified automatically (see §7).

## 6. Performance (mandatory)

- Only `opacity` and `transform` are animated (compositor-friendly; no CLS).
- **LCP:** the likely LCP element (hero heading now; the bottle once the photo exists) starts its entrance at 0–100ms. A real hero image should not start from `opacity: 0` (Chrome reports LCP only once it is painted visibly), so it uses transform/scale with a short, early fade (decided when the photo arrives).
- No continuous animations (`infinite`) without approval; none on large surfaces such as the waves.
- No JS animation runtime for the hero, so the bundle is unchanged.
- `will-change` only if profiling shows a need; never left on permanently.

## 7. Verification (extends `npm run verify:visual`) [PROPOSED]

Static screenshots and animation behaviour are tested **separately and deterministically**, with no arbitrary sleeps:

| Check | How |
|---|---|
| Stable screenshots | The settle step waits for `Promise.all(document.getAnimations().map(a => a.finished))` (finite animations), so screenshots show the final state |
| Initial state | Pause all animations at `currentTime = 0`; assert animated elements start at opacity 0 / offset, and take an "initial" screenshot |
| No layout shift | Compare each animated element's layout box (`offsetLeft/Top/Width/Height`, which ignores transforms) at t=0 and at the end; they must be identical |
| Sequence budget | Read `getTiming()` (delay + duration) of every entrance animation; the maximum must be ≤ the budget (≈1000ms); the first must start ≤ 100ms |
| Reduced motion | Emulate `prefers-reduced-motion: reduce`; assert `document.getAnimations()` has no entrance animations and all content is at opacity 1 on first paint |
| Interactivity during animation | At t=0, the CTAs are hit-testable (`elementFromPoint`) and focusable |
| No console errors / overflow | Existing checks, in initial and final states |

## 8. `motion` (Motion for React): evaluation [PROPOSED]

- **Compatibility:** `motion@14.14.0` declares peer `react ^18 || ^19`, MIT. Its animated components are Client Components (`"use client"`), so any section using them needs a client boundary. Keep them in small wrapper islands with server-rendered children.
- **Cost:** adds a client-side animation runtime (tens of kB gzipped; the exact figure to be measured with a production build if it is ever adopted). Its `LazyMotion` + `m` pattern reduces this.
- **Strengths:** orchestration (variants, staggerChildren), gestures, layout animations, exit animations, a built-in reduced-motion hook.
- **Recommendation:** **not needed for M3**; CSS covers every hero effect with zero JS. Re-evaluate only if a later requirement needs exit/layout animations or complex gesture choreography. If adopted, pin a version at least two weeks old (14.14.0 was published 2026-11-13).

## 9. Section decisions

| Section | Animated | Static | Status |
|---|---|---|---|
| Mobile drawer | Slide-in 200ms (`ease-out`), none with reduced motion | Backdrop | **APPROVED** (D-054) |
| Header / announcement bar | Link hover colour (existing) | Everything else | Existing |
| Hero (M3) | Entrance: eyebrow + rule 0/450ms rise 8 · heading 80/600 rise 12 · bottle 120/750 rise 16 + scale 0.98 · tagline 200/450 fade · description 260/450 rise 8 · CTA group 340/450 rise 8 → all done at **870ms**. Buttons: hover colour/shadow + 1px lift (150ms) | Background, glow, waves, layout boxes | **APPROVED (D-068), implemented M3.3**; hover verified once CTAs are live (F1/F2) |

| Trust strip (§4) | — | Everything (static: directly under the animated hero; above the fold at desktop) | Implemented 2026-11-15 |
| Hero Product Carousel (F2) | Auto-rotate 6s; 600ms slide (24px) + cross-fade, `ease-out-soft`; pause on hover, focus inside (not on the toggle), hidden tab; manual selection stops auto-rotation until Play | Product frame box, labels | **Implemented 2026-11-15 (D-085)**; verified incl. real rotation, pauses, reduced motion (no rotation, `transition: none`) |
| Shop menu (F2) | Panel `enter` 150ms rise 4px; chevron rotates 180° (150ms) | — | Implemented; off with reduced motion |

When planning any new visible section, add a row here and a storyboard to its briefing.

## §6 storyboard [APPROVED D-092; source implemented, browser verification pending]

See `ORIGIN_SECTION_BRIEFING.md`: reuse D-088 Reveal (600ms / 16px), image 0ms, text 80ms, indicators 0/60/120ms independently; map/background static, no nested reveals. Reduced motion/no-JS stay visible.
