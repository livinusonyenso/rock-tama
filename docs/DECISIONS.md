# Decisions Log

Status values: **CONFIRMED** (fact/owner-stated) · **PROPOSED** (awaiting approval) · **APPROVED** (owner approved; date given) · **REJECTED** · **SUPERSEDED** (link the replacement).

Never change a decision's status without the owner's explicit say-so. Add a dated note when anything changes.

| ID | Decision | Status | Rationale / notes |
|---|---|---|---|
| D-001 | Keep the existing Next.js 16.4.6 / React 19.3 / TS 5.9 / Tailwind 4.3 project and **npm**; do not reinitialise | CONFIRMED 2026-11-14 | Project already scaffolded and running |
| D-002 | `docs/reference/homepage-reference.png` is the primary design spec; no redesign without approval | CONFIRMED 2026-11-14 | |
| D-003 | Server Components by default; client islands only for `NavLink`, `ShopMenu`, `MobileNav`, `NewsletterForm` | PROPOSED | Less JS; simpler data flow |
| D-004 | Root-level `components/{layout,home,ui,brand,icons}`, `content/`, `types/`, no `src/` | PROPOSED | Matches alias `@/* → ./*` |
| D-005 | Static content as typed TS modules in `content/` | PROPOSED | Type-safe, swappable for CMS/DB later |
| D-006 | Design tokens in Tailwind v4 `@theme` (`app/globals.css`), values per `DESIGN_SYSTEM.md` | **APPROVED 2026-11-14** (implemented M1) | Single source of truth |
| D-007 | Fonts: Cormorant Garamond (editorial/headings) + Source Sans 3 (interface/body) via `next/font`, exposed as CSS variables | **APPROVED 2026-11-14** (implemented M1) | |
| D-008 | Icons: `lucide-react` for standard UI icons; custom SVG only for distinctive brand/decorative icons when no suitable Lucide icon exists | **APPROVED 2026-11-14** | Install in M2 when first used |
| D-009 | All images via `MediaFrame` (fixed aspect-ratio box; placeholder ↔ `next/image`) | PROPOSED | Prevents layout collapse/CLS |
| D-010 | Light-only site: remove starter dark-mode tokens | **APPROVED 2026-11-14** (implemented M1) | Implemented with `color-scheme: light` + `dark:` re-bound to a never-set `.dark` class (D-018) |
| D-011 | Backend (when approved): Server Actions + Route Handlers in the same Next.js app; logic in `lib/server/` | PROPOSED, deferred | See `ECOMMERCE_REQUIREMENTS.md` |
| D-012 | No state-management library; React state/context only if needed by the cart | PROPOSED | |
| D-013 | Quality, lab and certification claims render only when the owner confirms evidence (content flag); layout space can be reserved | **APPROVED 2026-11-14** (owner: "do not publish unsupported technical or scientific claims") | |
| D-014 | Header not sticky in v1 | PROPOSED | Not shown in reference |
| D-015 | **Route plan:** `/shop`, `/wholesale`, `/our-story`, `/quality`, `/contact`. No broken links in production: until a page exists, a link points to an existing destination (e.g. a homepage section anchor such as `/#products`) or is visibly marked as pending. No throwaway placeholder pages. | **APPROVED 2026-11-14** (revised by owner) | Destination per link to be listed in M2 briefing |
| D-016 | Use git; baseline committed before app code changes; meaningful commit messages throughout | **APPROVED 2026-11-14** | Owner had already initialised the repo with remote `origin` (github.com/livinusonyenso/rock-tama). Baseline commits `7e3b5be` (scaffold) and `7b7f69e` (docs). Pushing is done only on request. |
| D-017 | Official brand name is **ROCK-TAMA** (title, metadata, brand references, docs). The hero headline may show **ROCK TAMA** (no hyphen) as a visual treatment | **APPROVED 2026-11-14** | |
| D-018 | `dark:` variant bound to `.dark` class (`@custom-variant`), never set | APPROVED 2026-11-14 as part of D-010 implementation | Prevents OS dark mode from triggering any `dark:` utility |
| D-019 | Gold text on light surfaces uses `gold-700` `#885D1B` (darkened from `#9A6A1F`); placeholder ink `#5C5C57` (from `#64645F`) | APPROVED 2026-11-14 within the M1 token review (owner asked for tokens "reviewed for consistency") | WCAG AA 4.5:1. Same hue, visually near-identical. Owner may overrule. |
| D-020 | Logo: use placeholders with the reference's dimensions/proportions at descriptive paths until the official SVGs are supplied; never redraw the logo | **APPROVED 2026-11-14** | Paths in `ASSET_SPECIFICATIONS.md` |
| D-021 | Africa map: licensed vector outline, preferably **Natural Earth** (public domain); source and licence recorded in `ASSET_SPECIFICATIONS.md` | **APPROVED 2026-11-14** | |
| D-022 | NAFDAC registration **A1-2462L** to be displayed **only after verification** against registration documents | **APPROVED 2026-11-14** (pending verification) | |
| D-023 | Social links: layout ready, no invented or placeholder URLs; links render only when real URLs are supplied | **APPROVED 2026-11-14** | |
| D-024 | Product direction: a **real e-commerce site** with two purchasing experiences (retail checkout; wholesale enquiry). Backend is **not** implemented until the homepage, architecture and requirements are approved. Payment provider, pricing, delivery rules and payment flow need later approval. | **APPROVED 2026-11-14** (direction only) | Details in `ECOMMERCE_REQUIREMENTS.md` |
| D-025 | Shared primitives (`Container`, `ButtonLink`, `MediaFrame`) are built in the milestone that first uses them (M2/M3), not up front | PROPOSED | Avoids components without a consumer; replaces plan tasks 1.4–1.5 |
