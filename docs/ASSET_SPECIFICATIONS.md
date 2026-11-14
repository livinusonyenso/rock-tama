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
| 7 | Africa map | `components/brand/AfricaMap.tsx` (inline SVG) | ~ 14 : 15 | 140 × 150 | ~185 × 200 | Accurate outline from a **licensed/public-domain** source (e.g. Natural Earth-derived). Pin placed at Anambra State. | Inline SVG, `aria-hidden`, fill `sand-300` |
| 8 | Logo (header) | `public/brand/rock-tama-logo.svg` | as supplied | ≈ 240 × 50 | ~320 × 66 | **SVG from the brand owner** | `next/image` or inline SVG |
| 9 | Logo (footer, on dark) | `public/brand/rock-tama-logo-stacked-light.svg` | as supplied | ≈ 130 × 75 | ~170 × 100 | **SVG, light/gold variant** | as above |
| 10 | ISO 22000 badge | inline SVG in `QualitySection` | 1 : 1 | ≈ 70 × 70 | ~90 × 90 | Only with a valid certificate. **Never the official ISO logo.** | Conditional render |
| 11 | Quality texture | CSS gradients first; optional `public/images/textures/water-droplets.webp` | tile/cover | full section | full section | Optional, < 40 KB | `background-image`, decorative |
| 12 | Hero waves | inline SVG in `HeroWaves` | stretches | full width | full width | none (drawn in code) | `preserveAspectRatio="none"`, `aria-hidden` |
| 13 | Favicon / app icon | `app/icon.png` or `app/icon.svg` (replaces starter `favicon.ico`) | 1 : 1 | — | — | From the logo mark | Next file convention |
| 14 | Open Graph image | `app/opengraph-image.png` | 1200 × 630 | — | — | Later (M8) | Next file convention |

## Placeholder rules [PROPOSED]

- The same `MediaFrame` box renders both the placeholder and the final image. Swapping in a real asset changes only `src`, never layout.
- The placeholder shows an image icon plus a text label matching the reference (e.g. "Hero Product Image"), in `placeholder` / `placeholder-ink` colours.
- Bottle slots: the reference draws bottle-shaped silhouettes. Proposed: reproduce the silhouette with a CSS `mask`/SVG clip only if the simple rounded rectangle looks wrong in review (decision pending; it's cosmetic and temporary).
- Placeholders are `role="img"` with `aria-label="Image coming soon: …"`, or `aria-hidden` when purely decorative.
- Format for finals: WebP or AVIF exported from originals. `next/image` handles responsive sizes. Keep originals out of `public/`.

## Starter assets to remove (after approval)

`public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are create-next-app samples, unused by the design.
