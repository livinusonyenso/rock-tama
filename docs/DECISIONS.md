# Decisions Log

Status values: **CONFIRMED** (fact/owner-stated) · **PROPOSED** (awaiting approval) · **APPROVED** (owner approved; add date) · **REJECTED** · **SUPERSEDED** (link the replacement).

Never change a decision's status without the owner's explicit say-so. Add a dated note when anything changes.

| ID | Decision | Status | Rationale |
|---|---|---|---|
| D-001 | Keep the existing Next.js 16.4.6 / React 19.3 / TS 5.9 / Tailwind 4.3 project and **npm**; do not reinitialise | CONFIRMED (owner, 2026-11-14) | Project already scaffolded and running |
| D-002 | `docs/reference/homepage-reference.png` is the primary design spec; no redesign without approval | CONFIRMED (owner, 2026-11-14) | |
| D-003 | Server Components by default; client islands only for `NavLink`, `ShopMenu`, `MobileNav`, `NewsletterForm` | PROPOSED | Less JS, faster pages, simpler data flow |
| D-004 | Root-level `components/{layout,home,ui,brand,icons}`, `content/`, `types/`, no `src/` | PROPOSED | Matches existing alias `@/* → ./*`; clear module boundaries |
| D-005 | Static content as typed TS modules in `content/` | PROPOSED | Type-safe, zero runtime cost, swappable for a CMS/DB later |
| D-006 | Design tokens in Tailwind v4 `@theme` (`app/globals.css`), values per `DESIGN_SYSTEM.md` | PROPOSED | Single source of truth for colours/fonts/radii |
| D-007 | Fonts: Cormorant Garamond (serif) + Source Sans 3 (sans) via `next/font/google`; final pick after a side-by-side render | PROPOSED | Closest visual match to the reference; self-hosted |
| D-008 | Icons: custom inline SVG set for brand icons; generic UI icons either also custom **or** `lucide-react` | PROPOSED, **choice needed** | Many icons are domain-specific anyway |
| D-009 | All images via `MediaFrame` (fixed aspect-ratio box; placeholder ↔ `next/image`) | PROPOSED | Prevents layout collapse and CLS while assets are missing |
| D-010 | Remove the starter dark-mode tokens; the site is light-only (with dark sections) per the reference | PROPOSED | Reference has no dark-mode design |
| D-011 | Backend (when approved): Server Actions + Route Handlers in the same Next.js app; logic in `lib/server/` | PROPOSED, deferred | Simplest suitable architecture; see `ECOMMERCE_REQUIREMENTS.md` |
| D-012 | No state-management library; React state/context only if the cart is approved | PROPOSED | No current need |
| D-013 | Quality/certification claims render only when the owner confirms evidence (content flag) | PROPOSED | Legal/consumer-protection risk of unsupported claims |
| D-014 | Header not sticky in v1 | PROPOSED | Not shown in reference |
| D-015 | Nav/CTA links use real target routes (`/shop`, `/wholesale`, …) even before those pages exist; a simple "coming soon" page is added later or they 404 temporarily | PROPOSED, **choice needed** | Avoids `#` links that must be hunted down later |
| D-016 | Initialise git and commit the baseline before implementation | PROPOSED | Traceable, reversible changes |
