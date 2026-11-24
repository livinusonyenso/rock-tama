# Progress

_Last updated: 2026-11-20_

## Current state

- **DevOps phase:** Phase C3B (Next.js connected to real distributor authentication) implemented and verified locally on 2026-11-20 ([D-134](DECISIONS.md#d-134--nextjs-connected-to-real-distributor-authentication-c3b)). Owner review pending before removing the demo distributor login.
- **Architecture:** [D-130](DECISIONS.md#d-130--backend-architecture) records the Express backend, [D-131](DECISIONS.md#d-131--database-roles-and-start-up-order) records the C1 role split and startup order, and [D-132](DECISIONS.md#d-132--postgresql-backed-distributor-authentication) records C2 authentication.
- **Frontend milestones:** M1 Foundation approved on 2026-11-14. See the entries below for subsequent frontend implementation and verification.

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

| 2026-11-15 | **M3.3** CSS entrance animation (`enter` keyframes, `animate-enter`, `enter-*` utilities, unlayered reduced-motion rule) applied per the approved storyboard; verification: settle waits for animations, `pauseAnimationsAt` action, `hero-animation-initial` + `hero-reduced-motion` checks | lint ✓ · tsc ✓ · build ✓ · `verify:visual` **159 passed**, same 5 pending M2.7 diffs · timings read from the browser match the storyboard exactly (ends 870ms) · t=0: content invisible, background/waves static · **layout boxes identical start vs end** · CTAs hit-testable at t=0 · reduced motion: 0 entrance animations, all opacity 1 · final state = static M3.2 hero (≤0.01%) at 6 widths · caught + fixed a var-scoping bug that would have collapsed the stagger · button hover not yet functionally testable (CTAs pending until F1/F2) |

| 2026-11-15 | **F0 + F1** `zod@4.6.7`; `lib/enquiry.ts`; `lib/server/` (env, rate limit, enquiry format + delivery: dev file / Resend REST); `content/products.ts`, `content/wholesale.ts`; `submitEnquiry` Server Action; `EnquiryForm` (+ prefill); `/wholesale` page; deploy guard in `next.config.ts`; `buttonClassName()`; `--color-error`; `.env.example`; **`/wholesale` route live** (hero Request Wholesale, nav and drawer links now work); `verify:functional` (3 delivery modes) | lint ✓ · tsc ✓ · build ✓ (`/wholesale` static) · deploy guard: simulated Vercel production build without config **fails**, with config passes · **functional: dev-file 95/95, resend-mock 40/40, unconfigured 31/31** (CTA → working form + nav `aria-current`; labels; empty submit → 7+ flagged fields, linked errors, focus first; invalid email keeps typed values; success with `RT-…` reference, focused status, **record stored with all fields**; **works with JavaScript disabled**; `?product=` prefill + unknown ignored; honeypot rejected and not stored; Resend called with correct auth/to/reply_to/subject; provider 500 → honest error + values kept; 6th submission rate-limited; unconfigured → honest error) · visual: 189 passed, only intended diffs (drawer Wholesale now live; 5 pending M2.7) · fixed 3 tool bugs found while testing (off-screen clicks, hang with scripts disabled, missing evaluate timeout) |

| 2026-11-15 | **Wholesale landing (D-076)** sections hero → products → who we supply → how it works → enquiry; `ProductCard`, `SectionHeading`, `SelectProductLink`, `/wholesale/[product]` (3 static pages), `proxy.ts` 404, `outline-light` button, smooth anchors | lint ✓ · tsc ✓ · build ✓ · functional **dev-file 131/131, resend-mock 40/40, unconfigured 31/31** (structure/order, no prices or promises, catalogue names, Explore Products scroll, select with JS keeps typed input + URL + focus + announcement, reduced motion instant, **select without JS → pre-built page → successful stored enquiry with the product**, product kept through validation, unknown slug **HTTP 404 noindex**, product pages 200 with product selected in server HTML) · visual 190 passed (only pending M2.7 diffs) · review fixes: compact placeholder labels, lining numerals, non-duplicated packaging · evidence `docs/verification/wholesale-landing/` |

| 2026-11-15 | **Homepage §4 Trust strip** + **claims register/guard** (D-078, D-079); homepage checklist `docs/HOMEPAGE_CHECKLIST.md` | lint ✓ · tsc ✓ · build ✓ · claims guard: simulated Vercel production build blocked listing 7 unverified claims; normal builds pass · `verify:visual` trust at 7 widths: 6 items, all claims registered, icons aria-hidden, no overflow; @1440 measured: height 119/117, label widths ±6, centres −7…+5 after least-squares track fit · responsive 2/3/6 columns reviewed · evidence `docs/verification/home-4-trust/` |

| 2026-11-15 | **M2.7 approved → baselines promoted** (D-080) | full visual 232 passed + exactly the 5 expected diffs; functional 131/131; after `--approve`: **242/242** |

| 2026-11-16 | **Drawer baselines re-approved** (D-086) | differences start at the Shop row only; 69 drawer checks pass |

| 2026-11-16 | **Homepage §5 Our Products** (D-087–D-089): `ProductRangeSection`, `OfferCard` (+ `ProductCard` adapter), `Reveal`, `SectionHeading`/`ButtonLink` options, `homeProducts` content, `--text-section` 38px + `--text-subtitle`; `products` section built; tool `revealPage()` before page captures | lint ✓ · tsc ✓ · build ✓ · **functional dev-file 323/323, resend-mock 40/40, unconfigured 31/31** (4 cards in order with exact hrefs/labels; no prices or unconfirmed products; keyboard Tab through 4 CTAs with visible focus; card + distributor links navigate; reveal starts hidden below the fold, shows on scroll with 0/80/160/240ms stagger, **cards jumped past are revealed** (bug found + fixed); reduced motion and no-JS: nothing hidden, links work) · **visual 522/522** (no overflow 320–1440, no console errors) · reviewed @1440 vs reference: fixed collapsed landscape placeholders, heading size/weight, centred stacked cards; remaining height difference V-011 · fixed test `hero-shop-now` counting hidden previous-route cards (D-089) · evidence `docs/verification/home-5-products/` |

| 2026-11-15 | **F2 complete** (D-081–D-085): catalogue model (standard/custom/future, listed only), `/shop`, 3 static product pages, product enquiry integration, `ShopMenu` + mobile Shop list replacing the build guard, shop routes live (**Shop Now works**), **Hero Product Carousel**; tool fixes (D-084) | lint ✓ · tsc ✓ · build ✓ (all shop/wholesale pages static) · **functional dev-file 283/283, resend-mock 40/40, unconfigured 31/31** (shop listing: only confirmed products, Price on request, no ₦; product page → enquiry with product preselected → stored; 404 for unknown + unconfirmed slugs; hero Shop Now; Shop menu: disclosure, 4 links, Escape + focus return, outside click, tab-away, navigation, link without JS; mobile Shop list; carousel: initial state/ARIA, **real 6s rotation**, hover/focus/hidden-tab pauses, manual select stops rotation, Play resumes, View link, reduced motion, no-JS links, hero height stable with carton) · **visual 301 passed**; only the 3 drawer baselines differ (intended, owner re-approval needed); desktop header pixel-identical to approved baseline; hero bottle within 4px of the reference · evidence `docs/verification/f2/` |

**Not verified (M1):** visual check in a browser. (Superseded for the bar by M2.2; the rest of the page is still the starter.) The page still shows the create-next-app starter content (now in Source Sans 3 on ivory), so there is nothing design-specific to compare yet. The first visual comparison happens in M2.

## Pending

- M2 – M8 (see `IMPLEMENTATION_PLAN.md`)
- PROPOSED decisions awaiting approval: D-009, D-011, D-012, D-014 (D-003, D-004, D-005, D-019, D-025 approved 2026-11-14; D-026 added)
- Scope B requirements session (after homepage)

| 2026-11-16 | **Vercel 404 fixed (D-097):** opt-in `DEPLOY_MODE=staging` so Vercel production builds succeed (guards warn, noindex) | lint ✓ · tsc ✓ · simulated Vercel production build: without staging exit 1 (guard), with staging exit 0 + 2 warnings · `next start`: 200 + `X-Robots-Tag: noindex, nofollow` |

| 2026-11-16 | **Quality & Safety restyled to the owner's image (D-108):** owner's revised design: shared spring artwork (waterfall + leaves) behind Quality + supply banner, eyebrow rule, larger heading, filled icon circles, indicator dividers, flask icon, banner inset | lint ✓ · tsc ✓ · build ✓ · functional dev-file 596/596, resend-mock 40/40, unconfigured 31/31 · quality + supply + storefront-images + 200%-text checks 162 passed at 7 widths; only failures are the pre-existing header overflow at 200% text (same on the previous commit) · full visual run: no new failures in these sections (header/hero/mobile-nav baselines and wholesale stale-CSS errors from a concurrent rebuild also fail without this change) · found + fixed during testing: decorative image not aria-hidden, banner description collapsing at 1280, indicator columns collapsing at 200% text (desktop rows now flex-wrap) · reviewed @1440 against the owner's design, plus 375/768/1024/1280 |

| 2026-11-16 | **Contact Us, testimonials, footer socials (D-111)** | lint ✓ · tsc ✓ · build ✓ · new checks: visual/a11y 161/161 (contact, testimonials, footer at 7 widths), journeys 74/74 (header, footer and mobile-menu Contact links, Contact → wholesale, testimonials without JS and with reduced motion) · real-details path verified by a temporary flip (wa.me + mailto links, notice hidden) · simulated Vercel build warns about the placeholders · full functional run 640 passed, 2 failed = stale-CSS 404s from a concurrent rebuild by another session (not code); full visual run not finished at commit time (owner asked to commit + push) |

| 2026-11-16 | **Testimonial slider (D-112):** 6 sample testimonials, scroll-snap slider with autoplay + controls | RESULTS_PLACEHOLDER |

| 2026-11-17 | **Homepage Contact Us section (D-117)** | lint ✓ · tsc ✓ · build ✓ · home-contact 77/77 at 7 widths (h2 + two h3 cards, placeholder notice, no wa.me/mailto while placeholder, no duplicate wholesale box, last section before footer, no overflow) · /contact page checks still pass · earlier full-run failures (shop, hero CTAs, quality/origin navigation) re-run on current code: 78/78 pass (they came from concurrent edits during the run) |

| 2026-11-17 | **Shop pack/carton imagery (D-118):** Pack of 24 × 750 ml (price on request) with tray images; carton gallery = five 12 × 1.5 L views (wrong 24-tray removed) | lint ✓ (only warning is in another session's untracked scratch file) · tsc ✓ · build ✓ · shop journeys 74/74 (mobile + desktop) |

| 2026-11-17 | **Per-pack quantities in the shop (D-119)** | tsc ✓ · lint ✓ (only warning in another session's scratch file) · build ✓ · shop journeys 116/116 on mobile + desktop (incl. new multi-select, multi-add, nothing-selected; all controls fit at 320–1440) · mobile and desktop screenshots reviewed |

| 2026-11-17 | **Buy now + one cart/checkout page (D-121)** | lint ✓ · build ✓ · shop/cart/checkout journeys 269/270, the one failure (`shop-menu-navigate` console RSC-prefetch error) passed on two isolated re-runs (intermittent) · /cart → /checkout 308 verified · screenshots reviewed |

| 2026-11-17 | **Online payment: Paystack + test gateway (D-122)** | lint ✓ · tsc ✓ · build ✓ · functional dev-file 881/882, resend-mock 40/40, unconfigured 62/62 (the one failure: intermittent Next RSC-prefetch console error 'can't infer type of chunk' under full-suite load; 0 occurrences in 8 isolated runs, also seen once in the D-121 run) · test gateway journeys: default, unpriced, success (one TEST notification, basket cleared), failed, cancel, forged link, webhook closed · real Paystack adapter against a fake Paystack API (documented contract): initialize → hosted → callback verify + notify → confirmation verify; webhook valid 200 (no duplicate) / bad or missing signature 401; tampered amount, USD and provider-failed never shown as paid; provider down → pending · simulated Vercel staging build warns 'online payments are not live' |

| 2026-11-17 | **Always pay; on request = custom labels (D-123)** | lint ✓ · tsc ✓ · build ✓ · functional dev-file 874/874, resend-mock 40/40, unconfigured 31/31 (incl. shop-unpriced-hidden, shop-stale-basket, checkout-stale-unpriced, checkout-pay-default without an order-request option, product-buy-journey) · screenshots reviewed |

| 2026-11-17 | **Payment page: card or bank transfer (D-124)** | lint ✓ · tsc ✓ · build ✓ · functional dev-file 905/905, resend-mock 40/40, unconfigured 31/31 · new journeys: payment page (server total, RT-ORD reference, both methods, no PII in URL), card → test gateway success/failed/cancel (cancel returns to /checkout/pay), transfer details (demo-labelled account, narration = order ref), transfer with ID (awaiting confirmation, basket + pending order cleared, TEST TRANSFER notification), receipt-only (PNG stored and checked by content), neither → asks for one, fake image rejected, expired session · screenshots reviewed |

| 2026-11-17 | **One shop UI for every Shop menu item (D-125)** | lint ✓ · tsc ✓ · build ✓ · functional dev-file 907/907, resend-mock 40/40, unconfigured 31/31 (incl. product-page-content, product-urls-same-ui, product-switch-resets; menu/footer/home/carousel product links check breadcrumb + preselected pack) · screenshots reviewed |

| 2026-11-17 | **Dev warnings fixed: URL data outside Suspense, HeroCarousel key, image warnings (D-126)** | lint ✓ · tsc ✓ · build ✓ (product URLs still prerendered) · functional dev-file 907/907, resend-mock 40/40, unconfigured 31/31 · on the owner's dev server: 0 key warnings in 16 homepage loads (was ~1 in 3), no 'URL data' errors on product pages, no browser warnings/errors in the dev log for home, quality/supply, product pages |

| 2026-11-17 | **Admin portal: /auth/admin sign-in + /admin dashboard (D-128)** | lint ✓ · tsc ✓ · build ✓ · functional dev-file 1169/1169, resend-mock 40/40, unconfigured 31/31 · admin journeys 80/80 at mobile + desktop (protection is an HTTP redirect; wrong password generic; forged cookie rejected; dashboard sections and demo-data consistency; chart toggle and keyboard tooltip; logout; signed-in sign-in redirect; no overflow 320–1440) · storefront chrome unchanged on shop pages · palette validated with the dataviz validator · screenshots reviewed |

| 2026-11-17 | **Admin fixes: Date.now prerender error, sidebar from 768px, sticky image parent, eager LCP images (D-129)** | lint ✓ · tsc ✓ · build ✓ · functional dev-file 1178/1178, resend-mock 40/40, unconfigured 31/31 · admin journeys 89/89 (sidebar visible from 768px; strip only on phones) · on the owner's dev server: no Date.now error; sidebar measured visible at 1024/1280/1366/1440 (256px wide, full height, 9 items) |

## Blockers / inputs from the owner (non-blocking for M2 unless noted)

1. Official logo SVGs (placeholders used meanwhile, D-020)
2. Lab reports, ISO 22000 certificate, NAFDAC A1-2462L documents
3. Social URLs
4. Copy fixes awaiting confirmation: "Nigeria. Naturally…", "Undistilled", copyright year
5. Business confirmation of delivery coverage, wholesale fulfilment and export, to finalise announcement wording (D-030)
7. Official logo SVGs (header horizontal + footer stacked **light** colourway, D-038)

## Next proposed task

**Review §6 comparisons and §7 briefing (`QUALITY_SECTION_BRIEFING.md`); do not implement §7 yet.** Default Turbopack build still needs a normal-terminal check; global header enlarged-text issue is tracked separately. §5 baseline promotion remains explicitly unauthorised pending comparison review. V-011 investigation recorded; no UI changes.

2026-11-16: prepared §6 briefing from original screenshot and current primitives; checked Natural Earth public-domain terms; registered two unverified planned origin claims. Updated project workflow/records. Documentation and registry only; no UI implementation, push or deployment. Validation: `npx tsc --noEmit` and `git diff --check` pass. No browser/build checks rerun for this planning task; prior UI checks remain historical.

## §6 implementation update — 2026-11-16

Approved briefing implemented in source, including Natural Earth Africa geometry and town marker, placeholder art direction, responsive story/indicators and shared Reveal. Source-level checks pass: lint, TypeScript, diff whitespace, SSR semantics/claim references/route resolution and real-photo branch; generator checks checksum, closed dissolved rings and Nigeria containment. Simulated Vercel production build correctly rejects all nine unverified claims. Normal `npm run build` fails with Turbopack worker-port `Operation not permitted` even after escalation. Origin visual harness reports 0 passed / 0 failed / 1 incomplete (server unavailable); no screenshots generated. Full browser/functional suites not completed. Report: `verification/home-6-origin/implementation-report.md`. Do not call §6 verified or approve baselines. Next work is finishing §6 verification in an environment permitting local worker ports, not §7. Nothing pushed/deployed.

## Verification recovery — 2026-11-16 (D-093/D-094)

Classified blocker as probable sandbox/Turbopack worker permission interaction: minimal loopback bind fails sandboxed but passes escalated; Turbopack loader child still EPERM, no port conflict evidence. Supported plain Webpack compiles but lacks Tailwind compilation; rejected its unstyled captures. Temporary existing-loader hook produced a valid styled Webpack artifact, restored byte-for-byte afterward. No permanent config/dependency/security changes. Source lint/tsc/diff checks pass.

Chrome found and verified fixes for page-end Origin reveals and enlarged compact-heading wrapping; default Reveal inset and normal headings unchanged. Final Origin captures: **105/105**, seven widths; geometry/AA contrast/map provenance checked and screenshots inspected. Full visual regression: **393 passed, 3 failed** (existing global header overflow under 200% root text ×2, expected drawer @320 baseline difference); header/announcement normal screenshots 0.00%. No baselines promoted. Functional journeys all pass on the same diagnostic artifact: **361/361 dev-file, 40/40 resend-mock, 31/31 unconfigured**, with `--no-build` because the default Turbopack worker remains blocked. Reports in the recovery folder. Original `0f8618e` retained. §7 briefing prepared with evidence/certification gates only; no §7 implementation. Details and outside-environment commands: `verification/home-6-origin-review/RECOVERY_REPORT.md`.

Local source/evidence commit: `627e42e` (two narrow fixes + verification evidence), appended after retained `0f8618e`; no history rewrite. Documentation/§7 briefing recorded separately.

## Homepage completion pass — 2026-11-16 (D-095/D-096)

Built QualitySection (registered claims, ISO hidden), WholesaleBanner (real quote destination, existing segments) and shared SiteFooter (route-driven links, cached year, disabled newsletter, no guessed socials). Reused existing components; no dependencies. Scope authorisation superseded per-section stop gates; supporting plan at `REMAINING_HOMEPAGE_IMPLEMENTATION.md`. Content/source evidence and precise test outcomes: `verification/home-7-9-completion/REPORT.md`. Default Turbopack environment limitation unchanged; styled diagnostic Webpack builds with config restored. Prior §5/§6 and new screenshots remain unapproved. Next: owner feedback, M8 wider audit and client assets/evidence/service inputs, not another homepage section.

Verification outcome: lint/tsc + styled Webpack build pass; 8 certificate gates and production rejection of 13 claims pass. Full initial browser run 777 pass/4 known failures; final focused new-section run 200 pass/2 existing global-header failures. New-section own text reflow passes. Mock delivery 40/40, unconfigured 31/31. Actual responsive captures and differences committed under `docs/verification/home-7-9-completion/`; no approval/push/deployment.

## Image asset integration — 2026-11-16

Nine owner PNGs preserved under docs/assets/source; five live optimized WebP files in public/images/{products,services,origin}, four future/custom derivatives internal only. Shared typed media updates all catalogue consumers; same 750 ml image reused by hero. Descriptive alt, responsive sizes, transparent canvas trim, preserved alpha, fixed ratios and Origin focal point. No product availability/price/claim or staging config changes; official logos remain pending. Image review found/fixed narrow-desktop CTA overflow by keeping product grid at two columns below 1400px, four at 1440 reference. Final checks and captured views: `verification/storefront-images/REPORT.md`. No push/deploy/baseline promotion.

Image verification: lint/tsc and styled diagnostic Webpack build pass; 9 source/output integrity checks pass; initial carousel/no-JS/enquiry run 307/307; final 7-width image/CTA run 283/283. Captures and limitations recorded in `verification/storefront-images/REPORT.md`. Original stage configuration untouched.

Final homepage column-count/containment verification after rem breakpoint correction: **175/175**, all seven widths; 1440 is four columns, 1024–1366 two, mobile one. Final captures refreshed in storefront-images; prior cross-page 283/283 and carousel/enquiry 307/307 results retained separately.

## Deployment blocker removal — D-100, 2026-11-16

Automatic staging removes fatal build errors for missing enquiry configuration and pending claims; noindex retained. Explicit DEPLOY_MODE=production remains strict. Runtime enquiry logic unchanged. Verification: lint/TypeScript; six actual-config cases via `node scripts/deployment-config-check.cjs`; local styled diagnostic Webpack production-mode build succeeded with VERCEL_ENV=production and missing credentials, emitting delivery/claim warnings. No default Turbopack pass or actual Vercel deployment claimed. Details: `verification/deployment-auto-staging/REPORT.md`. No push/deploy.

## Hero background and proposed branding — D-101 (2026-11-16)
Implemented owner-supplied horizontal header logo, stacked footer logo (ivory backing; light variant requested for direct green placement) and static decorative hero water background. All copy/CTAs/three-slide carousel and entrance/reduced-motion behaviour preserved. Original PNGs moved unchanged to docs/assets/source/branding, optimized derivatives/manifests reproducible with prepare-brand-images.mjs. Mobile logo 48px height, wide desktop64px; footer width-driven to preserve ratio in its narrow desktop column.

Final verification and six-width comparison images: `verification/hero-brand-integration/REVIEW.md`; full functional report: `verification/hero-brand-functional/report.md`. Default Turbopack final CSS rebuild fails worker-port EPERM even escalated; styled diagnostic Webpack passes, temporary config restored. Client visual approval still pending; §5/§6 baselines unchanged. Next: owner review of proposed artwork/comparisons, final light logo and source/evidence inputs, deployment/enquiry readiness. No push/deploy.

D-101 final results: lint/TypeScript and styled diagnostic Webpack PASS; visual170pass/6 expected placeholder-header baseline differences; functional403/403 dev-file,40/40 mocked delivery,31/31 unconfigured. Contrast≥4.77:1 for gold,9.11:1 off-white under conservative brightest-source test. Final source hashes/dimensions/alpha validated. All comparison screenshots remain pending owner review.

## D-102 — five-slide animated hero (2026-11-16)
Owner-authorised implementation complete: reusable HeroCarousel with typed slide data, one stationary supplied waterfall, five separate alpha bottles (750ml/1.5L/wedding plus authorised generated memorial/coronation concepts). Synchronized copy/CTAs,600ms opacity/translate,6s autoplay,44px arrows/dots/pause, hover/focus/hidden-tab pause, real touch swipe, reduced-motion/no-JS and async decode/request cleanup. /custom-labels is a real enquiry destination reusing the validated existing action/form; not a fake editor/order flow. Header/nav/catalogue/other homepage components unchanged. Teaching guide: HERO_CAROUSEL_GUIDE.md.

Lint/TypeScript and styled diagnostic Webpack build pass (15routes; config restored). Default build font-fetch restriction then elevated Turbopack worker-bind EPERM recorded; no default pass claimed. Corrected final visual/focus/real-touch run104/104 at320/375/768/1024/1280/1440. Final full functional/provider evidence and screenshots: verification/hero-five-slides/REVIEW.md. Visual/artwork approval pending; no push/deploy.

D-102 final verification: full functional507/507; final responsive/contrast/focus/real-touch104/104; full-height five-slide captures78/78; Resend mock40/40 and unconfigured31/31. All five distinct alpha images and original hashes checked; no placeholders remain. Screenshots and generated concepts await owner/client review.

D-103: removed visible hero dot/arrow/pause bar with focus-only accessible controls; removed normal-flow toolbar row while keeping autoplay and swipe. CSS change; image/content/timer logic unchanged. Verification: docs/verification/hero-controls-hidden/REVIEW.md. No push/deploy.

D-104: first hero bottle updated to new ROCK-TAMA-only750ml artwork from image copy6; optimized/versioned WebP and source manifest updated. Existing1.5L AFRICA artwork still needs a matching size-specific version. Evidence: verification/hero-rock-tama-bottle/REVIEW.md. No push/deploy.

D-105: faster hero autoplay4seconds with450ms bottle/text transitions, per owner request. No other motion or behaviour change.

D-106: removed the blinking text transition; per-slide copy/CTA now swaps instantly while only bottles animate. Grid preserves tallest-copy height. Four-second autoplay and450ms bottle transition retained. Evidence: verification/hero-image-only-motion/REVIEW.md.

## D-107 — ROCK TAMA Range image variants
Four image-only galleries added using shared MediaCarousel + existing OfferCard/ProductCard/MediaFrame. New opaque carton and pallet PNGs inspected, archived and optimized; existing bottle variants reused. Owner explicitly approved newer750ml as proposed packaging with fixed note; catalogue title/SKU/CTA unchanged.4s autoplay/450ms image movement only; pause/visibility/reduced motion/swipe/no-JS supported. Printed new pack configurations registered unverified; claim register15unverified, science evidence not inferred from artwork. Lint/TypeScript/diagnostic Webpack and deployment mode checks pass. Responsive/manual/keyboard/swipe/link evidence and corrected reduced-motion/offscreen tests: verification/range-image-variants/REVIEW.md. No push/deploy; §5 visuals still provisional.

D-107 source update: owner added6more carton views and2more warehouse views, and replaced image copy.png while implementation was active. All10final packaging sources archived/optimized; prior studio source retained. Final galleries2/2/8/4images(total16), with all carton/warehouse versions available and fixed card content.

D-107 final: lint/TypeScript, styled diagnostic Webpack and6deployment-mode cases PASS. Final six-width layout/provenance80/80; cross-page/keyboard/reduced-motion regression69/69; final visibility/all16-variant smoke13/13 PASS. Main final-batch run208checks pass with6metadata-predicate failures corrected by the80/80 run; raw results retained and explained in REVIEW. All10optimized source hashes/dimensions/alpha/metadata validated. No push/deploy.

D-108: Distributor Supply gallery uses a larger4:3 frame; warehouse photos fill it with cover fit and bottom-centred focal point, keeping the pallet prominent instead of small square letterboxing. Other product media retain contain; original transparent distributor artwork remains contain.

D-109: wholesale warehouse hero integrated/refined to owner mockup. Exact source archived,229570-byte WebP; stationary decorative cover with strong left shade, brighter right scene and gold rules. Lint/TypeScript, styled diagnostic Webpack and83browser checks at320/375/768/1024/1280/1440 PASS. Existing anchors/selection/reduced motion preserved. Evidence: verification/wholesale-warehouse-background/REVIEW.md. No push/deploy.

D-110: corrected wholesale overlay fading too early behind paragraph. Extended near-opaque forest tint through text column and softly tinted right scene. Lint/TypeScript/diagnostic Webpack PASS;66/66six-width browser checks, minimum conservative text contrast6.33:1. Evidence: verification/wholesale-overlay-refinement/REVIEW.md. No push/deploy.


Shop reference complete for owner review: final browser170/170 at six widths; provider mock40/40, unconfigured31/31; lint/types/pricing and styled diagnostic Webpack pass. Draft pricing, gallery, persistent basket and quotation prefills implemented. No push/deploy. See SHOP_REFERENCE_IMPLEMENTATION.md.


Shop route UI fixed (D-115): actual Turbopack development route78/78 at six widths, lint/types and diagnostic Webpack pass. Regression now asserts computed gallery containment; prior structural checks missed missing module classes. Evidence: verification/shop-route-css-fix/REVIEW.md. Visual approval pending, no push/deploy.


D-116: shop pack-of-12 selection now has its own gallery key and uses existing /images/products/carton-packs.webp (printed12×750ml), rather than sharing the single-bottle gallery through its catalogue SKU. Gallery remounts on presentation key so stale thumbnail selection resets. Carton retains separate gallery. Pricing, SKU and quotation conversion unchanged. Lint/types pass; mobile/desktop gallery, pack-image and option journeys26/26. Evidence: docs/verification/shop-pack-image. Screenshots remain provisional; no push/deploy.


D-119 continuous testimonials complete: production60/60, seamless-loop boundary tested, unchanged card design. D-120 checkout UI/request flow complete: lint/types/styled diagnostic Webpack,69functional +7unconfigured checks pass. Six-width captures in verification/checkout-layout. No payment integration, visual baseline approval, push or deployment.


D-127 distributor account UI complete: header icon/mobile drawer→login, registration tab/business fields, responsive green/gold/ivory design, password visibility.150/150 browser checks at six widths, lint/types/styled diagnostic Webpack pass. Owner will use custom Node.js/Express; API not connected, submission visibly unavailable. Evidence/guide: DISTRIBUTOR_ACCOUNT_UI.md. No push/deploy.


Distributor demo dashboard complete: any email/non-empty password→dashboard, refresh persistence, account routing and logout. Responsive navigation, sample orders/details, profile, live basket count and real shop/supply/support links.138/138 browser checks at six widths; lint/types/styled diagnostic Webpack/session checks pass. Password never sent/stored; no real authentication/approval/orders. Strict production disables demo. Guide DISTRIBUTOR_DASHBOARD.md. No push/deploy.


Payment expiry prerender blocker fixed: request boundaries before order-cookie/test/payment-result token validation. Actual dev cancellation/failed/expired flows13/13; signed-token expiry/tamper cases, lint/types and styled diagnostic Webpack pass. No payment behaviour/UI changes, push or deployment. Review verification/payment-token-runtime/REVIEW.md.


Navbar cleanup complete: inactive Search removed from desktop/mobile, existing menu order/destinations retained per approved review. Lint/types pass; live browser82checks pass with9older-baseline visual differences, no functional/overflow failures. Header1440/1024 and mobile drawer visually inspected. No baseline promotion/build rerun/push/deploy. See verification/navbar-cleanup/REVIEW.md.


Customer receipt feature complete in code: verified payment→merchant notification + separate customer receipt. Local preview19/19, mock provider7/7, logic/retry/escaping checks, lint/types and diagnostic Webpack pass. Supplied Paystack test keys installed in ignored local environment; external initialization/verification returned403 (not validated). Resend absent locally, so no real emails sent yet. PAYMENT_RECEIPTS.md documents setup/limits. No push/deploy.


PDF receipt download + email attachment complete; signed-in checkout prefills email and reuses validated contact/address details during the demo session, including after paid checkout. Guest/edit/logout paths verified.81/81 browser checks plus receipt/profile/access tests and native PDFKit rendering/text checks pass; lint/types/diagnostic Webpack pass. Real email setup and prior Paystack403 remain external blockers. See RECEIPT_DOWNLOAD_AND_CHECKOUT_PREFILL.md. No push/deploy.


Node/Express/PostgreSQL/Docker/GitHub Actions guide delivered: docs/NODE_EXPRESS_POSTGRES_DOCKER_GITHUB_ACTIONS_GUIDE.md.20 ordered steps and18 complete file examples covering API, migrations, tests, Dockerfiles, base/dev Compose and CI. JS/JSON/shell/YAML and Compose model validation pass in /tmp; no dependency installation, container startup or workflow execution. Existing app unchanged. Validation: verification/backend-guide/REVIEW.md.

## DevOps Phase 1, Task 1 — 2026-11-19

Created the Express 5.3.0 service in `backend/` under [D-130](DECISIONS.md#d-130--backend-architecture). `GET /health` returns HTTP 200 with `{"status":"ok"}`. The service listens on `0.0.0.0`, with port 4000 as the default and `PORT` as the override. Express is the sole direct dependency, and the npm lockfile records the install.

Verified on Node.js v26.13.1 LTS. `npm ci` reproduced the install, the built-in HTTP test passed (1/1), and live requests returned HTTP 200 with the expected JSON on ports 4000 and 4400. The sandbox denied the loopback socket on the initial test run. Verification passed outside the sandbox, and both temporary API processes were stopped. Frontend TypeScript and ESLint checks passed.

**Next proposed DevOps task:** After owner review, create a dedicated local Docker Compose project for the API and PostgreSQL. Verify that the API responds and the PostgreSQL service reports ready. Database schema work and deployment await separate approval.

## DevOps Phase C1 — Secure database foundation — 2026-11-19

Scope approved by the owner: C1 only ([D-131](DECISIONS.md#d-131--database-roles-and-start-up-order)). No frontend, auth or payment code changed; no AWS resources; nothing pushed.

- `compose.migrate.yml`: `db-bootstrap` (idempotent roles, runs every `up`) → `migrate` (as `rocktama_migrator`) → `api` (as `rocktama_api`). Either one-shot failure stops the API from starting.
- `backend/db/bootstrap-roles.sql`: creates `rocktama_migrator` (table owner) and `rocktama_api` (DML only, 20 connections), revokes database `CONNECT` from `PUBLIC`, transfers the two existing tables to the migrator, and makes `schema_migrations` read-only for the API. Non-destructive. It runs as a service, not an init script, because `/docker-entrypoint-initdb.d` never re-runs on the existing volume.
- `compose.db.yml`: the API now connects as `rocktama_api`. `rocktama_app` remains the bootstrap superuser (PostgreSQL forbids removing it), used only by `db-bootstrap`.
- `backend/src/shutdown.mjs` + `server.mjs`: SIGTERM/SIGINT close the HTTP server, then the pool; 8 s forced-exit fallback.
- `backend/Dockerfile`: `node:26.13.1-bookworm-slim` pinned by multi-arch digest; dependencies layer first; code owned by root; runs as `node`.
- Tests: `test/shutdown.test.mjs` (4 unit) and `test/integration/database-roles.test.mjs` (7, skipped unless connection strings are set). New `.env.docker.example`; `.gitignore` allows it.

**Verified:** pre-change `pg_dump` taken. After start-up: `db-bootstrap` and `migrate` exit 0 (two full runs, plus two queued runs of the earlier mount-based version: idempotent); the migrate log says "Already applied: 001_initial.sql"; `app_metadata` (schema_version = 1) and `schema_migrations` (001, original checksum and `applied_at`) unchanged; both tables owned by `rocktama_migrator`; the API's live connection is `rocktama_api` (`rolsuper = f`); `/health` and `/health/ready` return 200. Unit 7/7, integration 7/7, image user `node` with Node v26.13.1, `docker stop` returns in under 1 s with exit code 0 and "Shutdown complete". Frontend `tsc` and `lint` pass. Not run: `npm run build`, visual checks (no UI change).

**Incident:** the first bootstrap version bind-mounted the SQL from `~/Desktop`; Docker Desktop stalled every container start until the owner approved the macOS folder-access prompt. Replaced with a built image (no bind mount, also portable to ECS). An empty anonymous volume from that first container remains attached to `rocktama-db-bootstrap-1`; it is harmless.

**Next proposed DevOps task:** C2: `002_auth.sql` (users, sessions) and the register/login/logout/me endpoints, after owner approval of the Phase B design (including the `argon2` dependency).

## DevOps Phase C2 — Database-backed distributor authentication — 2026-11-20

Implemented `002_auth.sql` and the register, login, logout and current-user endpoints in [D-132](DECISIONS.md#d-132--postgresql-backed-distributor-authentication). Pending accounts can sign in and see their own status. The C1 migrator owns the auth schema, and the API role cannot approve users or alter the schema. See the [authentication guide](BACKEND_AUTHENTICATION.md) for the flow, contracts and test commands.

**Review fixes (20 Nov):** the Origin check now covers every method except GET, HEAD and OPTIONS, not only POST. A new integration test proves distributor access follows the stored status on every request. Unexpected auth errors now log their error code only.

**Verified:** 12 unit tests and 20 integration tests passed against local Compose PostgreSQL 18.7, including the C1 role suite. Live Docker API smoke passed for register, login, current user, logout and revocation. The migrator applied `002_auth.sql`, a repeat run skipped both applied migrations, and the existing `001_initial.sql` checksum and timestamp match the pre-C2 values. The existing PostgreSQL container and data volume were preserved. Frontend lint and type checks passed.

**Architecture Explorer:** updated to version 2 at the same link, showing C1 and C2 as verified and C3, CI and AWS as planned.

**Next proposed task:** Owner review of C2, then connect the Next.js account forms in a separate task. Public rollout work includes email ownership verification, recovery, approval and intended HTTPS proxy verification.

## DevOps Phase C3A — Authentication security hardening — 2026-11-20

Scope: [D-133](DECISIONS.md#d-133--authentication-hardening-c3a). Registration no longer reveals existing emails, and login limits count failures only (per IP, per email-and-IP, per account). `TRUST_PROXY` is an explicit allow-list, there are session guards for approved-distributor routes, stale cookies are cleared, and demo/admin sign-ins fail closed. Migration `003_auth_login_limits.sql` was applied by the migrate job; 001 and 002 were skipped by checksum.

**Investigated:** in local Compose, every request reaches Express from the gateway `172.18.0.1`, and a spoofed `X-Forwarded-For` was ignored. Both were observed by matching the stored rate-limit key hashes.

**Verified:** backend unit 17/17 and real-PostgreSQL integration 26/26. Live Docker smoke: identical 202 for new and duplicate registration; pending login and `/me`; five failures then 429 with `Retry-After: 900`; stale cookie cleared. `TRUST_PROXY=true|*|2` stops the container. Frontend `tsc`, lint, `distributor-demo-check`, new `admin-auth-check` (10 cases), `deployment-config-check` and the payment/receipt/pricing/certification scripts all pass. A standalone `next build` without `DEMO_AUTH` passes and prerenders `/auth/admin` and `/account/login` with no demo login (fail closed).

**Visual (`npm run verify:visual`, run `.verification/2026-11-20T12-13-47`):** 2009 passed, 44 failed, 7 incomplete (no baseline yet).
- All 221 account, dashboard and admin checks pass.
- 21 failures are stale predicates: the hero check expects exactly 5 slides on the page, but the D-107 range galleries add 16 more; the testimonials check expects the pre-D-119 six-slide slider, while the page renders 12 quotes in two loop groups.
- 2 are the known V-013 overflow at 200% text size. 10 are header and mobile-nav baseline differences carried over from the navbar cleanup. C3A changed no component, content or header file.
- 10 checkout failures (`#checkout-name` not found) and 1 font-timing check come from order dependence. Checkout scenarios run after dashboard scenarios that now log into the demo, and they don't clear cookies, so they inherit a demo session and saved profile. In isolation (`--no-build`, the same 9 scenarios at mobile and desktop) 50/50 pass. Follow-up: give the checkout scenarios `{clearCookies:true}`.

**Harness fixes during verification:** the first run failed every demo-login check because pages are prerendered at build time and the build step lacked `DEMO_AUTH`. `visual-check.mjs` now passes the opt-in to the build as well as to `next start`. A real admin login now always gets a Secure cookie on a production server; only the demo credentials on a non-Vercel `next start` omit it.

**Incident:** the first integration run closed database connections before fixture cleanup, leaving 4 test users. They were deleted by exact email, and the cleanup now runs last-in, first-out.

**Next proposed task:** C3B — connect the Next.js login and register forms through a same-origin route, choose the trusted-proxy topology and the SameSite policy, and set `DEMO_AUTH=enabled` on Vercel staging if the demos should stay visible there.

## DevOps Phase C3B — Next.js connected to real distributor authentication — 2026-11-20

Scope: [D-134](DECISIONS.md#d-134--nextjs-connected-to-real-distributor-authentication-c3b). A same-origin gateway (`app/api/v1/auth/[action]/route.ts` → `lib/server/auth-gateway.ts`) forwards only the four auth endpoints to the server-only `API_URL`. `lib/server/api.ts` `currentAccount()` serves Server Components. The real login and registration forms, the real dashboard with a pending-review state, the logout button and `/account` routing are connected. Migration `004_distributor_profile.sql` stores phone, location and consent. The cookie is now `SameSite=Lax`, and `AUTH_ORIGIN` accepts a list of exact origins.

**Measured:** with an echo API, Next.js passes a client-written `X-Forwarded-For` through unchanged and fills it in only when missing. The gateway therefore forwards no client address unless `AUTH_CLIENT_IP_SOURCE=x-forwarded-for` is set behind a proxy that writes that header.

**Verified:**
- Backend unit 17/17 and integration 26/26 on real PostgreSQL. Migration 004 applied; 001–003 skipped by checksum.
- Frontend `tsc`, lint, production build, and the new `auth-gateway-check`. The admin, demo, deployment, receipt, payment, pricing and certification scripts pass.
- Browser: the 10 new auth journeys pass 67/67 against the Compose API (register, duplicate, wrong password, pending dashboard, `/account` routing, logout, expired cookie, unauthenticated access, rate limit, and gateway security: Origin, cookie lifecycle, spoofed `X-Forwarded-For`, direct API, bundle scan).
- Full `verify:visual` (`.verification/2026-11-20T13-06-43`): 2083 passed, 33 failed, 7 incomplete. All 405 auth, account, dashboard, admin, checkout and receipt checks pass. The 33 failures are the known pre-existing ones (21 stale hero/testimonials predicates, 2 V-013 enlarged-text overflow, 10 old header and mobile-nav baselines).
- Checkout journeys now start as fresh guests, which removed the C3A order dependence. 15 local test accounts (`rocktama-c3b-…@example.test`) were removed after the runs.

**Incidents:**
- Locally every request reaches Express from one gateway address. The first suite runs exhausted the shared registration limit (10 per hour). The journeys now share one account (3 registrations and about 11 failed logins per run), and the two local IP counters were cleared once.
- The verifier runs journeys page by page. All auth journeys now share one page so their order holds.

**Final verification on `7b64dd7`:** backend unit 17/17, PostgreSQL integration 26/26, frontend production build, lint, TypeScript, gateway, admin/demo, payment-token, receipt/profile and pricing checks passed. Chrome confirmed real registration, duplicate handling, login, pending profile, logout, revoked-cookie rejection, and origin and header restrictions. The focused desktop run passed 52/52. Pending profile layout passed at 320, 375, 768 and 1440 px. The final sweep (`.verification/2026-11-20T13-21-55`) recorded 2,095 passes, 33 failures and seven incomplete checks. The visual-only replay (`.verification/2026-11-20T13-25-55`) reproduced the same 33 failures and seven incomplete checks: seven stale hero slide-count assertions, 14 stale testimonials assertions, seven incomplete testimonials layout checks against removed markup, two V-013 enlarged-text overflows, and ten header/drawer baseline differences. No baselines were promoted. The isolated checkout/account replay had one intermittent malformed-transfer-file assertion, which passed in the full run. Resend-mock passed 71/71 and unconfigured delivery passed 31/31.

**Security review:** the gateway limits streamed request bodies to 8 KiB, refuses upstream redirects, and validates the complete account shape before rendering. Distributor forms render with a POST method before hydration. The application changes are limited to authentication and distributor profile storage. Checkout prefill still follows the demo session, and the guest checkout and payment/receipt flows were exercised with test or mock delivery. The editable Claude artifact was unavailable during this pass.

**Next proposed task:** a reviewed removal of the demo distributor login, and moving checkout prefill to `/me`, each with approval. AWS backend deployment planning follows.

## AWS backend deployment plan prepared — 2026-11-20

[AWS_BACKEND_DEPLOYMENT_PLAN.md](AWS_BACKEND_DEPLOYMENT_PLAN.md) recommends one `t4g.small` EC2 instance running Docker Compose (Caddy, the API, Postgres on encrypted EBS, Parameter Store secrets, SSM access with no SSH). That is about $17–19 per month, against about $50–55 for ECS, an ALB and RDS. Until a domain exists, HTTPS uses an sslip.io hostname.

**Verified locally:**
- The API image builds and runs as linux/arm64 and linux/amd64: Argon2 works, it runs with a read-only root filesystem, `--cap-drop ALL` and `no-new-privileges`, and it served `/health`, `/health/ready`, `/me` (401) and Origin rejection (403) against the real database.
- `docker stop` takes 0.17 s.

**Not checked:** the ECR configuration (the AWS session had expired; `aws login --profile rocktama-dev` is needed). No AWS resources were created.

**Next:** owner decisions in §8 of the plan, then stage 1 (`deploy/` files and a local rehearsal) after approval.

## DevOps Phase D1 — Local production rehearsal — 2026-11-20

Scope: [D-135](DECISIONS.md#d-135--local-production-rehearsal-topology-d1). The D1 files were first drafted, uncommitted, by another agent session. This session reviewed every file, reran everything, and fixed what failed. Results and commands are in [AWS_BACKEND_DEPLOYMENT_PLAN.md](AWS_BACKEND_DEPLOYMENT_PLAN.md#d1-results--2026-11-20-verified-in-d1).

**Verified:**
- A fresh first boot on an empty volume (throwaway project, removed afterwards).
- Stack health, with only Caddy on `127.0.0.1:8443`, and TLS trusted only with the rehearsal CA.
- Backend unit 17/17 and integration 26/26 on the private network.
- `verify-d1.mjs`: all five stages, including restart, PostgreSQL replacement, backup and restore, a failing-image gate and rollback.
- `verify-d1-browser.mjs` in Chrome: real-form login and logout, and SameSite=Lax cookie attachment checked directly.
- The storefront regression: 517/517.
- The development stack is byte-for-byte unchanged against the baseline, and no password appears in any log.

**Fixed:** Caddy's reserved IP being taken by the API (`ip_range`); a port check that depended on the Compose version; a browser check broken by Opaque Response Blocking.

**Corrected record:** the C3B gateway's streaming body limit and redirect guard (D-134) were committed in `7b64dd7` and are tested by `auth-gateway-check.mjs`. An earlier report said the documentation and code disagreed. That statement was wrong.

**Next proposed task:** D2. Sign in to AWS, check ECR and IAM permissions read-only, and add a budget alert; then the owner approves the billable stages one at a time.

## DevOps Phase D2 — AWS preflight and release preparation — 2026-11-20

Scope: [D-136](DECISIONS.md#d-136--ec2-staging-topology-and-release-process-d2); runbook in [AWS_STAGING_RUNBOOK.md](AWS_STAGING_RUNBOOK.md). **No AWS resource was created and no image was pushed.**

**Verified, read-only:**
- Identity: account 638486126885, `AccountFullAccessRole`, eu-north-1.
- Account plan: the Free plan, with $100 credits and expiry 2027-05-18.
- ECR: `rocktama/api` has immutable tags, but scan on push is off and there's no lifecycle policy.
- Network: the default VPC only, and no billable resources.
- Instance types: `t4g.small` and `t4g.medium` are offered in all three AZs.
- Permissions: EC2 dry-runs allowed; IAM, ECR, SSM, DLM and Budgets allowed in eu-north-1 (the earlier denials were a simulator region artefact).
- Prices: from the AWS Price List API.

**Measured:** cgroup memory peaks: api 129.5 MiB, web 118.5, db 75.4, caddy 32.7, migrate 18.8, bootstrap 7.4. A burst of 20 logins stayed inside the 4-hash cap. Recommendation: `t4g.small`.

**Built and audited:** four linux/arm64 release images at `c0bc972`. 0 secret values, no stray files, no development dependencies. `compose.staging.yml` and `Caddyfile.staging` validated; the instance policy passes IAM Access Analyzer; `smoke-staging.mjs` passes against D1.

**Next:** the owner approves D2-1 onward, one step at a time. Consider upgrading to a paid plan before production use.

## 2026-11-21: staging update df7a850

Deployed the franchise page and header/layout overflow fixes to `i-0ad28bbea578fa416`. Lint and tsc pass, and the Next.js production build succeeded inside the amd64 web image. web/db-bootstrap/edge were pushed to ECR under the full SHA; the API is unchanged, pinned by digest. SSM `deploy.sh` backed up the database first; all services are healthy. Public smoke test passed (HTTPS, ports, auth lifecycle), and `/franchise` returns 200. `npm run verify:visual` was not run for this change. Rollback: `deploy.sh rollback` returns to `ae9f789`.

## 2026-11-24: account roles, step 1 (backend, D-137)

Migration `005_account_roles.sql` (additive): roles customer/driver/distributor/admin, company required only for distributors, `vehicle_type` for drivers, and a trigger that refuses self-registered admins and sets the starting status per role. Registration accepts `accountType` (distributor by default, so the live form keeps working); `/me` returns `vehicleType` and a nullable `company`; `requireRole()` guard; `src/create-admin.mjs` operator script (password on stdin). Verified: backend unit 20/20, PostgreSQL integration 28/28 (new: per-role status, admin refused through the API and through direct SQL as `rocktama_api`, admin script and admin login). Migration 005 applied to the existing local dev database. Not deployed. Next: step 2, role-based registration/login and the customer, driver and admin dashboards.

## 2026-11-24: contact channels live

Owner supplied the WhatsApp/phone number (+234 903 401 8849), confirmed the email is real and chose "Nanka, Anambra State" as the address. Contact cards (Contact page and homepage): WhatsApp (wa.me), Call Us (tel:), Email (mailto with subject) and Visit Us (Google Maps search built from `site.location`); none are placeholders, so they no longer block a strict launch in `content/launch.ts`. 2×2 grid from md, stacked on phones. Verified: tsc, lint, `verify:visual --section contact,home-contact` 161/161 with screenshots reviewed. Not deployed.

## 2026-11-24: account roles, step 2 (registration, login routing, dashboards, D-137)

`/account/register` now asks "I am registering as" Customer / Driver / Distributor (links, `?type=`; Customer default). Fields per type: customers no business name; drivers add vehicle type (motorcycle, tricycle, van, truck); distributors unchanged. Login routes by role; `/account` and `/account/dashboard` send drivers to `/driver`; `/driver` sends other roles to their own dashboard. New `CustomerDashboard`, `DriverDashboard` (pending review / empty deliveries) and shared `AccountDashboardLayout`; `DistributorAuthForm` renamed `AccountAuthForm`; `AccountShell` takes its panel from content. Fixed the sidebar button centring in `dashboard.module.css` (also affected the distributor portal). Verified: tsc, lint, `next build` (inside the verifier), auth journeys 124/124 against the real local API and PostgreSQL (new: picker defaults and links, driver form, type switch, customer and driver registration → login → correct dashboard, cross-role redirects, logout), screenshots reviewed at mobile and desktop. The local `register_ip` counter was cleared once to rerun the suite within the 10/hour limit. Not deployed. Next: admin on Express sessions, then step 3 (mock order-to-driver assignment).
