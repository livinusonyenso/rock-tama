# Development Guidelines

The terse, enforceable versions of these rules live in `.claude/rules/`. This file explains them for humans.

## Workflow

**Analyse → Document → Explain → Approve → Implement → Verify → Record → Next task.**

One logical task at a time. No task starts without explicit owner approval. Each task ends with a stop for review. The detailed procedure is the `/rock-tama-section-workflow` skill.

## Task briefing format (required before every approved task)

1. **What are we building?** Component/feature and its scope boundary.
2. **Why this way?** Engineering reasoning and the alternatives rejected.
3. **Where will it live?** Exact file paths, new vs. modified.
4. **Concepts to understand.** React/Next.js/TS/CSS concepts at a professional level (no React-101).
5. **What could go wrong?** Likely mistakes and pitfalls.
6. **How will we verify it?** The exact commands and checks.
7. **Next step.** The next dependency, named but **not** started.

## Strict rules

1. Never generate the whole site in one operation.
2. No UI implementation without approval.
3. No redesign of the reference without permission.
4. No new dependency without explaining its purpose (and getting approval).
5. No state-management library unless a demonstrated need exists.
6. No Client Component where a Server Component suffices.
7. No component for trivial markup without justification.
8. No hard-coded design values repeated across files; use tokens.
9. No invented photos, prices, certifications or business information.
10. No silent changes to approved decisions; record changes in `DECISIONS.md`.
11. No replacing working code without inspecting it.
12. No moving to the next section before approval.
13. No claiming checks passed unless they were actually run and passed.
14. Docs must stay consistent with code.
15. Explain structure before writing large files.

## Definition of Done (per task)

- [ ] Scope matches the approved briefing, nothing more.
- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes (from M3 onward, or whenever routes/config change).
- [ ] `npm run verify:visual` passes, and the reference comparison sheet has been reviewed by a person (desktop), with tablet/mobile checked against the documented behaviour. Baselines updated with `--approve` only after owner acceptance.
- [ ] Keyboard and accessibility basics: focus visible, logical tab order, landmarks/headings, alt text or `aria-hidden`.
- [ ] `PROGRESS.md`, `SESSION_HANDOFF.md`, and (if relevant) `DECISIONS.md` updated.
- [ ] Results reported honestly, including anything not verified.
- [ ] Committed (code + docs) with a meaningful conventional message; not pushed unless requested.

## Visual verification (`npm run verify:visual`, M2.V)

**When to run it:** after implementing any UI task (before reporting it), after changing tokens/shared components (regression check on everything), and before committing UI changes.

**What it does** (`scripts/visual-check.mjs`, configured in `scripts/visual-check.config.mjs`), with no dependencies beyond Node and the installed Chrome:
1. `next build`, then `next start -p 3100`, which avoids the dev server on 3000 (skip the build with `--no-build`, or use a running server with `--url`).
2. Headless Chrome over the DevTools Protocol, at each configured viewport (mobile 375, tablet 768, laptop 1024, desktop 1440).
3. Waits for load, fonts and images, then checks: fonts loaded · no broken images · **no horizontal overflow** (names offending elements) · **no console errors** (console errors, uncaught exceptions, failed network requests) · each configured section present and visible.
4. Screenshots: viewport + full page per page, plus one per section.
5. At viewports with `compareWithReference` (desktop): a **reference comparison sheet** stacking the reference crop (scaled from the 1086px mock), the implementation, and a difference overlay.
6. **Regression:** pixel diff against the approved baseline, or, if none exists, the provisional reference (fails above 0.5% differing pixels), plus a red-highlighted diff image.
7. Writes `report.md` + `report.json`. Exit 0 = pass, 1 = a check failed, 2 = incomplete/setup error.

**Commands:**
```bash
npm run verify:visual                                   # everything
npm run verify:visual -- --section announcement         # one section (repeatable / comma list)
npm run verify:visual -- --viewport desktop,mobile
npm run verify:visual -- --no-build                     # reuse the last build
npm run verify:visual -- --approve                      # ONLY after owner acceptance: update APPROVED baselines
npm run verify:visual -- --provisional                  # store PROVISIONAL references (regression only, not approved; D-049)
npm run verify:visual -- --save m2.4                    # copy report + comparison images to docs/verification/m2.4/
```

**Three kinds of images; keep them separate:**

| Kind | Location | Git | Who writes it |
|---|---|---|---|
| Reference (the design) | `docs/reference/homepage-reference.png` | committed | owner only |
| Generated output | `.verification/<UTC timestamp>/` | **ignored** | every run |
| Approved baselines | `docs/verification/baselines/<section>-<viewport>.png` | committed | `--approve`, only after owner-accepted visual review |
| Provisional references | `docs/verification/provisional/<section>-<viewport>.png` | committed | `--provisional`, for regression protection while a section still has open visual differences; reported as "NOT approved". Ignored when an approved baseline exists |

**Interactive states (M2.6, D-057):** a section may add `viewports` (names to limit it to), `actions` run after load (`{ click: selector }`, `{ clickAt: { x, y } }`, `{ press: "Escape"|"Tab"|"Enter"|" ", times? }`, `{ wait: ms }`, dispatched as real mouse/keyboard input), `expect` (named JS expressions that must be truthy, e.g. focus location, `aria-expanded`, scroll lock) and `media` (e.g. `prefers-reduced-motion: reduce`). Each interactive section gets a fresh page load. Overflow and console errors are checked in that state, and the section (or viewport, without `selector`) is screenshotted. See the `mobile-nav-*` entries in the config. Viewports: small 320 · mobile 375 · tablet 768 · laptop 1024 · desktop 1440.

**Adding a section:** when a section ships, add `{ name, page, selector, reference: { x, y, width, height } }` to `sections` in the config (the rectangle is in reference-image pixels; see `UI_BREAKDOWN.md`). Run, review the sheet, report; after owner acceptance, run with `--approve` and commit the baselines.

**Measured comparison (M2.7 method):** when tuning against the reference, measure instead of eyeballing. Find "ink runs" (columns containing glyph pixels) in the reference crop (scaled ×1.326 to 1440) and in a 1x screenshot at 1440, then compare left/right edges per element. For weight, compare stroke density (mean darkness inside the word box). Probe scripts and results are recorded in `docs/verification/m2.7-investigation/README.md`.

**Interpreting results:** passing checks catch overflow, loading, console and regression problems. They are **not proof of pixel-perfect accuracy.** The reference sheet is indicative (scaled mock, different copy) and must be reviewed by a person for spacing, alignment, typography, container width, colour and positioning.

**Limitations:**
- The reference is desktop-only, so reference sheets exist only at 1440. Tablet and mobile are judged against the documented responsive behaviour and baselines.
- Baselines are machine-specific (font rasterisation, Chrome version). Created on the owner's Mac with Google Chrome; a different OS or CI would need its own baselines.
- Static rendering only: no hover, focus or open-menu states yet. Interactive states (e.g. the Shop dropdown, M2.5) will need an `actions` extension.
- Console warnings are not failures; only errors, exceptions and failed requests are.
- Requires local Chrome (or `CHROME_PATH`) and free ports 3100 and 9333.
- Section reference rectangles are entered by hand.

## Known gotchas for this stack

- **Cache Components is enabled.** `new Date()`, `Math.random()`, `cookies()`, `headers()` and uncached data in a Server Component will error at build/prerender unless wrapped in `<Suspense>` or a `"use cache"` scope. Example: the footer copyright year. Use `"use cache"` in a small `CurrentYear` helper, or compute it in a cached function. Check the bundled Next 16 docs.
- **Tailwind v4** has no `tailwind.config.js` by default. Tokens live in `@theme` in `globals.css`. Arbitrary values (`text-[13px]`) are a smell when a token should exist.
- **`next/image`** needs `width`/`height` or `fill` + a sized parent. `MediaFrame` owns the sized parent (aspect-ratio box) to prevent layout shift.
- **`next/link`** for internal navigation; never use `<a href>` for internal routes.
- **Client boundary:** `"use client"` makes everything imported by that file client-side. Keep client files leaf-level and pass server-rendered content as `children`.
- **Fonts:** load via `next/font` once in `layout.tsx`, exposing CSS variables that `@theme` maps to `font-serif` / `font-sans`.
