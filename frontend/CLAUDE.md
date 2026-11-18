# ROCK-TAMA Natural Spring Water — Project Instructions

Premium natural spring water e-commerce + wholesale website for ROCK-TAMA (Nanka, Anambra State, Nigeria). **Principle: Design Accuracy + Real Functionality + Clean Architecture + Performance + Maintainability** (D-066): a production e-commerce site; commercial CTAs must work; no fake pages, fake success, invented prices or unverified payments; missing business data is configurable and documented (`docs/ECOMMERCE_REQUIREMENTS.md`). The owner is an experienced JS/TS developer building this **with** Claude as an engineering partner and mentor, not as an autonomous generator.

## Start of every session

1. Read the current state, auto-imported below, then `docs/PROGRESS.md` and `docs/DECISIONS.md`.
2. Read the docs relevant to the task (index below) **before** proposing or changing code.
3. Inspect any file before editing it.

@docs/SESSION_HANDOFF.md

## Stack (installed, confirmed)

Next.js 16.4.6 App Router (Turbopack, `cacheComponents: true`) · React 19.3 · TypeScript 5.9 strict · Tailwind CSS 4.3 (CSS-first `@theme`, via the `@tailwindcss/turbopack` loader) · ESLint 9 · **npm**. Path alias `@/*` → project root. For Next 16 APIs, prefer the bundled docs in `node_modules/next/dist/docs/` over memory.

## Design reference

`docs/reference/homepage-reference.png` is the primary design spec. Reproduce it; never redesign without approval.

## Non-negotiables

- **Approval gate:** explain the plan (briefing format in `docs/DEVELOPMENT_GUIDELINES.md`), get explicit approval, implement **only** that scope, verify, record, then STOP.
- One logical task at a time. Use `/rock-tama-section-workflow` for sections.
- Server Components by default; client islands only when state or browser APIs require them.
- Design values come from tokens, not repeated literals.
- Motion: every visible section's briefing includes an animation storyboard per `docs/ANIMATION_SYSTEM.md` (opacity/transform only, reduced motion, no layout shift, no new animation library without approval).
- Never invent product photos, prices, certifications or business facts. Every product/process/quality claim shown must be registered in `content/claims.ts` (strict DEPLOY_MODE=production rejects unverified claims; automatic incomplete deployments remain noindex staging, D-100).
- No new dependencies without explaining the purpose and getting approval.
- Never claim a check passed unless it was run. Report failures with output.
- Verify **visually and functionally**: a feature isn't done until its actions/forms/data paths are tested end to end.
- Label statements: [CONFIRMED] / [OBSERVED] / [PROPOSED] / [ASSUMPTION] / [APPROVED] / [VERIFIED]. Never mark a proposal approved without the owner's explicit approval.

## Approved decisions

`docs/DECISIONS.md` is authoritative; check status there before relying on any decision. Key approvals: brand name **ROCK-TAMA** · tokens in `app/globals.css` (`@theme`) · fonts Cormorant Garamond + Source Sans 3 (`font-serif` / `font-sans`) · light-only · `lucide-react` for UI icons · route plan with no broken links and no placeholder pages · no unverified claims (lab, ISO, NAFDAC) · no invented URLs · logo placeholders, never redrawn · real e-commerce planned, backend deferred.

## Current phase

M1 foundation, M2 header and M3 hero/carousel are implemented; F0–F2 shop/product/enquiry journeys are live. **All nine homepage sections are built** (D-095/D-096), including Quality, supply banner and shared footer. Current evidence: `docs/verification/home-7-9-completion/REPORT.md`; status: `docs/HOMEPAGE_CHECKLIST.md`. Use the styled diagnostic Webpack path documented in the recovery report while Turbopack's worker port remains restricted; do not claim a default build pass. No visual baseline approval implied. Supplied product/service/Origin artwork is integrated via `content/media.ts` (D-098); originals and inactive assets are organized under docs/assets. Claims, final client-approved logos, actual site photography, policy/contact/social details and newsletter provider remain client inputs. Below-the-fold motion uses Reveal (D-088/D-094); cards use OfferCard/ProductCard (D-087); only listedProducts may be offered (D-081). Reference comparisons at 1440 use ×1.326 scaling (D-058). Resolve internal destinations through resolveHref; unavailable pages remain non-links.

## Git

Branch `main`, remote `origin`. After each **verified** task, commit with a meaningful conventional message (`feat:`, `fix:`, `docs:`, `chore:`), code and doc updates together. Never commit `.env*`, credentials or build output. **Never push unless the owner asks.**

## Keeping records (after every task)

Update `docs/PROGRESS.md` (state, completed + how verified, blockers, next task), `docs/SESSION_HANDOFF.md` (short current-state summary), and `docs/DECISIONS.md` when a decision is made or changed.

## Docs index

| Need | File |
|---|---|
| Goals, customers, claims needing evidence | `docs/PROJECT_OVERVIEW.md` |
| Section-by-section breakdown of the reference | `docs/UI_BREAKDOWN.md` |
| Component inventory, Server/Client boundaries | `docs/COMPONENT_ARCHITECTURE.md` |
| Colours, type, spacing, layout tokens | `docs/DESIGN_SYSTEM.md` |
| Animation and microinteractions | `docs/ANIMATION_SYSTEM.md` |
| Image slots, aspect ratios, paths | `docs/ASSET_SPECIFICATIONS.md` |
| Versions, config, dependencies | `docs/TECH_STACK.md` |
| Folder layout and conventions | `docs/PROJECT_STRUCTURE.md` |
| Scope B (cart, checkout, backend) | `docs/ECOMMERCE_REQUIREMENTS.md` |
| Workflow, briefing format, Definition of Done, gotchas | `docs/DEVELOPMENT_GUIDELINES.md` |
| Milestones and acceptance criteria | `docs/IMPLEMENTATION_PLAN.md` |
| Homepage status per section | `docs/HOMEPAGE_CHECKLIST.md` |

## Visual verification

Run `npm run verify:visual` after every UI task (add the section to `scripts/visual-check.config.mjs` first). It checks overflow, loading, console errors, baseline regressions and scripted interactive states (`actions`/`expect`), and builds a reference comparison sheet that **a person must review**; passing is not proof of pixel accuracy. Output goes to git-ignored `.verification/`; approved baselines go to `docs/verification/baselines/` via `--approve`, only after owner acceptance; provisional (NOT approved) references go to `docs/verification/provisional/` via `--provisional`. Details: `docs/DEVELOPMENT_GUIDELINES.md`.

## Commands

`npm run dev` · `npm run lint` · `npx tsc --noEmit` · `npm run build` · `npm run verify:visual` · `npm run verify:functional`

**Env:** see `.env.example` (enquiry delivery). Never commit `.env*` files or `.data/`.

**D-101:** proposed horizontal/stacked logos and static decorative hero background integrated. See docs/assets/branding-manifest.json and hero-brand-integration report. Shared Logo + site.logos reused; ivory footer backing until genuine light variant supplied; no filters, no new animation or client component. Carousel and all CTAs preserved. Client approval pending, no push/deploy.

**D-102 hero:** reusable five-slide HeroCarousel supersedes old three-product selector, with typed hero-slides data and Server HeroSection image/copy/icon slots. One static waterfall; five transparent bottles; missing memorial/coronation generated only after explicit owner permission and remain concepts pending approval. Real custom-labels enquiry route reuses existing delivery; no unconfirmed catalogue products or editor/checkout. Guide: docs/HERO_CAROUSEL_GUIDE.md; evidence: docs/verification/hero-five-slides/REVIEW.md. No push/deploy or visual baseline promotion.

**D-107 range galleries:** homepage-only MediaCarousel islands via shared OfferCard/ProductCard optional mediaVariants/mediaNotice. Final counts2/2/8/4images;750ml new artwork explicitly owner-approved as proposed packaging with fixed note. Static card defaults elsewhere. Ten new packaging sources/derivatives plus source-version archive;15unverified claims now include two printed pack configurations, with data-claims metadata. Evidence: docs/verification/range-image-variants/REVIEW.md. No baseline promotion, push or deployment.

**D-109 wholesale hero:** exact supplied warehouse background configured in content/wholesale.ts; styling isolated in wholesale-hero.module.css. Source archive/optimized WebP/manifest/preparation script recorded;83browser checks pass. See docs/verification/wholesale-warehouse-background/REVIEW.md. No push/deploy or baseline promotion.
