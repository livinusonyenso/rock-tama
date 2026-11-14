# Progress

_Last updated: 2026-11-14_

## Current state

- **Phase:** Implementation (homepage, Scope A)
- **Milestone:** M1 Foundation **complete and approved by owner** (2026-11-14). M2 Header approved to start, task by task.
- **Current task:** none. **M2.4 desktop header complete (2026-11-15)**; stopped for owner review before M2.5 (Shop dropdown).

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

| 2026-11-15 | **M2.1** Typed site + navigation content: `types/content.ts`, `content/routes.ts` (route plan + availability, homepage section flags), `content/site.ts` (brand, logo refs, interim announcement wording), `content/navigation.ts` (main nav, Shop dropdown, header actions, "Coming soon" copy), `lib/navigation.ts` (`resolveHref`); `app/layout.tsx` metadata now reads `site` | `npm run lint` ✓ · `npx tsc --noEmit` ✓ · `npm run build` ✓ (built `<title>` = "ROCK-TAMA Natural Spring Water", description from `site.ts`) · resolver script: only `home` resolves today, 12 others `null`; simulated built `products` section → Shop + 3 product items resolve to `/#products`; no `#` hrefs among 13 items · negative test: misspelled route key rejected by `tsc` (TS2820) |

| 2026-11-15 | **M2.2** Announcement bar: installed `lucide-react` 1.73.0; `components/ui/Container.tsx`, `components/icons/Icon.tsx`, `components/layout/AnnouncementBar.tsx` (Server Component); `placement`/`priority` added to announcement content; `h-announcement` → 40px min-height; rendered from `app/layout.tsx` | `npm run lint` ✓ · `npx tsc --noEmit` ✓ · `npm run build` ✓ · **headless Chrome** at 375/768/1024/1086/1280/1440: height 40px everywhere, 1/2/2/2/3/3 messages visible as designed, one line each, 0 truncated, 0 horizontal overflow, 0 focusable elements, Source Sans 3, colours = forest-950 / on-dark / gold-500 · AX tree: complementary "Store information" › list › 3 listitems · 200% text: no clipping/truncation (wraps) at 375 and 1440 · side-by-side vs reference at 1440 reviewed, tuned (16px text, 20px icons, 16px dividers); evidence in `docs/verification/` |

| 2026-11-15 | **M2.3** `components/brand/Logo.tsx` (Server; `header`/`footer` variants; official file when `available`, otherwise a same-size labelled placeholder); `site.logos` sizes corrected to 314×66 and 170×96 | lint ✓ · tsc ✓ · build ✓ · headless Chrome via a **temporary** harness in `app/page.tsx` (restored with `git restore`, not committed): ratios 4.757/1.771 (targets 4.758/1.771), heights 40→64 and 80→96 at 375/1440, vertically centred, 0 overflow; AX tree: exactly 2 images named "ROCK-TAMA", visible "LOGO" label not exposed · real-file path tested with temporary dummy SVGs + `available: true` (reverted): renders `<img alt="ROCK-TAMA">`, loaded, identical box sizes · evidence `docs/verification/m2.3-*.png` |

| 2026-11-15 | **M2.V** `scripts/visual-check.mjs` + `scripts/visual-check.config.mjs`, `npm run verify:visual`, `.verification/` git-ignored, approved baselines in `docs/verification/baselines/` (announcement ×4 from the accepted M2.2 state); **no new dependencies** (D-041) | lint ✓ · tsc ✓ · build ✓ · clean run: **24 passed, 0 failed**, exit 0, all 4 baselines 0.00% · **negative tests** (temporary, reverted): wide element → overflow FAIL naming the element; missing image → broken-image FAIL + 404 console-error FAIL; changed announcement copy → baseline FAIL (9.99% / 7.08%) with red diff image; wrong baseline → size-mismatch FAIL with **exit 1**; unknown section → exit 2 · outputs confirmed (viewport + full-page shots, section shots, reference sheet, report.md/json) · no server/Chrome processes left running |

| 2026-11-15 | **M2.4** `components/layout/SiteHeader.tsx` (Server) + `components/layout/NavLink.tsx` (Client, `usePathname`); `chevron-down` icon; `focus-ring` utility; `tracking-nav` 0.06→0.04em; `<SiteHeader cartCount={0} />` in layout; `header` section added to the verification config | lint ✓ · tsc ✓ · build ✓ · `verify:visual`: **28 passed, 0 failed**, no overflow at 375/768/1024/1440, no console errors, announcement baselines still 0.00% · reference sheet reviewed and tuned in 2 passes (text size/tracking, icon size, underline) · scripted a11y: 0 `href="#"`; header links = logo ("ROCK-TAMA home") + Home (`aria-current=page`); 8 pending items non-focusable, default cursor, no hover colour change, sr text "(Coming soon)" in normal case; Tab order logo → Home with 2px gold focus outline; banner + navigation "Main" landmarks · evidence `docs/verification/m2.4/` · header baselines **not** approved yet |

**Not verified (M1):** visual check in a browser. (Superseded for the bar by M2.2; the rest of the page is still the starter.) The page still shows the create-next-app starter content (now in Source Sans 3 on ivory), so there is nothing design-specific to compare yet. The first visual comparison happens in M2.

## Pending

- M2 – M8 (see `IMPLEMENTATION_PLAN.md`)
- PROPOSED decisions awaiting approval: D-009, D-011, D-012, D-014 (D-003, D-004, D-005, D-019, D-025 approved 2026-11-14; D-026 added)
- Scope B requirements session (after homepage)

## Blockers / inputs from the owner (non-blocking for M2 unless noted)

1. Official logo SVGs (placeholders used meanwhile, D-020)
2. Lab reports, ISO 22000 certificate, NAFDAC A1-2462L documents
3. Social URLs
4. Copy fixes awaiting confirmation: "Nigeria. Naturally…", "Undistilled", card 4 italic title, copyright year
5. Business confirmation of delivery coverage, wholesale fulfilment and export, to finalise announcement wording (D-030)
7. Official logo SVGs (header horizontal + footer stacked **light** colourway, D-038)

## Next proposed task

**M2.5 Shop dropdown (`ShopMenu`, Client):** disclosure for the Shop item with the 4 children (all pending today), keyboard (Enter/Space/Escape, focus return), click-outside. Includes a decision on how a dropdown of only-pending items should behave. Needs a briefing.
