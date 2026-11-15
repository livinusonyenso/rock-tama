# Supplied storefront image integration — 2026-11-16

**Implemented and checked.** Owner-supplied images now appear in the homepage hero/carousel, four product/service cards, Origin illustration, shop listing, product detail/related cards and wholesale product cards. Existing footer/header Logo placeholders remain because no standalone logo was supplied. No push/deployment or visual baseline promotion.

## Organization / performance

Nine original PNGs preserved unchanged at `docs/assets/source/storefront/`. Five optimized live images are in `public/images/products/`, `public/images/services/`, `public/images/origin/`. Four future/custom assets are optimized under `docs/assets/prepared/unconfirmed/`, not publicly served. No product status, catalogue offering, price or claim verification changed.

`content/media.ts` centralizes live paths/alt/slot ratios and Origin focal point. Every catalogue consumer inherits product media; hero reuses the same 750 ml file rather than duplicating it. `node scripts/prepare-storefront-images.mjs` reproduces all derivatives with the already-installed Sharp processor; manifest at `docs/assets/storefront-manifest.json` records original SHA-256, output dimensions/bytes, alpha and live status.

Five live source PNGs total 10,409,476 bytes; WebP derivatives 1,402,246 bytes (**86.5% reduction**, before responsive Next/image delivery). Preserve transparency, normalize sRGB/orientation, strip served metadata, trim transparent outer canvas and avoid upscaling. Products/pallet use contain, Origin cover at `50% 60%`. Reserved aspect ratios prevent loading-induced layout collapse; only the first hero slide and primary detail image are preloaded through supported Next 16 `preload`. Other images are lazy; sizes/srcset reflect portrait versus landscape slots.

Origin artwork is an illustration, not confirmed documentary photography of Nanka. Printed package quantities and scientific wording in the supplied artwork are not treated as business/lab evidence. Existing claims and staging policy D-097 remain unchanged.

## Verification actually run

| Check | Result |
|---|---|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| Styled diagnostic Webpack production build | PASS, all 14 routes generated; `next.config.ts` restored exactly, including existing staging configuration |
| Independent source/asset validation | PASS: all 9 original hashes, WebP dimensions/bytes, preserved alpha, stripped output EXIF, ≤1600 dimension cap, inactive paths outside public |
| Initial image/carousel/no-JS/product-enquiry browser run | **307 passed / 0 failed / 0 incomplete**, `carousel-enquiry-report.md` |
| Cross-page image/card/navigation run | **283 passed / 0 failed / 0 incomplete**, `cross-page-report.md` |
| Final homepage image/card/column-count run | **175 passed / 0 failed / 0 incomplete**, `visual-report.md` |

Chrome checks at **320, 375, 768, 1024, 1280, 1366, 1440**: all required live assets referenced, all page images loaded after actual scroll/decode, responsive sources and meaningful alt, correct Origin focal point/lazy loading, no unconfirmed artwork in catalogue, no horizontal page overflow or console errors, CTAs fully inside product cards. Shop/primary product/wholesale page captures also checked; carousel initial/manual/carton/reduced-motion/no-JS and product→enquiry→stored record journey passed in the initial run. Cross-page run rechecked image/CTA layout and product/Distributor destinations. Final homepage run additionally verifies exact 1/2/4-column behaviour at all seven widths and 1440 four-column reference, after correcting a mixed-unit Tailwind breakpoint-ordering issue. No unrelated long-running tests were repeated.

Default Turbopack's previously recorded worker-port restriction is not claimed resolved or passed; these builds use the documented temporary existing-loader Webpack diagnostic and restore config afterward. No new dependency or permanent build/security change. Standard/staging guard behaviour was not changed by this image task.

## Verification-discovered fix

At narrow desktop widths, existing four-column media-side cards allowed action buttons to extend past their borders. The homepage grid now stays at two columns below **1400px**, four at wider desktop (the **1440 reference layout is retained**). Accessible action dimensions and italic Distributor Supply preserved. Card-boundary assertions now guard this issue, rather than relying only on page-level overflow. Intermediate page/section heights intentionally grow because the four offers use two rows; no image or button is squeezed/cropped to preserve the former height.

The browser harness was also corrected for real lazy media: initial settle waits visible/eager image decoding, actual scroll steps decode visible images before capture, and unloaded offscreen lazy images are not falsely classified as broken. Actual broken/complete images and browser network errors remain failures; no production image is forced eager to satisfy a screenshot test.

## Review images / remaining differences

- Full homepage: [desktop](home-desktop.png), [mobile](home-mobile.png).
- Existing pages: [shop](shop-desktop.png), [product detail](product-desktop.png), [wholesale](wholesale-desktop.png).
- Original-reference comparisons: [hero](hero-desktop-reference.png), [products](products-desktop-reference.png), [Origin](origin-desktop-reference.png).
- Individual hero/products/Origin captures at all seven widths use small/mobile/tablet/laptop/large/hd/desktop suffixes.

Captures inspected visually. Artwork proportions differ from mock placeholders; full carton/pallet artwork is contained with surrounding space rather than cropped or stretched. Origin covers its reserved 3:1/16:9 frame. Logo placeholders remain. Reference differences and all §5/§6/new screenshots remain **unapproved**; old visual residuals and global header enlarged-text issue are not declared fixed by this task.
