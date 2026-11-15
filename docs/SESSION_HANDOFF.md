# Session Handoff

_Last updated: 2026-11-16 (§6 source implemented, runtime verification incomplete)_

**Where we are:** Homepage focus. Done: announcement, header (Shop menu), mobile drawer (Shop list, baselines re-approved D-086), hero (+ animation + product carousel), §4 trust strip, **§5 Our Products** (D-087–D-089); F2 `/shop` + product pages; `/wholesale` landing + enquiry flow. **§5 functionally accepted; §6 briefing approved (D-092) and source implemented, runtime verification incomplete** (then §7 Quality → §8 Supply banner → §9 Footer). §5 baseline NOT promoted yet (awaiting review); open deviation V-011 (section 48px taller @1440). All claims go through `content/claims.ts` (production deploys blocked while unverified). Status per section: `docs/HOMEPAGE_CHECKLIST.md`.

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

**Verification blocker:** lint/tsc/whitespace, SSR/content/route/photo-branch assertions and map generator checks pass. Production guard rejects nine claims as intended. Normal build fails on Turbopack worker port (EPERM), including escalated retries. Origin harness times out without a production build (0 passed, 1 incomplete); no browser screenshots or end-to-end results. Full functional/regression, zoom, photo-crop and visual review still required. `docs/verification/home-6-origin/implementation-report.md` has commands and details. Finish verification before marking §6 complete or moving to §7.

**Do not:** promote §5 or §6 baselines; implement §7; push or deploy. Distributor Supply remains italic (D-090). V-011 remains open. Both origin claims stay unverified; location marker represents the town, not a spring survey.
