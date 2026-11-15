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
- Never invent product photos, prices, certifications or business facts. Every product/process/quality claim shown must be registered in `content/claims.ts` (production deploys are blocked while any is unverified, D-078).
- No new dependencies without explaining the purpose and getting approval.
- Never claim a check passed unless it was run. Report failures with output.
- Verify **visually and functionally**: a feature isn't done until its actions/forms/data paths are tested end to end.
- Label statements: [CONFIRMED] / [OBSERVED] / [PROPOSED] / [ASSUMPTION] / [APPROVED] / [VERIFIED]. Never mark a proposal approved without the owner's explicit approval.

## Approved decisions

`docs/DECISIONS.md` is authoritative; check status there before relying on any decision. Key approvals: brand name **ROCK-TAMA** · tokens in `app/globals.css` (`@theme`) · fonts Cormorant Garamond + Source Sans 3 (`font-serif` / `font-sans`) · light-only · `lucide-react` for UI icons · route plan with no broken links and no placeholder pages · no unverified claims (lab, ISO, NAFDAC) · no invented URLs · logo placeholders, never redrawn · real e-commerce planned, backend deferred.

## Current phase

M1 approved → **M2 Header** in progress, one task at a time. M2.1 (typed content, `resolveHref`) M2.2 (AnnouncementBar, `Container`, `Icon`), M2.3 (`Logo`), M2.V (`npm run verify:visual`) M2.4 (desktop `SiteHeader` + `NavLink`) M2.5–M2.7 done (baselines approved, D-080). M3 complete (hero, animation, product carousel). F0–F2 done: `/wholesale` enquiry flow, `/shop` + product pages, Shop menu, Shop Now live. Homepage §4–§5 done (§5 baseline awaiting owner review); **§6 browser checked using diagnostic Webpack (D-094), visual approval/default Turbopack normal-terminal check pending; §7 briefing only** (status: `docs/HOMEPAGE_CHECKLIST.md`). Below-the-fold reveals use the shared `Reveal` (D-088); cards use `OfferCard`/`ProductCard` (D-087). Only `listedProducts` may be shown or offered (D-081). Reference comparisons are at 1440 against the reference scaled ×1.326 (D-058). Links only via `resolveHref()`; navigation renders valid destinations only (D-026/D-027).

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
