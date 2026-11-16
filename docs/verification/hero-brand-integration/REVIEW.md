# Proposed branding and water hero integration — D-101

Implemented 2026-11-16; **branding and visual approval remain pending**. No baselines promoted, no push or deployment. Existing product carousel, all hero copy, CTAs, selectors and entrance timings retained. Background is static; no GIF, extra reflection effect, video or library. Other pages retain HeroWaves.

## Assets / rendering

Actual delivered PNG filenames: `horizontal.ROCK.TAMA.png` (2172×724, transparent), `stacked.ROCK.TAMA.png` (1254×1254, transparent), `herobackground.png` (1672×941, opaque). Unchanged originals are now in `docs/assets/source/branding/`. Manifest `docs/assets/branding-manifest.json` records SHA256, format, dimensions, alpha and byte counts; `node scripts/prepare-brand-images.mjs` reproduces derivatives with installed Sharp.

Served files: `public/images/brand/rock-tama-horizontal.webp` (960×379, 133,106 bytes), `rock-tama-stacked.webp` (960×464, 202,988 bytes); `public/images/hero/spring-water.webp` (1672×941, 115,836 bytes). Logos retain alpha and use lossless WebP after transparent-canvas trim and proportional resize. Background uses quality85 WebP (93.7% smaller than its 1,837,945-byte PNG); all three derivatives combined are 83.6% smaller before Next responsive delivery. No upscaling or artwork colour filters.

Existing Server Component Logo reads `site.logos.horizontal` / `stacked`. Header 48px tall mobile/compact desktop, 64px wide desktop; eager loading, intrinsic dimensions, sizes/srcset. Footer uses 168/200px target widths, auto height and column constraints, lazy loading, ivory backing with 12px padding. **A light-colour logo variant is required for direct placement on dark green.** The current dark lettering remains accurate and readable on ivory; it is not filtered/recoloured. Supplied artwork is proposed, not final client-approved branding.

HeroSection has one decorative Next/image fill instance, empty alt under aria-hidden, `sizes="100vw"`, supported Next16 preload and cover fit. No CSS image URL or separate mobile duplicate. First carousel product retains its existing preload. Static forest overlay minimum alpha .84; stronger .88 mobile top, .93 desktop left/.86 middle. Focal point65% center below768px, center otherwise. Image never intercepts pointers. No screen-reader text is added for scenery. The existing layout reserves all content boxes; entrance box-stability checks pass. Background is decorative artwork, not evidence of actual Nanka source photography. No claims changed or verified.

## Verification

- Lint and TypeScript: PASS on final source.
- Final default `npm run build`: **blocked by Turbopack CSS worker bind EPERM**, including elevated retry. See `build.log` / `build-escalated.log`. An earlier cached intermediate default build succeeded; that does not validate the final CSS change or resolve the worker restriction.
- Final styled diagnostic Webpack production build: PASS, all14routes. See `build-final.log` / `webpack-build.log`. Temporary webpack pre-loader uses already-installed @tailwindcss/turbopack for globals.css; original next.config.ts restored exactly. No lasting build configuration, permission or dependency changes.
- Final six-width visual run: **170 PASS, 6 expected baseline differences, 0 INCOMPLETE**. All six differences are header pixels against the previously approved placeholder-logo screenshots. These remain failures in raw `report.md`; baselines intentionally unchanged. Image loading, ratios, no overflow, no console errors, decorative semantics, no filtering, entrance timings, hit testing, stable animation layout boxes and reduced motion all pass.
- Contrast: browser assertions at all six widths use computed overlay endpoints and a conservative pure-white source pixel. Worst background approximately #2e4a42; gold #e0ad5f **4.77:1**, off-white #f7f8f5 **9.11:1**, stronger where overlay is darker. Button fill/foreground tokens unchanged.
- Functional regression results are in `../hero-brand-functional/report.md`, including new actual navigation from every carousel product at mobile and desktop, existing Shop Now and Request Wholesale, keyboard/focus/pause/automatic rotation, reduced motion, no-JS and enquiry journeys. Final results: **403/403 dev-file, 40/40 Resend mock, 31/31 unconfigured**. Provider reports: `../hero-brand-resend/report.md`, `../hero-brand-unconfigured/report.md`. No real email sent. Functional screenshot duplicates omitted from the committed evidence; requested hero/header/footer captures retained in sections/.

Early verification caught a constrained footer image box with a fixed height; width-driven auto-height sizing fixed it. Two initial server-side assertions incorrectly returned measurement objects instead of boolean success / inspected unloaded intrinsic sizes; corrected without weakening production checks. Switching bundlers also left stale chunk references in generated output/browser cache; clean generated build and automated browser-profile caches removed those 404s. Final captures have no console/network failures. `initial-report.md` / `intermediate-report.md` retain these earlier results; they are not final acceptance results.

## Visual review / remaining differences

Inspected six-width contact sheet, final desktop/mobile hero, header/footer and 1440 reference comparison. Review `hero-desktop-before-after.png`, `hero-mobile-before-after.png`, `hero-six-widths.png`, `hero-desktop-reference.png` and `sections/` captures. Before images are the pre-task saved storefront image captures, not newly approved baselines. An attempted fresh before run overlapped a build and was rejected for mixed-artifact errors; it is not used as comparison evidence.

| Width | Previous hero height | Updated hero height |
|---|---:|---:|
|320|1098|1098|
|375|968|968|
|768|544|544|
|1024|525|525|
|1280|525|525|
|1440|525|525|

At1440, heading x146, CTA x146, carousel x869, carousel288×484; unchanged from pre-task composition. Current `measurements-*.json` records section, heading, CTA/carousel boxes, crop and computed overlay. Mobile retains text → CTAs → product → selector/product link reading order, with gold selector wrapping at320px. Responsive crop intentionally hides much of the waterfall on narrow screens and stronger shading preserves bottle prominence. No image distortion, clipped copy or horizontal overflow observed at requested widths.

Intentional differences: supplied logo ratio differs from the old placeholder; mobile logo height increased for legibility, footer has an ivory plaque, and forest water artwork replaces homepage SVG waves. Compared with the original mock, existing typography/wrapping, real bottle artwork and functional carousel selectors remain as before this task. These are not claims of pixel identity. §5/§6 visual baselines remain provisional; existing global enlarged-text header issue remains outside this task.

## Reproduction

Use `npm run lint`, `npx tsc --noEmit`, `npm run build` in an unrestricted terminal. Run `npm run verify:visual -- --no-build --section hero,header,footer,brand-assets,hero-animation-initial,hero-reduced-motion --viewport small,mobile,tablet,laptop,large,desktop` and `npm run verify:functional` on that identified build. Where the worker restriction persists, use the styled diagnostic process in `../home-6-origin-review/RECOVERY_REPORT.md`; plain Webpack without the temporary Tailwind pre-loader is unstyled and unsuitable for visual QA. Session diagnostic command was `node /tmp/rocktama-brand-build.cjs`, restoring config in finally; `/tmp` is not a project dependency. No approved baseline update flag was used.

Independent manifest check: PASS all three original hashes, WebP dimensions/format, preserved alpha, no output EXIF and no upscaling. All requested UI changes are complete; client approval and the external default Turbopack build remain outstanding. Unrelated newly supplied product files were left untouched.
