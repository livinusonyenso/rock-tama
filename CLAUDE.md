# ROCK-TAMA Natural Spring Water — Project Instructions

Premium natural spring water e-commerce + wholesale website for ROCK-TAMA (Nanka, Anambra State, Nigeria). The owner is an experienced JS/TS developer building this **with** Claude as an engineering partner and mentor, not as an autonomous generator.

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
- Never invent product photos, prices, certifications or business facts. Quality/ISO claims need owner-confirmed evidence.
- No new dependencies without explaining the purpose and getting approval.
- Never claim a check passed unless it was run. Report failures with output.
- Label statements: [CONFIRMED] / [OBSERVED] / [PROPOSED] / [ASSUMPTION] / [APPROVED] / [VERIFIED]. Never mark a proposal approved without the owner's explicit approval.

## Approved decisions

`docs/DECISIONS.md` is authoritative; check status there before relying on any decision. Key approvals: brand name **ROCK-TAMA** · tokens in `app/globals.css` (`@theme`) · fonts Cormorant Garamond + Source Sans 3 (`font-serif` / `font-sans`) · light-only · `lucide-react` for UI icons · route plan with no broken links and no placeholder pages · no unverified claims (lab, ISO, NAFDAC) · no invented URLs · logo placeholders, never redrawn · real e-commerce planned, backend deferred.

## Current phase

M1 approved → **M2 Header** in progress, one task at a time. M2.1 (typed content, `resolveHref`) M2.2 (AnnouncementBar, `Container`, `Icon`) and M2.3 (`Logo`) done; next M2.V (verification script), then M2.4 (desktop header). Links only via `resolveHref()`; navigation renders valid destinations only (D-026/D-027).

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
| Image slots, aspect ratios, paths | `docs/ASSET_SPECIFICATIONS.md` |
| Versions, config, dependencies | `docs/TECH_STACK.md` |
| Folder layout and conventions | `docs/PROJECT_STRUCTURE.md` |
| Scope B (cart, checkout, backend) | `docs/ECOMMERCE_REQUIREMENTS.md` |
| Workflow, briefing format, Definition of Done, gotchas | `docs/DEVELOPMENT_GUIDELINES.md` |
| Milestones and acceptance criteria | `docs/IMPLEMENTATION_PLAN.md` |

## Visual verification

Headless Chrome (installed) + DevTools Protocol against `next start -p 3100`; method in `docs/DEVELOPMENT_GUIDELINES.md`. Evidence images go in `docs/verification/`.

## Commands

`npm run dev` · `npm run lint` · `npx tsc --noEmit` · `npm run build`
