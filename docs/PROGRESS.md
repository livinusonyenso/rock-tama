# Progress

_Last updated: 2026-11-14_

## Current state

- **Phase:** Implementation (homepage, Scope A)
- **Milestone:** M1 Foundation **complete and approved by owner** (2026-11-14). M2 Header approved to start, task by task.
- **Current task:** **M3 (revised for real functionality, D-066–D-069).** M3.1–M3.3 (hero visuals + animation) approved and in progress; F0–F2 (functional foundations, `/wholesale`, `/shop`) planned and awaiting decisions. M2.7 baselines still await the owner's final visual approval (V-008 fix).

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

| 2026-11-15 | **M2.5** `SiteHeader.resolveNavItem`: dropdown items are interactive only via children's availability; **build guard** throws if a child becomes available before `ShopMenu` (M2.5b, moved to M5). `visual-check.mjs`: `--provisional` + `docs/verification/provisional/` (header refs from the accepted M2.4 run) | lint ✓ · tsc ✓ · build ✓ · `verify:visual` **32 passed, 0 failed**; header **0.00%** vs the M2.4 screenshots at all 4 widths (no visual change), labelled "provisional reference (NOT approved)"; announcement approved baselines 0.00% · **guard test** (temporary `products.built = true`, reverted): `next build` exit 1 with the actionable message naming `/#products`, ShopMenu, M2.5b · `--approve --provisional` together → exit 2 · a11y re-check: SHOP still "Shop (Coming soon)", not focusable, 0 `#` links, Tab logo → Home |

| 2026-11-15 | **M2.6** `MobileNav` (Client, native `<dialog>`), `MobileNavPanel` (Server), `NavLink` `tone`/`pendingLabel`, `resolveNavItem` moved to `lib/navigation.ts`, `menu`/`x` icons, `focus-ring-dark`, CSS scroll lock, mobile header (logo · cart · menu); verification tooling: `viewports`/`actions`/`expect`/`media` + 320px viewport | lint ✓ · tsc ✓ · build ✓ · `verify:visual` **119 passed, 0 failed** (exit 0). At 320/375/768: menu visible, search/account hidden, drawer modal (top layer, inert background), `aria-expanded` sync, focus moved in, focus contained after 7×Tab, Escape closes + focus returns to menu button + scroll restored, scroll locked while open, drawer not clipped, pending rows not focusable, 0 fake links, current page marked, backdrop tap closes, link tap closes, reduced motion → no transition; no overflow or console errors in any state. 1024/1440: no menu button, desktop nav visible, desktop header **0.00%** vs provisional refs (unchanged); announcement baselines 0.00% · drawer + 320px header screenshots reviewed · first run caught a test bug (reduced-motion check read duration, Tailwind sets property), fixed in the check · mobile/tablet header provisional refs refreshed (intended redesign) |

| 2026-11-15 | **M2.7** `--container-wide` 1320→1440 (D-059); `--breakpoint-hd` 1360 with header `hd:pl-23` / bar `hd:pl-22` (D-060); filled globe `GlobeFilled` (Heroicons MIT, D-061); nav gap 48, divider 2px + `xl:ml-10`, icon gap 28 + `hd:mr-2`, bar icons 24px (D-063); V-003/V-005 closed with no change (D-062); tooling: 1280 + 1366 viewports, `--save` copies sections | lint ✓ · tsc ✓ · build ✓ · `verify:visual` 126 passed, 5 failed = only intended reference changes awaiting approval (announcement approved baselines @768/1024/1440; header provisional @1024/1440) · **0.00% at 320/375/768 for header + drawer** (mobile unchanged) · all 80 interactive mobile-nav/desktop checks pass · no overflow at 320/375/768/1024/1280/1366/1440 · header a11y unchanged (logo → Home focus order, gold focus ring, 0 `#` links, no hover on pending, 8 coming-soon texts) · measured @1440 vs reference: logo −1, divider −2, icons ≤2, badge −1, bar truck +1, bar text end −1; residual V-006/V-007 · before/after set in `docs/verification/m2.7-before|after/` |

| 2026-11-15 | **V-008** fluid header/bar inset tokens (`clamp()`), `--breakpoint-hd` removed, icon-group spacing `hd:`→`xl:` | lint ✓ · tsc ✓ · build ✓ · sweep 1270–1920px: max logo step **1px** (was 60), 0 overflow · 1440 + 1024 pixel-identical to reviewed M2.7 state, 1280 header 0.95% (icon spacing now from xl) · `verify:visual` 126 passed, same 5 pending-approval reference diffs, all interactive checks pass |

| 2026-11-15 | **M3.1 + M3.2** page shell (starter page + SVGs removed), `ButtonLink`, `MediaFrame` (bottle silhouette), `content/hero.ts`, `HeroSection`, `HeroWaves`, hero tokens (D-070) | lint ✓ · tsc ✓ · build ✓ · hero @1440: height 525 = ref; all 8 elements within ±3px (widths: tagline −19, description −21, letter shapes) · responsive 320–1440: no clipping/overflow, heading one line everywhere (fixed a 1024px clipping bug found in review) · header/drawer at 320/375/768 still 0.00% · `verify:visual` 133 passed + the same 5 pending-approval M2.7 diffs · CTAs transitional (pending until F1/F2) |

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

**After owner visual approval of M2.7:** promote baselines with `npm run verify:visual -- --approve --section announcement,header,mobile-nav-open` (all viewports) and remove superseded provisional references; then **M3 Hero** briefing.
