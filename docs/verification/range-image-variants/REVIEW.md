# ROCK TAMA Range — image variants (D-107)

Four homepage-only image galleries implemented, preserving existing titles, descriptions, CTA destinations and media frame sizing. Two variants each for750ml and1.5L; eight carton/open-pack designs; four distributor/pallet views. Only images slide/fade (450ms,4second autoplay). Fixed copy/buttons do not animate or reflow.

Owner explicitly chose to include the newer750ml bottle as a **proposed packaging concept** despite the existing Glass Bottle title. Fixed note “Alternative bottle: proposed packaging” and descriptive alt keep that distinction visible; no material/availability/title/SKU changes inferred.

## Sources and architecture

Actual source inspection initially found two opaque1448×1086 PNGs: image.png closed carton and image copy.png studio pallet. The owner then added six transparent carton views (copy2–7), two warehouse views (copy8–9) and replaced image copy.png with a square warehouse pallet while work was active. Current10sources are archived unchanged under docs/assets/source/range-variants; original studio pallet remains pallet-studio-original.png. Ten optimized role-named WebPs under public/images/products; fresh warehouse filenames prevent stale optimizer responses. Existing bottle sources reused rather than duplicated. Exact hashes/dimensions/alpha/bytes: docs/assets/range-variants-manifest.json. Regenerate using node scripts/prepare-range-variants.mjs (existing Sharp, no dependency added). Metadata stripped, proportions/real alpha preserved, fit within1200px, no opaque background removal or invented imagery.

content/media.ts holds variant arrays and the fixed750ml concept note. Optional mediaVariants/mediaNotice pass through shared ProductCard/OfferCard only on ProductRangeSection. Other catalogue, PDP and wholesale cards retain static defaults. MediaFrame server-renders each responsive contain image; new MediaCarousel is the only client island. It decodes incoming images before exposing them, pauses for hover/focus/hidden tab/offscreen/reduced motion, supports horizontal touch while preserving vertical scrolling, and cleans up interval, listener, observer and pending async selection work. Keyboard-only44px previous/next/pause controls overlay without taking layout space; no-JS keeps original first image and live CTA. Original Reveal behaviour unchanged.

Artwork is provisional, not proof of stock, packaging configurations, scientific claims or branding approval. Existing science claims are referenced with MediaAsset.claims/data-claims on supplied art; printed12×1.5L and24×750ml configurations registered unverified. Claim register now15unverified entries; statuses/prices/catalogue quantities unchanged. No added certification or verified-product assertions.

## Verification

- Lint/TypeScript PASS; six deployment-mode cases PASS with expanded claim register.
- Styled diagnostic Webpack production build PASS; temporary Tailwind pre-loader uses installed dependency and restores next.config.ts exactly. Default Turbopack worker restriction remains as previously recorded; no default-build pass or permanent bundler change claimed.
- Six-width final layout/artwork-provenance and alternate-view run **80/80 PASS**, visual-report.md, at320/375/768/1024/1280/1440. No card/title/button overflow;1/2/4-column layout preserved; media contain fit and full image bounds retained.
- Main final-batch functional/layout run **208 passing checks**, functional-report.md, including all16images decoded, invariant card/title/action geometry and copy, individual gallery changes, autoplay, offscreen pause, real browser touch swipe, reduced motion, no-JS, keyboard controls/4CTA order, supplied-image regression and existing card links. Its6failed assertions are the same artwork-provenance test at each width: the predicate selected the first count-bearing carton rather than the later claim-bearing carton. Corrected to search all claim-bearing views; all6now pass in the80/80 run. No production claim metadata was weakened. Raw intermediate result retained.
- Focused regression **69/69 PASS**, regression-report.md: corrected reduced-motion/already-visible Reveal handling, true offscreen scroll,16keyboard stops, static shop/product/wholesale layouts. Earlier tests incorrectly assumed every Reveal always has data-reveal or that scrolling to the hero heading removes all product frames from view; helpers corrected without changing working Reveal. Initial negative report retained.
- Independent asset validation:10original hashes, optimized WebP dimensions, alpha/non-opacity where supplied, no EXIF and1200px cap PASS.

Final visibility safeguard enforces intersectionRatio≥.25 before autoplay; final build smoke **13/13 PASS**, final-smoke-report.md, covers visible autoplay, true offscreen pause and all16image variants.

## Visual review

Inspected1440px default and all-alternate screenshots. Section remains496px tall at1440 (reference approximation448px remains a previously recorded difference); accessible buttons retained. Original frames contain the complete products; square warehouse art is letterboxed rather than cropped/distorted. Distributor Supply stays italic. Mobile stacks the original cards and preserves natural reading order. New750ml disclosure is fixed across image changes.

Review sections/range-media-desktop.png and sections/range-media-all-alternates-desktop.png (also mobile equivalents). Provisional screenshots only; §5 visual approval still pending, no baseline promotion. No push or deployment.
