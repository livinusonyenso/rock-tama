# Development Guidelines

The terse, enforceable versions of these rules live in `.claude/rules/`. This file explains them for humans.

## Workflow

**Analyse → Document → Explain → Approve → Implement → Verify → Record → Next task.**

One logical task at a time. No task starts without explicit owner approval. Each task ends with a stop for review. The detailed procedure is the `/rock-tama-section-workflow` skill.

## Task briefing format (required before every approved task)

1. **What are we building?** Component/feature and its scope boundary.
2. **Why this way?** Engineering reasoning and the alternatives rejected.
3. **Where will it live?** Exact file paths, new vs. modified.
4. **Concepts to understand.** React/Next.js/TS/CSS concepts at a professional level (no React-101).
5. **What could go wrong?** Likely mistakes and pitfalls.
6. **How will we verify it?** The exact commands and checks.
7. **Next step.** The next dependency, named but **not** started.

## Strict rules

1. Never generate the whole site in one operation.
2. No UI implementation without approval.
3. No redesign of the reference without permission.
4. No new dependency without explaining its purpose (and getting approval).
5. No state-management library unless a demonstrated need exists.
6. No Client Component where a Server Component suffices.
7. No component for trivial markup without justification.
8. No hard-coded design values repeated across files; use tokens.
9. No invented photos, prices, certifications or business information.
10. No silent changes to approved decisions; record changes in `DECISIONS.md`.
11. No replacing working code without inspecting it.
12. No moving to the next section before approval.
13. No claiming checks passed unless they were actually run and passed.
14. Docs must stay consistent with code.
15. Explain structure before writing large files.

## Definition of Done (per task)

- [ ] Scope matches the approved briefing, nothing more.
- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes (from M3 onward, or whenever routes/config change).
- [ ] Visual check against `docs/reference/homepage-reference.png` at desktop (≥1280), plus tablet (768) and mobile (375) behaviour as documented.
- [ ] Keyboard and accessibility basics: focus visible, logical tab order, landmarks/headings, alt text or `aria-hidden`.
- [ ] `PROGRESS.md`, `SESSION_HANDOFF.md`, and (if relevant) `DECISIONS.md` updated.
- [ ] Results reported honestly, including anything not verified.
- [ ] Committed (code + docs) with a meaningful conventional message; not pushed unless requested.

## Visual verification method (used since M2.2)

No extra dependencies. Build, then run `npx next start -p 3100`, which avoids the owner's dev server on 3000. Launch the installed Google Chrome headless with `--remote-debugging-port`, and drive it over the DevTools Protocol from a Node script (Node 26 has a global `WebSocket`):
- set the viewport (375 / 768 / 1024 / 1280 / 1440, plus 1086 = the reference width);
- measure with `Runtime.evaluate` (visibility, heights, line count, `scrollWidth` overflow, computed colours/fonts, focusable elements);
- read the accessibility tree with `Accessibility.getFullAXTree`;
- capture `Page.captureScreenshot`;
- double the root font size for the 200% text check;
- compare against the reference crop scaled to 1440 using `sharp`.

Store comparison images in `docs/verification/`. Stop the server and Chrome afterwards.

## Known gotchas for this stack

- **Cache Components is enabled.** `new Date()`, `Math.random()`, `cookies()`, `headers()` and uncached data in a Server Component will error at build/prerender unless wrapped in `<Suspense>` or a `"use cache"` scope. Example: the footer copyright year. Use `"use cache"` in a small `CurrentYear` helper, or compute it in a cached function. Check the bundled Next 16 docs.
- **Tailwind v4** has no `tailwind.config.js` by default. Tokens live in `@theme` in `globals.css`. Arbitrary values (`text-[13px]`) are a smell when a token should exist.
- **`next/image`** needs `width`/`height` or `fill` + a sized parent. `MediaFrame` owns the sized parent (aspect-ratio box) to prevent layout shift.
- **`next/link`** for internal navigation; never use `<a href>` for internal routes.
- **Client boundary:** `"use client"` makes everything imported by that file client-side. Keep client files leaf-level and pass server-rendered content as `children`.
- **Fonts:** load via `next/font` once in `layout.tsx`, exposing CSS variables that `@theme` maps to `font-serif` / `font-sans`.
