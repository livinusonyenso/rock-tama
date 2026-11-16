# Storefront image assets

Owner-supplied bundle integrated 2026-11-16. Original delivery: `rock_tama_storefront_assets/` at repository root. All nine PNG originals were moved, unchanged, into `source/storefront/`. Source files are outside `public` and are never downloaded by the website.

## Locations

| Use | Optimized file | Status |
|---|---|---|
| 750 ml bottle / first hero slide | `public/images/products/750ml-glass-bottle.webp` | Live, shared catalogue media |
| 1.5 L bottle / carousel | `public/images/products/1-5l-bottle.webp` | Live, shared catalogue media |
| Carton pack / carousel | `public/images/products/carton-packs.webp` | Live, shared catalogue media |
| Distributor service card | `public/images/services/distributor-supply.webp` | Live service, not a new product |
| Origin illustration | `public/images/origin/origin-landscape.webp` | Live illustration, not verified site photography |
| Sachet, corporate, wedding, traditional marriage artwork | `docs/assets/prepared/unconfirmed/*.webp` | Prepared, **not served or offered** pending catalogue confirmation |
| All original PNGs | `docs/assets/source/storefront/` | Preserved unchanged |

`content/media.ts` is the single typed source of live paths, alt text, slot ratios and Origin crop focal point. Product definitions consume it, so homepage cards, hero carousel, shop listing, related products, product detail and wholesale cards update together. Home content references the distributor and Origin records. No duplicate hero bottle file or copied path per page.

## Preparation

Run `node scripts/prepare-storefront-images.mjs` from the repository (the script resolves all paths relative to itself). Uses the existing installed Sharp image processor; no dependency was installed. Produces WebP with quality 90 / alpha quality 100, strips metadata, normalizes sRGB/orientation, trims transparent outer canvas at threshold 10, and caps dimensions at 1600 without upscaling. It does not regenerate artwork, remove opaque backgrounds, repaint labels or extract/redraw a logo.

`storefront-manifest.json` records source SHA-256, source/output byte sizes, intrinsic dimensions, alpha preservation, output location and live/inactive disposition for each file. Five live PNGs total **10,409,476 bytes**; their WebP derivatives total **1,402,246 bytes** (about **86.5% smaller**) before Next/image responsive delivery. All nine outputs total 2,671,832 bytes versus 19,187,904 source bytes.

Product/service slots use contain-fit to preserve the entire artwork without distortion. Existing slot aspect ratios reserve layout before loading. Origin uses cover-fit, 3:1 desktop and 16:9 mobile, focal point `50% 60%`. Next/image supplies responsive srcset/sizes and lazy loading; only the first hero slide is preloaded on home, and the primary product image is preloaded on its detail page. Sources use supported Next 16 `preload`, not its deprecated `priority` image prop.

## Content rules

Supplying an image does not confirm new product availability. Sachet/custom/event artwork remains outside public and existing unconfirmed products remain unavailable. To activate later, first confirm catalogue/business details, then publish the prepared file and add its typed media reference plus real route availability in the same change.

These are owner-supplied storefront artworks. The Origin illustration is not evidence of the spring's physical appearance or exact location. Printed pack quantities and label claims in artwork do not verify case configuration or scientific statements; existing claim/evidence rules remain in force. No prices, certifications or product statuses were changed. No standalone official header/footer logo was supplied, so existing Logo placeholders remain.

## Proposed branding / decorative hero
Original filenames `horizontal.ROCK.TAMA.png`, `stacked.ROCK.TAMA.png`, `herobackground.png` now live unchanged in `source/branding/`. `branding-manifest.json` and `scripts/prepare-brand-images.mjs` describe reproducible derivatives in public/images/brand and public/images/hero. Branding pending client approval. Logos are not evidence that printed scientific wording is verified; background is decorative artwork, not confirmed Nanka photography.
