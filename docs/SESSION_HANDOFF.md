# Session Handoff

_Last updated: 2026-11-15 (after M2.7)_

**Where we are:** M1–M2.6 and M2.V accepted. **M2.7 (header visual refinement) implemented, verified, committed; awaiting the owner's visual approval.** Do NOT promote baselines until the owner approves; then run `npm run verify:visual -- --approve --section announcement,header,mobile-nav-open` and delete the superseded provisional refs. Known residuals: V-006 (letter-width offsets), V-007 (truck 4px small); V-008 resolved by the fluid inset (D-064). The page below the header is still the create-next-app starter.

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
- `components/brand/Logo.tsx`: `variant` header/footer; placeholder until `site.logos.*.available`; no link inside (header adds it via `resolveHref("home")` in M2.4). Swap steps: `docs/ASSET_SPECIFICATIONS.md`

**Rules to remember:** never hard-code internal hrefs; use `resolveHref`. `null` renders as non-interactive text with "Coming soon" (no `#`, no hover, no pointer). Update `content/routes.ts` when a page/section ships. The cart count is a prop (shows 0 now). Announcement wording is interim until services are verified. No unverified claims, no invented URLs, logo placeholders only.

**Read next:** `docs/PROGRESS.md` → `docs/DECISIONS.md` (D-058–D-063 newest) → `docs/verification/README.md` (V-log) and `docs/verification/m2.7-after/before-after-1440.png`; verification: `docs/DEVELOPMENT_GUIDELINES.md` → "Visual verification". Visual verification method: `docs/DEVELOPMENT_GUIDELINES.md`.

**Git:** `main`, remote `origin`. Commit after each verified task; **never push without the owner's explicit approval.**

**Do not:** promote baselines or start M3 until the owner approves. Do not fix V-001–V-005 before M2.7.
