---
paths:
  - "app/**/*.{ts,tsx,css}"
  - "components/**/*.{ts,tsx}"
  - "content/**/*.ts"
  - "types/**/*.ts"
---

# Frontend rules

## Design-system consistency
- Colours, fonts, radii and shadows come from the `@theme` tokens in `app/globals.css` (source: `docs/DESIGN_SYSTEM.md`). Do not repeat hex values or arbitrary values (`text-[13px]`) across files; add a token instead.
- Match `docs/reference/homepage-reference.png`. Any intentional deviation must be stated and approved.

## TypeScript
- Strict mode; no `any`, no non-null `!` without a comment explaining why.
- Named exports for components; explicit props types (`type HeroSectionProps = {...}`). Shared content types live in `types/`.
- Use `import type` for type-only imports.

## Accessibility
- One `<h1>` per page; headings in order; landmarks (`header`, `nav` with `aria-label`, `main`, `footer`).
- Internal links use `next/link`; actions use `<button>`. Never a `div` with `onClick`.
- Icon-only controls need accessible names; decorative SVGs get `aria-hidden="true"`.
- Visible focus styles on every interactive element; menus support Escape and return focus.
- Text contrast meets WCAG AA. Use `gold-700` for small gold text on light backgrounds.

## Responsive
- Mobile-first Tailwind classes; the reference desktop layout applies from `lg`. Check 375, 768, 1024 and 1280 px. No horizontal scroll at 375 px.

## Styling
- Tailwind utilities in JSX; avoid custom CSS except tokens, keyframes and complex decorative backgrounds.
- Keep variant logic in a small map object (e.g. `const variants = {...}`), not nested ternaries.

## Images
- Every image goes through `MediaFrame` with the aspect ratio from `docs/ASSET_SPECIFICATIONS.md`. Placeholders keep the same box. Use `next/image` with accurate `sizes`. Only the hero bottle gets `priority`.
- Never add stock or generated imagery as brand content.

## Performance
- Minimise client JS: no client component for static content. Fonts only via `next/font`. Decorative shapes as inline SVG/CSS, not images.
