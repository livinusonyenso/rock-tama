# Homepage Checklist

_Audited from the repository on 2026-11-15 (not from memory). Update this file as each section ships._

Order and reference: `docs/UI_BREAKDOWN.md` §01–09, `docs/reference/homepage-reference.png`.

## Status by section

| # | Section | Status | Visual | Functional | Open items |
|---|---|---|---|---|---|
| 1 | Announcement bar | **Done + verified** (M2.2, refined M2.7) | **Approved baselines** (D-080) | Informational only, no actions | Service wording pending verification (D-030); V-006/V-007 minor |
| 2 | Header (desktop + mobile drawer) | **Done + verified** (M2.4–M2.7) | **Approved baselines** for header (7 widths) and drawer (D-080) | Links via `resolveHref`; **Shop dropdown + mobile Shop list live (F2)**; Wholesale and Our Story origin anchor live; Quality/Contact/Search/Account/Cart pending | 320px drawer comparison pending for live Our Story (V-014); global 200% text overflow (V-013); logo SVGs pending |
| 3 | Hero | **Done + verified** (M3.1–M3.3, carousel F2) — **M3 complete** | Measured within ±3px @1440; animation verified | **Shop Now → /shop and Request Wholesale → /wholesale both work**; **Hero Product Carousel live (D-085)** with links to product pages | Hero claims registered (D-078); product photography pending |
| 4 | Purity / trust indicators | **Done + verified** (2026-11-15, D-079) | Measured vs reference @1440 (height ±2, labels ±6, centres −7…+5); no baselines yet | Informational only | Six claims registered and **blocking production deploys until evidenced** (D-078); V-010 pathogen icon |
| 5 | Our Products | **Done + verified** (2026-11-16, D-087/D-088) | Compared @1440 (`docs/verification/home-5-products/`); **provisional only; actual comparison review pending (D-090)** | 3 product cards → `/shop/<slug>`, Distributor Supply → `/wholesale`; keyboard, no-JS, reduced motion and reveal journeys pass | Product photos; prices intentionally absent; section 48px taller than reference (V-011) |
| 6 | Our Origin | **Implemented; Chrome checked using styled Webpack diagnostic** | 105/105 seven-width capture checks; **comparison awaiting owner approval** | Our Story → `/#origin`; desktop keyboard/mobile journeys tested (recovery report) | Default Turbopack normal-terminal check; V-012 differences; V-013 global header text stress; official photo; two unverified claims |
| 7 | Quality & Safety | **Briefing prepared only; NOT implemented/approved** | `QUALITY_SECTION_BRIEFING.md` | Planned informational section | Lab report, ISO 22000 certificate (badge hidden until verified, D-013), "Undistilled" spelling |
| 8 | Business supply banner | **Not implemented** | — | **Request Wholesale → /wholesale (already works)** | Export claim pending (D-030) |
| 9 | Footer | **Not implemented** | — | Many targets pending (Contact F5, policies F10, newsletter F6 needs a provider; social URLs) | Newsletter must not be enabled without real submission; copyright year with Cache Components |

## Dependency-aware build order

1. ~~§4 Purity / trust indicators~~ **done**.
2. ~~F2 shop foundation~~ **done** (`/shop`, product pages, Shop menu + mobile list, carousel; Shop Now works).
3. ~~§5 Our Products~~ **functionally accepted** (visual review pending).
4. **§6 Our Origin** → **§7 Quality & Safety** → **§8 Supply banner** → **§9 Footer**.
5. Then the homepage verification pass (M8): full responsive, accessibility, performance, SEO.

## Missing images or business information (consolidated)

Logo SVGs (header + footer light) · hero/product photography (750 ml, 1.5 L, carton) · origin landscape photo · lab reports (TDS, heavy metals, pathogens) · ISO 22000 certificate · NAFDAC A1-2462L documents · evidence for process claims (rock filtration, bottled at source, naturally protected source) · prices, pack sizes, delivery rules, payment provider · enquiry recipient + sending domain · contact details · social URLs · newsletter provider · privacy notice and other policy pages.
