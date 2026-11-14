# Progress

_Last updated: 2026-11-14_

## Current state

- **Phase:** Implementation (homepage, Scope A)
- **Milestone:** M1 Foundation **complete and approved by owner** (2026-11-14). M2 Header approved to start, task by task.
- **Current task:** M2.1, typed site and navigation content. **Briefing presented; awaiting approval to implement.**

## Completed

| Date | Task | Verification |
|---|---|---|
| 2026-11-14 | Project audit (versions, config, files) | Inspected; lint + tsc pass on the starter |
| 2026-11-14 | Reference saved to `docs/reference/homepage-reference.png`; colours sampled | Values in `DESIGN_SYSTEM.md` |
| 2026-11-14 | Documentation set, `CLAUDE.md`, `.claude/rules/*`, `rock-tama-section-workflow` skill | Files exist |
| 2026-11-14 | Owner decisions recorded (D-006–D-008, D-010, D-013, D-015–D-024) | `DECISIONS.md` |
| 2026-11-14 | **M1.1** Git baseline: reviewed `.gitignore` (already excludes `.env*`, `node_modules`, `.next`, `*.pem`, build output; added `.claude/settings.local.json`); no secret-like files found. Commits `7e3b5be` (scaffold) + `7b7f69e` (docs) on the owner's `50dbb73` | `git status` clean after commits; nothing pushed |
| 2026-11-14 | **M1.2** Design tokens in `app/globals.css` (`@theme`: colours, type scale, tracking, spacing, containers, radii, shadows; `bg-gold-gradient` utility; base body styles) | `npm run lint` ✓ · `npx tsc --noEmit` ✓ · `npm run build` ✓ · every token compiled with Tailwind's compiler and emits its utility (22 sample classes checked) · WCAG contrast computed for all text pairs (table in `DESIGN_SYSTEM.md`) |
| 2026-11-14 | **M1.3** Fonts: Cormorant Garamond + Source Sans 3 via `next/font/google` (`--font-cormorant`, `--font-source-sans` → `font-serif`, `font-sans`); metadata title "ROCK-TAMA Natural Spring Water" | Build ✓; fonts self-hosted (17 `woff2` files in `.next/static/media`, both families in built CSS) |
| 2026-11-14 | **M1.4** Starter dark mode removed: `prefers-color-scheme` block deleted, `color-scheme: light`, `dark:` re-bound to the `.dark` class | Compiled output shows `dark:` utilities scoped to `.dark` only |

**Not verified:** visual check in a browser. The page still shows the create-next-app starter content (now in Source Sans 3 on ivory), so there is nothing design-specific to compare yet. The first visual comparison happens in M2.

## Pending

- M2 – M8 (see `IMPLEMENTATION_PLAN.md`)
- PROPOSED decisions awaiting approval: D-009, D-011, D-012, D-014 (D-003, D-004, D-005, D-019, D-025 approved 2026-11-14; D-026 added)
- Scope B requirements session (after homepage)

## Blockers / inputs from the owner (non-blocking for M2 unless noted)

1. Official logo SVGs (placeholders used meanwhile, D-020)
2. Lab reports, ISO 22000 certificate, NAFDAC A1-2462L documents
3. Social URLs
4. Copy fixes awaiting confirmation: "Nigeria. Naturally…", "Undistilled", card 4 italic title, copyright year
5. **Open M2.1 questions** (see the briefing): pending-link rendering, Shop dropdown items, empty-cart badge, confirmation of announcement-bar service claims, product URL slugs

## Next proposed task

**M2 Header, starting with task 2.1:** `content/site.ts` and `content/navigation.ts` (+ types), including a destination table for every nav link per D-015. Then 2.2: install `lucide-react` and build `Container`. Requires the M2 briefing and approval first.
