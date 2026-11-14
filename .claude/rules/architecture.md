# Architecture rules

- Follow the folder layout in `docs/PROJECT_STRUCTURE.md`. A new top-level folder needs approval and a `DECISIONS.md` entry.
- Route files (`app/**/page.tsx`, `layout.tsx`) only compose sections and set metadata. No large markup or data in them.
- Section components live in `components/home/` (homepage) or a route-specific folder later. Shared primitives live in `components/ui/`. `ui/` must never import from `home/` or `layout/`.
- Content and data belong in `content/*.ts` (typed, no JSX). Components receive content via imports or props, never inline copy that already exists in `content/`.
- **Links:** never hard-code internal hrefs. Reference a `RouteKey` and call `resolveHref()` (`lib/navigation.ts`). A `null` result renders as non-interactive text with "Coming soon" accessible text: no `href="#"`, no hover, no pointer cursor (D-026, D-027). When a page or homepage section ships, update `content/routes.ts` in the same commit.
- Content data is serialisable: icons are `IconName` strings, never component references.
- **Server Components by default.** Add `"use client"` only for state, effects, event handlers or browser APIs. Keep client components leaf-level, and pass server-rendered UI as `children` instead of converting parents.
- `cacheComponents` is on: wrap dynamic/non-deterministic work (`cookies()`, `headers()`, `new Date()`, uncached fetches) in `<Suspense>` or a `"use cache"` scope.
- Server-only code (DB, email, secrets) goes in `lib/server/` with `import "server-only"`. Business logic stays out of Server Actions and Route Handlers; they validate and delegate.
- No premature abstraction: no generic factories, no barrels (except `components/icons`), no hooks/utilities until there is a second real use. A component must have a distinct responsibility, real reuse, or a client boundary.
- No state-management library, database, or backend work unless the relevant decision in `docs/DECISIONS.md` is APPROVED.
