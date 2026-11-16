# Session Handoff

_Last updated: 2026-11-16 (supplied images integrated)_

**Vercel (D-097):** production builds succeed only with the Vercel env var `DEPLOY_MODE=staging` (noindex, guards warn) until Resend is configured and claims are verified; remove it for launch.

**Where we are:** All nine homepage sections are now present. Owner authorised combined §7–§9 implementation (D-095): QualitySection + WholesaleBanner + shared SiteFooter. `docs/verification/home-7-9-completion/REPORT.md` contains current results/screenshots and limitations. Existing shop, product pages, carousel and enquiry flow retained. No new push/deployment; earlier push ended at `32e826d`. Visual baselines (including §5/§6 and new sections) are not approved by the build instruction. Default Turbopack worker restriction remains; diagnostic styled Webpack used, config restored.

**Code so far:**
- `app/globals.css`: design tokens (source of truth `docs/DESIGN_SYSTEM.md`)
- `app/layout.tsx`: fonts; metadata from `content/site.ts`
- `types/content.ts`: content types
- `content/routes.ts`: route plan + `live`/`planned` status + `homeSections.built` flags
- `content/site.ts`: brand ROCK-TAMA, logo refs (placeholders, `available: false`), interim announcement wording
- `content/navigation.ts`: `mainNav` (Shop dropdown), `headerActions`, "Coming soon" copy
- `lib/navigation.ts`: `resolveHref(key)` → valid href or `null`
- `components/ui/Container.tsx` (`content` 1200 / `wide` 1320), `components/icons/Icon.tsx` (IconName → lucide-react 1.73.0), `components/layout/AnnouncementBar.tsx` (Server; priority-based visibility; wraps only under enlarged text)
- `scripts/visual-check.mjs` + `.config.mjs`: `npm run verify:visual` (run after every UI task; baselines in `docs/verification/baselines/`, update only with `--approve` after owner acceptance)
- `components/layout/SiteHeader.tsx` (Server, `cartCount` prop) + `components/layout/NavLink.tsx` (Client; link or pending text via `resolveHref` output); `focus-ring` utility in `globals.css`
- `components/layout/MobileNav.tsx` (Client, native `<dialog>`) + `MobileNavPanel.tsx` (Server children); `resolveNavItem` (with the temporary Shop guard) in `lib/navigation.ts`; `focus-ring-dark`
- M2.7: `--container-wide` 90rem, fluid `--spacing-header-inset` / `--spacing-bar-inset` (D-064), `components/icons/GlobeFilled.tsx` (MIT notice inside)
- M3: `components/home/HeroSection.tsx`, `HeroWaves.tsx`, `components/ui/ButtonLink.tsx`, `MediaFrame.tsx`, `content/hero.ts`; entrance animation utilities in `globals.css` (ANIMATION_SYSTEM)
- F0/F1: `lib/enquiry.ts`, `lib/server/{env,rate-limit}.ts`, `lib/server/enquiries/{format,deliver}.ts`, `app/wholesale/{page,actions}.ts(x)`, `components/forms/EnquiryForm*.tsx`, `content/{products,wholesale}.ts`, deploy guard in `next.config.ts`
- F2: `app/shop/{page,[slug]/page}.tsx`, `components/layout/ShopMenu.tsx`, `components/home/HeroProductCarousel.tsx`, `components/shop/ShopPageHeader.tsx`, `content/{products,shop}.ts` (catalogue kinds/status), `lib/price.ts`, `resolveNavChildren`/`productHref` in `lib/navigation.ts`
- §5: `components/home/ProductRangeSection.tsx`, `components/ui/{OfferCard,Reveal}.tsx` (ProductCard now adapts to OfferCard), `content/home.ts` (`homeProducts`, Distributor Supply as a `ServiceOffer`), reveal CSS in `globals.css`. Below-the-fold sections reuse `Reveal`; post-navigation checks scope to the visible `<main>` (D-089)
- `components/brand/Logo.tsx`: `variant` header/footer; placeholder until `site.logos.*.available`; no link inside (header adds it via `resolveHref("home")` in M2.4). Swap steps: `docs/ASSET_SPECIFICATIONS.md`

**Rules to remember:** never hard-code internal hrefs; use `resolveHref`. `null` renders as non-interactive text with "Coming soon" (no `#`, no hover, no pointer). Update `content/routes.ts` when a page/section ships. The cart count is a prop (shows 0 now). Announcement wording is interim until services are verified. No unverified claims, no invented URLs, logo placeholders only.

**Animation:** new requirement (D-065). Read `docs/ANIMATION_SYSTEM.md` before planning any visible section; its contents are PROPOSED until the owner approves each storyboard.

**Read next:** `docs/PROGRESS.md` → `docs/DECISIONS.md` (D-058–D-063 newest) → `docs/verification/README.md` (V-log) and `docs/verification/m2.7-after/before-after-1440.png`; verification: `docs/DEVELOPMENT_GUIDELINES.md` → "Visual verification". Visual verification method: `docs/DEVELOPMENT_GUIDELINES.md`.

**Git:** `main`, remote `origin`. Commit after each verified task; **never push without the owner's explicit approval.**

**Current §6 files:** `components/home/OriginSection.tsx`, `components/brand/AfricaMap.tsx`, `homeOrigin` in `content/home.ts`, shared MediaFrame/SectionHeading/IconFeature extensions and map-pin/leaf/layers icons. `origin.built=true`; Our Story resolves to `/#origin`. No /our-story page created. Licensed geometry generator at `scripts/generate-africa-map.py`; exact source and coordinate provenance in ASSET_SPECIFICATIONS.

**Verification recovery:** see `docs/verification/home-6-origin-review/RECOVERY_REPORT.md`. Minimal loopback bind passes escalated but Turbopack worker still EPERM. Plain Webpack output was unstyled and rejected. A temporary Webpack hook using the installed Tailwind loader enabled accurate Chrome checks; `next.config.ts`, package files and default scripts are unchanged. Default Turbopack must still be checked in normal Terminal; commands in report.

**Narrow fixes (D-094):** Origin alone uses `Reveal viewportInset={0}` so final-page indicators cannot remain hidden; default inset stays 10. Compact SectionHeading can wrap long words under 200% text. No changes to normal-size geometry, header, hero/carousel/products or enquiry code. Original `0f8618e` retained; fixes/evidence in new commit `627e42e`.

**Evidence:** final seven-width Origin captures 105/105; inspected reference comparison + mobile/tablet/laptop/desktop. Full visual suite 393 pass / 3 fail: global header overflow at 200% root text (V-013) and intended 320px drawer baseline difference. Header/bar normal comparisons 0.00%. Functional journeys **361/361 dev-file, 40/40 resend-mock, 31/31 unconfigured** on the same diagnostic artifact; map checksum/containment passes. Recovery report has details. §6 visual approval pending; §5 remains provisional (V-011). Source/photo/claim evidence still pending; map denotes approximate town only.

**New source:** `components/home/{QualitySection,WholesaleBanner}.tsx`, `components/layout/SiteFooter.tsx`; `content/footer.ts`, homeQuality/homeSupply and qualityIndicators; `lib/{certification,site-date}.ts`; eight certificate gate checks at `scripts/certification-check.mjs`. IconFeature adds compact/circled variants with previous defaults unchanged. Supply heading uses new 26px token. Footer in root layout; quality/wholesale section flags true; policies remain planned text.

**Current constraints:** 13 unverified claims block production. ISO output disabled with no supplied certificate; requires verified claim + enabled complete current certificate. Newsletter input/button disabled, unknown social URLs omitted; contact/help/policy pages not fabricated. Product/logo/origin imagery still placeholders. `QUALITY_SECTION_BRIEFING.md` and `REMAINING_HOMEPAGE_IMPLEMENTATION.md` record scope/decisions.

**Next:** owner visual feedback and missing official assets/evidence, real newsletter/provider/contact/policy content; M8 broader audit. No additional homepage section remains to build. Do not promote baselines, push or deploy unless separately requested. Preserve existing commits and section defaults; do not bypass environment restrictions by weakening security or claims guards.

**Completion results:** lint/tsc/styled Webpack pass; 8 certificate cases pass; guard rejects 13 claims. Full initial browser run 777 pass/4 known failures, final focused 200 pass/2 existing global header failures; new-section own reflow passes. Mock 40/40, unconfigured 31/31. Current captures/reference sheets at `home-7-9-completion`; all visual approval remains pending.

**Latest image task (D-098/D-099):** Five live supplied images are centralized in `content/media.ts` and served from public/images/products, services, origin. Shared catalogue consumers update together; no duplicate hero file. Nine originals in docs/assets/source/storefront, four prepared future/custom files internal only. Reproduce with `node scripts/prepare-storefront-images.mjs`; manifest/README in docs/assets. Preserve unconfirmed catalogue status, logo placeholders, stage config D-097 and claim rules. Origin art is an illustration, not verified site photography. Product grid two columns below 1400px prevents button overflow; wide-desktop reference layout unchanged. Results/screenshots: `docs/verification/storefront-images/REPORT.md`. No push/deployment or baseline promotion.

**Image results:** lint/tsc + styled diagnostic Webpack build pass; all 9 source/output hashes/dimensions/alpha/location checks pass. Initial carousel/no-JS/enquiry run 307/307, final 7-width image/card containment run 283/283. Full screenshots and source-reference comparisons in `docs/verification/storefront-images/`. Existing staging opt-in D-097 preserved; no push/deployment.

Final homepage column-count/containment verification after rem breakpoint correction: **175/175**, all seven widths; 1440 is four columns, 1024–1366 two, mobile one. Final captures refreshed in storefront-images; prior cross-page 283/283 and carousel/enquiry 307/307 results retained separately.

**Latest deployment change (D-100):** Incomplete deployments automatically stage with warnings/noindex when DEPLOY_MODE is unset. `staging` explicitly stages; `production` explicitly enforces strict delivery + evidence checks. Leave unset/staging for current preview. No credentials/evidence statuses or enquiry runtime changed. Six configuration tests pass and diagnostic Webpack production build succeeds with missing settings; local worker restriction means default Turbopack is not claimed verified. Report: `docs/verification/deployment-auto-staging/REPORT.md`. No push/deploy in this task.
