# Five-slide hero — implementation and review (D-102)

Owner-authorised implementation using the attached waterfall mockup. Branding, generated concepts and screenshots remain **pending client/owner visual approval**. No baselines promoted, push or deployment. Navigation, catalogue, header and other homepage section components unchanged.

## Result and learning guide

Five synchronized title/description/CTA/bottle slides: Premium Natural Spring Water (750ml), Everyday Hydration (1.5L), Wedding Water Labels, Memorial Water Labels, Royal & Coronation Events. Persistent ROCK TAMA h1, gold eyebrow and italic brand tagline; one stationary decorative waterfall outside the carousel island. All five bottle images are separate alpha assets, not flattened hero scenes. Reusable HeroCarousel replaces the old three-product-only component; typed slide data, server-rendered image/text/icon slots, standard React state and CSS transitions, no new dependency.

See `../../HERO_CAROUSEL_GUIDE.md` for the small-step code walkthrough: index/previous/direction state, six-second conditional timer and cleanup, decode-before-show/request cancellation,600ms bottle translation/fade, text fade/rise, stable copy grid/frame, focus/hover/visibility pause, reduced motion and touch gestures. Manual selection pauses until Play, which still respects hover/focus. All hidden panels inert/aria-hidden; controls44px with accessible names/pressed dots. No-JS first-slide CTAs remain real links. Desktop two columns; mobile copy→CTAs→bottle→controls without overlap.

Standard CTAs reach `/shop`; secondary wholesale remains `/wholesale`. Custom CTAs reach `/custom-labels?occasion=…`, a real enquiry page sharing existing form validation and delivery. Occasion safely pre-fills editable message; no made-up custom SKU, pricing, availability guarantee, design editor or checkout. No new scientific/certification statements or claim-status changes. Generated concept labels are explicitly provisional.

## Actual assets

The filenames given in the request were not on disk. Inspected supplied bottles were `image.png` (750ml) and `image copy.png` (1.5L), each1122×1402 PNG with true alpha; `image copy 5.png` (wedding),1024×1536 PNG with true alpha. Their location changed from products to hero during inspection; selected originals were archived without altering them. Waterfall was `spring-water.png` (1672×941 opaque PNG), now archived with the selected bottle sources in `docs/assets/source/hero-carousel`.

Memorial/coronation files were absent. After the owner explicitly authorised generation, imagegen produced two separate1122×1402 transparent concept bottles using supplied bottle geometry/style as reference. Both inspected for complete silhouette, real transparency, label wording and lack of personal data/scientific/certification claims. Original generated PNGs archived as memorial-generated.png/coronation-generated.png; generation brief in the learning guide. Final client-approved variants can replace these without carousel code changes. No placeholder remains in the live five slides.

`docs/assets/hero-carousel-manifest.json` records hashes, source/output dimensions, alpha and bytes. `node scripts/prepare-hero-carousel-images.mjs` reproduces the optimized WebPs with installed Sharp (trim transparent padding, proportional resize≤1200px bottle height, sRGB, quality88/alpha100, no upscaling). Served paths in public/images/hero: waterfall-bg.webp, bottle-750ml.webp, bottle-1-5l.webp, wedding.webp, memorial.webp, coronation.webp. Static background uses Next/image fill/cover/preload/sizes100vw; bottles use contain, responsive sources and reserved frames; only first bottle preloaded. Browser checks confirm a single waterfall resource request. No filters/background-position animation/GIF/video or unrequested dependency upgrades.

## Verification evidence

- `npm run lint` and `npx tsc --noEmit`: PASS on final source.
- Default production build: initial font-fetch environment failure; elevated retry reaches known Turbopack CSS-worker port-bind EPERM. Raw logs `turbopack-build.log` / `turbopack-escalated.log`. Not a default-build pass.
- Styled diagnostic Webpack build: PASS,15 pages generated including custom-labels. `diagnostic-build.log` / `webpack-build.log`; temporary pre-loader uses installed @tailwindcss/turbopack and restores next.config.ts exactly. No permanent build configuration or permission/security change.
- Final six-width visual/contrast/entrance/reduced-motion and focused real-touch checks: **104/104 PASS**, `visual-report.md`.
- Full existing and new functional suite: **507/507 PASS**, `functional-report.md`: all five slide states and CTAs at mobile/desktop, previous/next wrap, dot/pressed state, six-second autoplay, hover/focus pause, pause/play, real CDP touch swipe both ways, no-JS/reduced motion and existing shop/enquiry/section/navigation regressions. New custom-label enquiry confirmed in the server-side development store with its Memorial message, not merely a success UI.
- Full-height mobile/desktop snapshots of each slide: **78/78 PASS**, `slide-review-report.md`. Hero and frame geometry unchanged across all five selections; each incoming image decoded and active.
- Email provider regressions: **40/40 Resend mock and31/31 unconfigured PASS**, `resend-report.md` / `unconfigured-report.md`. No real email sent.
- Independent asset check: PASS all six source hashes, WebP format/dimensions/no EXIF and alpha preservation; each of five bottle derivatives is actually non-opaque. No missing live images or browser console errors in final checks.

Initial negative results are retained in `initial-report.md` and `focus-diagnostic.md`. Contrast initially treated primary-button text as if painted on scenery, then looked for a gradient on mobile's solid overlay. Corrected to test actual scenery text (h1/h2/p) against the computed left overlay; button tokens unchanged. Conservative pure-white source pixel tests pass≥4.5:1 at every requested width; text column is bounded within the strong58% desktop shade. Headless Chrome initially had `document.hasFocus()===false`, suppressing expected focus events despite activeElement changing. Foreground focus emulation in the harness now exercises real focus/blur and passes; carousel behaviour was not bypassed. Swipe verification uses CDP touchStart/move/end with pan-y scrolling retained, not synthetic DOM event substitution in the final test.

## Screenshot review

Inspected final desktop first/coronation slides, mobile five-slide contact sheet, and responsive snapshots. Review `five-slides-mobile.png`, `five-slides-desktop.png` and `sections/carousel-slide-{1..5}-{mobile|desktop}.png`. Six-width first-slide captures are `sections/hero-{small|mobile|tablet|laptop|large|desktop}.png`. Existing original-reference comparison remains indicative: the current owner-attached mockup explicitly changes the former background/selector composition. These screenshots are not approved baselines or a claim of pixel identity.

| Viewport | Hero height | Background crop |
|---|---:|---|
|320|1118px|65% center|
|375|1008px|65% center|
|768|612px|center|
|1024|692px|center|
|1280|692px|center|
|1440|692px|center|

Heights intentionally differ from the former three-product hero to accommodate the requested slide title, copy and controls. They remain constant while selecting different slides at the same viewport. Mobile keeps every item in document flow; it is not forced into one screen by shrinking text/buttons. Bottles stay full-height within each responsive frame; the mobile waterfall is more strongly shaded to keep text readable. Generated/provided label concepts and subtle outline/cap differences remain subject to client approval.

## Reproduce

Run `npm run lint`, `npx tsc --noEmit`, `npm run build` in an unrestricted terminal. Identify the successful build, then use `npm run verify:visual -- --no-build --section hero,hero-reduced-motion,hero-animation-initial,carousel-initial,carousel-slide-1,carousel-slide-2,carousel-slide-3,carousel-slide-4,carousel-slide-5,carousel-arrows,carousel-swipe,carousel-focus-pause --viewport small,mobile,tablet,laptop,large,desktop` and `npm run verify:functional`. Diagnostic environment workaround is documented in `../home-6-origin-review/RECOVERY_REPORT.md`; plain Webpack without the temporary existing Tailwind pre-loader is unstyled and is not valid visual evidence. No baseline-approval flag used.
