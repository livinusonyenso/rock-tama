# Implementation Plan — **[PROPOSED]** build order

This is a proposal, not an immutable sequence. Each milestone is split into tasks, and each task needs approval (see `/rock-tama-section-workflow`).

Universal verification for every task: `npm run lint`, `npx tsc --noEmit`, plus the milestone-specific checks below. `npm run build` is required from M3 onward.

## M1 — Foundation

- **Tasks:** 1.1 `git init` + first commit (if approved) · 1.2 design tokens in `app/globals.css` (`@theme`), remove starter dark-mode tokens · 1.3 fonts via `next/font` in `layout.tsx` + metadata (title/description/lang) · 1.4 `Container`, `ButtonLink`, `MediaFrame` primitives · 1.5 temporary neutral `page.tsx` (replaces the starter demo).
- **Depends on:** decisions D-006, D-007, D-009, D-010 approved. Font choice confirmed.
- **Acceptance:** tokens produce utilities (`bg-forest-900`, `font-serif`); no starter Geist/demo content remains; primitives render in a scratch area of the page.
- **Verify:** lint, tsc, build, visual spot-check of fonts and colours against the reference.

## M2 — Header

- **Tasks:** 2.1 `content/site.ts` + `content/navigation.ts` + types · 2.2 `AnnouncementBar` · 2.3 `Logo` (fallback until the asset arrives) · 2.4 `SiteHeader` + `NavLink` (desktop) · 2.5 `ShopMenu` · 2.6 `MobileNav`.
- **Depends on:** M1; logo asset or approval of a text fallback; icon decision D-008; nav route decision D-015.
- **Acceptance:** matches reference at ≥1280; active state + `aria-current`; dropdown and drawer keyboard accessible (Tab, Escape, focus return); no horizontal scroll at 375 px.
- **Verify:** lint, tsc, build, keyboard walk-through, 1280/768/375 visual check.

## M3 — Hero

- **Tasks:** 3.1 `HeroSection` content + CTAs · 3.2 `HeroWaves` SVG + glow · 3.3 bottle `MediaFrame` · 3.4 responsive layout.
- **Depends on:** M1 primitives, M2 (page frame).
- **Acceptance:** single `<h1>`; CTAs are links; bottle box keeps 2:5 with or without an image; no CLS from the placeholder; copy fix approved.
- **Verify:** build, visual comparison, Lighthouse CLS ≈ 0 for the hero.

## M4 — Trust strip

- **Tasks:** 4.1 `content/highlights.ts` (`purityHighlights`) · 4.2 custom icons · 4.3 `IconFeature` · 4.4 `TrustStrip`.
- **Depends on:** M1, D-008. Claims accepted for display (or shown as placeholders pending evidence).
- **Acceptance:** renders from data; 6 / 3×2 / 2×3 layouts; dividers CSS-only.

## M5 — Products

- **Tasks:** 5.1 `Product` type + `content/products.ts` · 5.2 `SectionHeading` · 5.3 `ProductCard` (`side`, `stacked`) · 5.4 `ProductRangeSection`.
- **Depends on:** M1 (`MediaFrame`, `ButtonLink`), M4 (pattern for data-driven content).
- **Acceptance:** 4 / 2 / 1 columns; equal-height cards; no prices; CTA destinations per D-015.

## M6 — Origin and Quality

- **Tasks:** 6.1 `OriginSection` + origin features · 6.2 `AfricaMap` (licensed outline) · 6.3 `QualitySection` + indicators · 6.4 certification flag + badge.
- **Depends on:** M4 (`IconFeature`), M5 (`SectionHeading`); map source; ISO evidence (otherwise the badge stays hidden).
- **Acceptance:** layouts at all breakpoints; badge hidden by default unless the flag is approved; "Undistilled" spelling decided.

## M7 — Wholesale banner and Footer

- **Tasks:** 7.1 `WholesaleBanner` · 7.2 footer content + `SiteFooter` · 7.3 `NewsletterForm` UI (no backend) · 7.4 social links.
- **Depends on:** M4/M1 components; social URLs from the owner.
- **Acceptance:** semantic footer navs; labelled form with client-side validation states; real social URLs or links omitted.

## M8 — Homepage verification

- **Tasks:** responsive pass (375/768/1024/1280/1440) · accessibility audit (axe/Lighthouse, keyboard, contrast) · side-by-side screenshot comparison · performance (LCP, CLS, JS size) · SEO (metadata, OG image, structured data `Organization`/`Product` without invented data) · remove starter assets.
- **Acceptance:** Lighthouse a11y ≥ 95, CLS < 0.1, no console errors, documented deviations from the reference.

## M9 — Additional pages and backend

To be defined after Scope B decisions in [`ECOMMERCE_REQUIREMENTS.md`](ECOMMERCE_REQUIREMENTS.md). Likely first: wholesale enquiry page + Server Action, contact page, static policy pages.
