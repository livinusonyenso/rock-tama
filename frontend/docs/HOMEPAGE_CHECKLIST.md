# Homepage Checklist

_Audited from the repository on 2026-11-15 (not from memory). Update this file as each section ships._

Order and reference: `docs/UI_BREAKDOWN.md` §01–09, `docs/reference/homepage-reference.png`.

## Status by section

| # | Section | Status | Visual | Functional | Open items |
|---|---|---|---|---|---|
| 1 | Announcement bar | **Done + verified** (M2.2, refined M2.7) | **Approved baselines** (D-080) | Informational only, no actions | Service wording pending verification (D-030); V-006/V-007 minor |
| 2 | Header (desktop + mobile drawer) | **Done + verified** (M2.4–M2.7) | **Approved baselines** for header (7 widths) and drawer (D-080) | Links via `resolveHref`; **Shop dropdown + mobile Shop list live (F2)**; Wholesale and Our Story origin anchor live; Quality anchor live; Contact/Search/Account/Cart pending | 320px drawer comparison pending for live Our Story (V-014); global 200% text overflow (V-013); logo SVGs pending |
| 3 | Hero | **Done + verified** (M3.1–M3.3, carousel F2) — **M3 complete** | Measured within ±3px @1440; animation verified | **Shop Now → /shop and Request Wholesale → /wholesale both work**; **Hero Product Carousel live (D-085)** with links to product pages | Hero claims registered (D-078); supplied product artwork integrated (D-098) |
| 4 | Purity / trust indicators | **Done + verified** (2026-11-15, D-079) | Measured vs reference @1440 (height ±2, labels ±6, centres −7…+5); no baselines yet | Informational only | Six claims registered and **blocking production deploys until evidenced** (D-078); V-010 pathogen icon |
| 5 | Our Products | **Done + verified** (2026-11-16, D-087/D-088) | Compared @1440 (`docs/verification/home-5-products/`); **provisional only; actual comparison review pending (D-090)** | 3 product cards → `/shop/<slug>`, Distributor Supply → `/wholesale`; keyboard, no-JS, reduced motion and reveal journeys pass | Supplied images integrated; prices absent; wide desktop +48px residual (V-011); two columns below 1400px prevents CTA overflow (D-099) |
| 6 | Our Origin | **Implemented; Chrome checked using styled Webpack diagnostic** | 105/105 seven-width capture checks; **comparison awaiting owner approval** | Our Story → `/#origin`; desktop keyboard/mobile journeys tested (recovery report) | Supplied Origin illustration integrated; actual site photo pending; default Turbopack check; V-012/V-013 differences and unverified claims |
| 7 | Quality & Safety | **Built under D-095, restyled to owner design D-108** | Matches the owner's revised design @1440; no automatic approval | Informational; Quality navigation → `/#quality` | Claims unverified; ISO hidden |
| 8 | Business supply banner | **Built under D-095; on the shared water band (D-108)** | Responsive captures; pending owner review | **Request Wholesale → working /wholesale enquiry** | Events & Institutions replaces unsupported export promise |
| 9 | Footer | **Built under D-095; shared across routes** | Responsive captures; pending owner review | Live catalogue/Origin/Quality/Wholesale links; pending pages are text | Newsletter disabled, provider/policies pending; **social icons live with `#` placeholders (D-111)**; official footer logo pending |

| + | Testimonials (not in the reference; owner request) | **Built D-111; slider D-112 (6 samples)** after §6 | Captured at 7 widths; pending owner review | Informational | **Sample quotes, visibly labelled; launch-blocked until real customer quotes** |

| + | Contact Us (homepage, owner request) | **Built D-117**, last before the footer | Captured at 7 widths; pending owner review | Same cards as `/contact`; actions inactive until real details | **Placeholder WhatsApp/email** |

## Dependency-aware build order

1. ~~§4 Purity / trust indicators~~ **done**.
2. ~~F2 shop foundation~~ **done** (`/shop`, product pages, Shop menu + mobile list, carousel; Shop Now works).
3. ~~§5 Our Products~~ **functionally accepted** (visual review pending).
4. §6–§9 **built**; all nine homepage sections now present.
5. Then the homepage verification pass (M8): full responsive, accessibility, performance, SEO.

## Missing images or business information (consolidated)

Logo SVGs (header + footer light) · hero/product photography (750 ml, 1.5 L, carton) · origin landscape photo · lab reports (TDS, heavy metals, pathogens) · ISO 22000 certificate · NAFDAC A1-2462L documents · evidence for process claims (rock filtration, bottled at source, naturally protected source) · prices, pack sizes, delivery rules, payment provider · enquiry recipient + sending domain · contact details · social URLs · newsletter provider · privacy notice and other policy pages.

- [x] D-101 supplied proposed horizontal header logo, stacked footer logo with ivory contrast backing, static decorative hero background; preserve carousel/content/CTAs and responsive ratios.
- [ ] Owner/client approval of D-101 branding and comparison screenshots; light-colour footer logo for direct green placement still needed. Verification details: hero-brand-integration report. No baseline promotion.

- [x] D-102 five-slide copy/bottle hero: static waterfall,600ms transitions,6s timer,arrows/dots/pause,focus/hover/hidden-tab pause,real touch swipe,reduced motion/no-JS,stable stage/copy grid.
- [x] Live custom-labels enquiry route reuses validated delivery; proposed concepts do not create unconfirmed catalogue products.
- [ ] Client approval of generated memorial/coronation concepts and new five-slide screenshots. Existing §5/§6 baselines remain provisional.

- [x] D-107 four range image galleries,16images, stationary text/actions, responsive fixed media boxes, keyboard/swipe/reduced motion/no-JS, offscreen pause.750ml alternative explicitly marked as proposed packaging.
- [ ] Owner/client visual approval of D-107 snapshots and printed packaging quantities/claims; source artwork is not evidence.
