# Session Handoff

_Last updated: 2026-11-15 (after F1)_

**Where we are:** Real e-commerce direction (D-066). M3.1–M3.3 hero done. **F0 + F1 done: `/wholesale` works end to end** (validation, spam protection, delivery via dev file locally / Resend in production, honest errors, no-JS support); Request Wholesale + nav/drawer Wholesale are live. **Next: F2** (`/shop`, product pages, ShopMenu + mobile Shop list replacing the build guard, Hero Product Carousel per D-073) → Shop Now live → M3 complete. M2.7 baselines NOT promoted (awaiting final approval of the V-008 fix). Production needs Resend env vars (`.env.example`).

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
- `components/brand/Logo.tsx`: `variant` header/footer; placeholder until `site.logos.*.available`; no link inside (header adds it via `resolveHref("home")` in M2.4). Swap steps: `docs/ASSET_SPECIFICATIONS.md`

**Rules to remember:** never hard-code internal hrefs; use `resolveHref`. `null` renders as non-interactive text with "Coming soon" (no `#`, no hover, no pointer). Update `content/routes.ts` when a page/section ships. The cart count is a prop (shows 0 now). Announcement wording is interim until services are verified. No unverified claims, no invented URLs, logo placeholders only.

**Animation:** new requirement (D-065). Read `docs/ANIMATION_SYSTEM.md` before planning any visible section; its contents are PROPOSED until the owner approves each storyboard.

**Read next:** `docs/PROGRESS.md` → `docs/DECISIONS.md` (D-058–D-063 newest) → `docs/verification/README.md` (V-log) and `docs/verification/m2.7-after/before-after-1440.png`; verification: `docs/DEVELOPMENT_GUIDELINES.md` → "Visual verification". Visual verification method: `docs/DEVELOPMENT_GUIDELINES.md`.

**Git:** `main`, remote `origin`. Commit after each verified task; **never push without the owner's explicit approval.**

**Do not:** promote baselines until the owner approves the final M2.7 screenshots (incl. V-008). Do not implement M3 until the owner approves its briefing. Do not fix V-001–V-005 before M2.7.
