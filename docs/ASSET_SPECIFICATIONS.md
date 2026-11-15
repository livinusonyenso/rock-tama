# Asset Specifications

**Owner-supplied storefront artwork is now integrated (2026-11-16, D-098).** Five live optimized WebP assets replace product/service/Origin placeholders; original PNGs and four inactive future/custom derivatives are organized outside public. See `assets/README.md` and `assets/storefront-manifest.json`. Standalone official logo files and verified source-site photography remain pending.

Ref px = measured in the 1086 px-wide reference. Rendered sizes are estimates at a 1440 px viewport.

| # | Slot | Proposed path | Aspect | Ref box (px) | Rendered (desktop) | Source file to supply | Rendering |
|---|---|---|---|---|---|---|---|
| 1 | Hero bottle | `public/images/products/750ml-glass-bottle.webp` (shared) | **2 : 5** | 140 × 365 | ~190 × 480 | Supplied artwork → 463 × 1562 WebP, transparent | `next/image`, `object-contain`, bottom-centred, `priority` (likely LCP), `sizes="(min-width:768px) 240px, 60vw"` |
| 2 | 750 ml glass bottle | `public/images/products/750ml-glass-bottle.webp` | **3 : 10** | 62 × 207 | ~85 × 280 | Supplied artwork → 463 × 1562 WebP, transparent | `object-contain`, bottom-aligned in card |
| 3 | 1.5 L bottle | `public/images/products/1-5l-bottle.webp` | **3 : 8** | 78 × 207 | ~105 × 280 | Supplied artwork → 497 × 1591 WebP, transparent | `object-contain`, bottom-aligned |
| 4 | Carton pack | `public/images/products/carton-packs.webp` | **7 : 4** | 195 × 112 | ~260 × 150 | Supplied artwork → 1271 × 1043 WebP, transparent | `object-contain`, centred |
| 5 | Distributor pallet | `public/images/services/distributor-supply.webp` | **2 : 1** | 233 × 114 | ~310 × 155 | Supplied artwork → 1310 × 1047 WebP, transparent | `object-contain`, centred |
| 6 | Origin landscape | `public/images/origin/origin-landscape.webp` | **3 : 1** desktop / **16 : 9** mobile (proposed) | 465 × 157 | ~620 × 210 | Supplied 1448 × 1086 illustration; actual source-site photography still pending | `object-cover`, focal point set via `object-position` |
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
| Africa outline | Natural Earth (naturalearthdata.com), Admin 0 – Countries, small scale (1:110m) is sufficient at ~200px | Public domain. Natural Earth states its data may be used for any purpose without permission. | Not required; optional "Made with Natural Earth" | Derived and in use; exact dataset, conversion and coordinate provenance below. |

## Pending owner-supplied items

| Item | Status | Rule |
|---|---|---|
| Official logo SVGs (horizontal + stacked light) | Pending | Placeholders only; never redraw (D-020) |
| Product/service/Origin artwork (slots 1–6) | Integrated, owner-supplied D-098 | Official documentary photography still pending; no evidence/availability inferred from artwork |
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

## §6 planning update — 2026-11-16

Natural Earth public-domain terms checked at https://www.naturalearthdata.com/about/terms-of-use/ . D-021 Admin 0 source remains selected; asset not acquired/converted yet. Exact archive/version/checksum, transformation and coordinate citation will be recorded during approved implementation. Pin denotes approximate Nanka town location, not a surveyed spring. Responsive crop proposal and photo replacement details: `ORIGIN_SECTION_BRIEFING.md`.

## Africa map acquired and derived — §6 / 2026-11-16

- Dataset: Natural Earth **v5.1.2**, 1:110m Admin 0 Countries, upstream tagged GeoJSON: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson . Dataset page: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/ . Retrieved 2026-11-16 (client date).
- SHA-256 of downloaded bytes: `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`. Original stored temporarily outside repo, not served at runtime.
- Public domain: https://www.naturalearthdata.com/about/terms-of-use/ . Commercial adaptations permitted; attribution optional. Provenance notice in `components/brand/AfricaMap.tsx`.
- Reproduce: download tagged file, then `python3 scripts/generate-africa-map.py /path/to/ne_110m_admin_0_countries.geojson`. No packages needed. Select 51 features with `CONTINENT=“Africa”`, round shared coordinates to 6 decimals, cancel identical interior edges, stitch boundary graph into **two closed rings** (mainland and Madagascar). No hand tracing or political boundaries.
- Projection: equirectangular with uniform axis scale, `x=longitude+20`, `y=40-latitude`; SVG viewBox `0 0 74 78`, preserved aspect. Derived path rounds to 0.001 viewBox units.
- Approximate town coordinate: GeoNames **2329463**, Nanka, Orumba North, Anambra State; **6.06042°N, 7.08306°E**, as reported by https://mapcarta.com/17004604 (links to https://www.geonames.org/2329463/nanka.html ; direct GeoNames page unavailable to browser tool). Display precision is not a survey-accuracy claim. Retrieved 2026-11-16.
- Independent published locality check: Anzaku et al., *Environmental Effects of Gully Erosion in Nigeria: Case Study of Nanka Community*, 2019, study-area location p.69: 6°03′N, 7°05′E; https://www.iiste.org/Journals/index.php/JEES/article/download/49963/51612 . Approximate town centres differ by ~1.2km, less than 0.01px at this map size. This source is used only for locality, not for product/environmental claims.
- Generator verifies point-in-polygon against Nigeria in the same dataset. Pin tip projects to **(27.08306, 33.93958)**; rendered symbol extends upward from that anchor. Independent locality source places Nanka in Anambra, southeastern Nigeria. Actual spring coordinates remain client input. Browser appearance still unverified.
- Initial landscape placeholder has been replaced under D-098 with the supplied illustration; ratio remains 3:1 at md+, 16:9 below md. It uses cover / 50% 60% focal point and descriptive illustration alt. Actual source-site photography remains unverified.

## §7–§9 asset status — 2026-11-16

Quality uses a CSS sage gradient; no unlicensed droplet bitmap added. ISO seal is absent because certificate/evidence are missing. Footer reuses the approved same-size stacked-light Logo placeholder; official SVG still needed. No guessed social logos/URLs. Existing Lucide UI icons only; no new image licence or dependency. Final screenshots/reference comparisons: `verification/home-7-9-completion/`.

## Current live assets — D-098

Source of truth: `content/media.ts`. Products in `public/images/products/{750ml-glass-bottle,1-5l-bottle,carton-packs}.webp`; service image `public/images/services/distributor-supply.webp`; Origin illustration `public/images/origin/origin-landscape.webp`. Asset table above preserves initial proposed slots; these paths supersede pending/photo-only entries. Hero reuses catalogue images; no duplicate source file. Origin focal point 50% 60%, descriptive illustration alt text. All imagery remains in fixed display boxes; products contain-fit, Origin cover-fit; Next 16 preload only for primary image, other media lazy.

Nine original PNGs preserved at `docs/assets/source/storefront/`, four unconfirmed optimized derivatives at `docs/assets/prepared/unconfirmed/` (not served). Live asset source bytes 10,409,476 → WebP 1,402,246 (86.5% reduction). Preparation command, manifest/checksums and provenance: `docs/assets/README.md`. Labels/art do not verify pack quantities, scientific claims or actual source appearance. Official Logo placeholders remain; catalogue availability unchanged.
