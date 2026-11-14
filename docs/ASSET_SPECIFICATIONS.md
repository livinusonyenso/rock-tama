# Asset Specifications

**No final photography or logo files exist yet [CONFIRMED].** Until they do, each slot renders a labelled placeholder of the **same box size** via `MediaFrame` [PROPOSED]. Do not use stock photos or generated "brand" imagery.

Ref px = measured in the 1086 px-wide reference. Rendered sizes are estimates at a 1440 px viewport.

| # | Slot | Proposed path | Aspect | Ref box (px) | Rendered (desktop) | Source file to supply | Rendering |
|---|---|---|---|---|---|---|---|
| 1 | Hero bottle | `public/images/products/hero-bottle.webp` | **2 : 5** | 140 × 365 | ~190 × 480 | ≥ 800 × 2000, transparent background (cut-out) | `next/image`, `object-contain`, bottom-centred, `priority` (likely LCP), `sizes="(min-width:768px) 240px, 60vw"` |
| 2 | 750 ml glass bottle | `public/images/products/750ml-glass-bottle.webp` | **3 : 10** | 62 × 207 | ~85 × 280 | ≥ 600 × 2000, transparent | `object-contain`, bottom-aligned in card |
| 3 | 1.5 L bottle | `public/images/products/1-5l-bottle.webp` | **3 : 8** | 78 × 207 | ~105 × 280 | ≥ 750 × 2000, transparent | `object-contain`, bottom-aligned |
| 4 | Carton pack | `public/images/products/carton-pack.webp` | **7 : 4** | 195 × 112 | ~260 × 150 | ≥ 1400 × 800, transparent | `object-contain`, centred |
| 5 | Distributor pallet | `public/images/products/distributor-pallet.webp` | **2 : 1** | 233 × 114 | ~310 × 155 | ≥ 1600 × 800, transparent | `object-contain`, centred |
| 6 | Origin landscape | `public/images/origin/nanka-source.webp` | **3 : 1** desktop / **16 : 9** mobile (proposed) | 465 × 157 | ~620 × 210 | ≥ 2400 × 1350 photo (so both crops work) | `object-cover`, focal point set via `object-position` |
| 7 | Africa map | `components/brand/AfricaMap.tsx` (inline SVG) | ~ 14 : 15 | 140 × 150 | ~185 × 200 | **Natural Earth** outline (see "Licensed sources" below). Pin placed at Anambra State. | Inline SVG, `aria-hidden`, fill `sand-300` |
| 8 | Logo (header, horizontal) | `public/brand/rock-tama-logo-horizontal.svg` | **4.76 : 1** (measured) | 238 × 50 | 304 × 64 (`h-16`); 190 × 40 mobile | **Official SVG from the owner (pending)**. Until then a placeholder box of the same size labelled "ROCK-TAMA logo" (D-020). Never redrawn. | `next/image` with fixed width/height |
| 9 | Logo (footer, stacked, on dark) | `public/brand/rock-tama-logo-stacked-light.svg` | **1.78 : 1** (measured) | 128 × 72 | 170 × 96 (`h-24`); 142 × 80 mobile | **Official SVG, light/gold variant (pending)**. Placeholder of the same size until supplied. | as above |
| 10 | ISO 22000 badge | inline SVG in `QualitySection` | 1 : 1 | ≈ 70 × 70 | ~90 × 90 | Only with a valid certificate. **Never the official ISO logo.** | Conditional render |
| 11 | Quality texture | CSS gradients first; optional `public/images/textures/water-droplets.webp` | tile/cover | full section | full section | Optional, < 40 KB | `background-image`, decorative |
| 12 | Hero waves | inline SVG in `HeroWaves` | stretches | full width | full width | none (drawn in code) | `preserveAspectRatio="none"`, `aria-hidden` |
| 13 | Favicon / app icon | `app/icon.png` or `app/icon.svg` (replaces starter `favicon.ico`) | 1 : 1 | — | — | From the logo mark | Next file convention |
| 14 | Open Graph image | `app/opengraph-image.png` | 1200 × 630 | — | — | Later (M8) | Next file convention |

## Logo: how to swap in the official files (D-020, D-037, D-038)

The `Logo` component (`components/brand/Logo.tsx`) is implemented. Until the files exist it renders a dashed, labelled placeholder ("ROCK-TAMA LOGO") with the exact aspect ratio, announced to screen readers as an image named "ROCK-TAMA". To replace it:

1. Save the official files exactly at `public/brand/rock-tama-logo-horizontal.svg` (header, for ivory backgrounds) and `public/brand/rock-tama-logo-stacked-light.svg` (footer, light colourway for dark green).
2. In `content/site.ts` → `logos`, set `available: true` and set `width`/`height` to each SVG's real dimensions (from its `viewBox`).
3. Run lint/tsc/build and the visual check. No component changes are needed; rendered height is fixed per variant (header 40→64px, footer 80→96px) and width follows the ratio.

Verified (M2.3) with temporary dummy SVGs: the real-image path renders at exactly the same box size as the placeholder.

## Licensed sources [APPROVED D-021]

| Asset | Source | Licence | Attribution | Status |
|---|---|---|---|---|
| Filled globe icon (announcement bar) | Heroicons v2.2.0, `24/solid/globe-alt.svg` (github.com/tailwindlabs/heroicons) | MIT, © Tailwind Labs, Inc. | Full MIT notice in `components/icons/GlobeFilled.tsx` header | **In use since M2.7** (D-061); path copied unmodified |
| Africa outline | Natural Earth (naturalearthdata.com), Admin 0 – Countries, small scale (1:110m) is sufficient at ~200px | Public domain. Natural Earth states its data may be used for any purpose without permission. | Not required; optional "Made with Natural Earth" | To be downloaded and converted to an SVG path in M6. Record the exact dataset version and download date here when done. |

## Pending owner-supplied items

| Item | Status | Rule |
|---|---|---|
| Official logo SVGs (horizontal + stacked light) | Pending | Placeholders only; never redraw (D-020) |
| Product photography (slots 1–6) | Pending | Placeholders only; no stock/generated images |
| Social URLs (Instagram, Facebook, LinkedIn, YouTube) | Pending | Icons rendered as links only once real URLs exist (D-023) |
| ISO 22000 certificate | Pending | Badge hidden; space may be reserved (D-013) |
| NAFDAC registration A1-2462L documents | Pending verification | Not published until verified (D-022) |
| Lab reports (TDS, heavy metals, pathogens) | Pending | Claims not published until evidenced (D-013) |

## Placeholder rules [PROPOSED]

- The same `MediaFrame` box renders both the placeholder and the final image. Swapping in a real asset changes only `src`, never layout.
- The placeholder shows an image icon plus a text label matching the reference (e.g. "Hero Product Image"), in `placeholder` / `placeholder-ink` colours.
- Bottle slots: the reference draws bottle-shaped silhouettes. Proposed: reproduce the silhouette with a CSS `mask`/SVG clip only if the simple rounded rectangle looks wrong in review (decision pending; it's cosmetic and temporary).
- Placeholders are `role="img"` with `aria-label="Image coming soon: …"`, or `aria-hidden` when purely decorative.
- Format for finals: WebP or AVIF exported from originals. `next/image` handles responsive sizes. Keep originals out of `public/`.

## Starter assets to remove (after approval)

`public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are create-next-app samples, unused by the design.
