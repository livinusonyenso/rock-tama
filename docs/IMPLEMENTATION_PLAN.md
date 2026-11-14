# Implementation Plan — **[PROPOSED]** build order

This is a proposal, not an immutable sequence. Each milestone is split into tasks, and each task needs approval (see `/rock-tama-section-workflow`).

Universal verification for every task: `npm run lint`, `npx tsc --noEmit`, plus the milestone-specific checks below. `npm run build` is required from M3 onward.

## M1 — Foundation — **DONE 2026-11-14** (approved scope)

- **Approved tasks:** 1.1 git baseline · 1.2 design tokens in `app/globals.css` · 1.3 fonts via `next/font` (+ ROCK-TAMA title/description metadata, per D-017) · 1.4 removal of starter dark-mode styling. All done and verified (see `PROGRESS.md`).
- **Moved out (D-025, proposed):** the earlier tasks "primitives" and "temporary page" are not part of M1. `Container` is built in M2; `ButtonLink` and `MediaFrame` in M3. Starter `app/page.tsx` is replaced in M3.

## M2 — Header

- **Tasks:** 2.1 typed site + navigation content, route availability, `resolveHref` (**done 2026-11-15**) · 2.2 install `lucide-react` + `Container` + `AnnouncementBar` (**done 2026-11-15**) · 2.3 `Logo` placeholder (D-020) (**done 2026-11-15**) · 2.4 `SiteHeader` + `NavLink` (desktop, pending-item rendering per D-027, cart count prop per D-029) · 2.5 `ShopMenu` · 2.6 `MobileNav`.
- **Depends on:** M1 ✓; D-008 ✓; D-015 ✓; D-020 ✓; D-003/D-004/D-005 approval.
- **Acceptance:** matches reference at ≥1280; active state + `aria-current`; dropdown and drawer keyboard accessible (Tab, Escape, focus return); no horizontal scroll at 375 px.
- **Verify:** lint, tsc, build, keyboard walk-through, 1280/768/375 visual check.

### M2 follow-up tasks (added 2026-11-15)

- **M2.V: Repeatable visual verification script.** **Approved (D-040)**; next task, before M2.4.
- **M2.7: Header visual refinement.** Fix the open differences V-001 (filled globe via licensed SVG), V-002 (local right-edge alignment, not a global `Container` change), V-003 (typography tuning within Source Sans 3), plus any header differences found in M2.4–2.6. Log: `docs/verification/README.md`.

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

## Maintenance (unscheduled, separate from milestones)

- **Dependency maintenance:** review the 7 moderate dev-only advisories (`minimatch` via `eslint-config-next` / `typescript-eslint`, see `TECH_STACK.md`), upgrade tooling if fixes are available, re-run lint/tsc/build. Production deps currently have 0 advisories.

## M9 — Additional pages and backend

To be defined after Scope B decisions in [`ECOMMERCE_REQUIREMENTS.md`](ECOMMERCE_REQUIREMENTS.md). Likely first: wholesale enquiry page + Server Action, contact page, static policy pages.
