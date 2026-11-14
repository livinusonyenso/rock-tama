# Session Handoff

_Last updated: 2026-11-15_

**Where we are:** M1 and M2.1 are approved. **M2.2 (lucide-react + `Container` + `AnnouncementBar`) briefing presented; awaiting approval to implement.** Briefing proposals awaiting answers: `placement`/`priority` fields on announcements, `h-announcement` token 36→40px as a min-height, header/bar use the `wide` container, `components/icons/Icon.tsx` name→Lucide map. Nothing new is visible on the page yet; `app/page.tsx` is still the create-next-app starter (replaced in M3).

**Code so far:**
- `app/globals.css`: design tokens (source of truth `docs/DESIGN_SYSTEM.md`)
- `app/layout.tsx`: fonts; metadata from `content/site.ts`
- `types/content.ts`: content types
- `content/routes.ts`: route plan + `live`/`planned` status + `homeSections.built` flags
- `content/site.ts`: brand ROCK-TAMA, logo refs (placeholders, `available: false`), interim announcement wording
- `content/navigation.ts`: `mainNav` (Shop dropdown), `headerActions`, "Coming soon" copy
- `lib/navigation.ts`: `resolveHref(key)` → valid href or `null`

**Rules to remember:** never hard-code internal hrefs; use `resolveHref`. `null` renders as non-interactive text with "Coming soon" (no `#`, no hover, no pointer). Update `content/routes.ts` when a page/section ships. The cart count is a prop (shows 0 now). Announcement wording is interim until services are verified. No unverified claims, no invented URLs, logo placeholders only.

**Read next:** `docs/PROGRESS.md` → `docs/DECISIONS.md` (D-026–D-032 are the newest) → `docs/UI_BREAKDOWN.md` §01–02 and `docs/COMPONENT_ARCHITECTURE.md` §2–3, 6 for M2.2.

**Git:** `main`, remote `origin`. Commit after each verified task; **never push without the owner's explicit approval.**

**Do not:** start M2.2 until the owner approves it in chat.
