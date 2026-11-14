# Session Handoff

_Last updated: 2026-11-15 (after M2.2)_

**Where we are:** M1, M2.1 approved. **M2.2 (Announcement Bar) complete, verified in headless Chrome, committed; stopped for owner approval before M2.3 (Logo placeholder).** The page below the bar is still the create-next-app starter (replaced in M3).

**Code so far:**
- `app/globals.css`: design tokens (source of truth `docs/DESIGN_SYSTEM.md`)
- `app/layout.tsx`: fonts; metadata from `content/site.ts`
- `types/content.ts`: content types
- `content/routes.ts`: route plan + `live`/`planned` status + `homeSections.built` flags
- `content/site.ts`: brand ROCK-TAMA, logo refs (placeholders, `available: false`), interim announcement wording
- `content/navigation.ts`: `mainNav` (Shop dropdown), `headerActions`, "Coming soon" copy
- `lib/navigation.ts`: `resolveHref(key)` → valid href or `null`
- `components/ui/Container.tsx` (`content` 1200 / `wide` 1320), `components/icons/Icon.tsx` (IconName → lucide-react 1.73.0), `components/layout/AnnouncementBar.tsx` (Server; priority-based visibility; wraps only under enlarged text)

**Rules to remember:** never hard-code internal hrefs; use `resolveHref`. `null` renders as non-interactive text with "Coming soon" (no `#`, no hover, no pointer). Update `content/routes.ts` when a page/section ships. The cart count is a prop (shows 0 now). Announcement wording is interim until services are verified. No unverified claims, no invented URLs, logo placeholders only.

**Read next:** `docs/PROGRESS.md` → `docs/DECISIONS.md` (D-033–D-036 newest; D-036 awaits owner review) → `docs/ASSET_SPECIFICATIONS.md` (logo slots 8–9) and `docs/UI_BREAKDOWN.md` §02 for M2.3. Visual verification method: `docs/DEVELOPMENT_GUIDELINES.md`.

**Git:** `main`, remote `origin`. Commit after each verified task; **never push without the owner's explicit approval.**

**Do not:** start M2.3 until the owner approves it in chat.
