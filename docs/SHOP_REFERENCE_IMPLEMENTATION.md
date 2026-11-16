# Shop reference implementation — 2026-11-16

The owner approved the pictured prices as **draft pricing**, not a live payment integration. `/shop` now follows the supplied product-page composition: thumbnail gallery, large product scene, ivory buying panel, green quality strip, description/specifications and four related offers. Header and other homepage sections retain their existing structure.

## Pricing and behaviour

`content/commerce.ts` is the typed source: 750 ml single ₦650; 12 × 750 ml ₦7,500; carton 12 × 1.5 L ₦14,500. A standalone 1.5 L price has not been supplied and stays “Price on request”. Prices and packaging remain draft pending final quotation. The existing catalogue SKU titles are preserved; the newer bottle is labelled proposed packaging artwork.

`ShopProductExperience` owns size, pack and quantity state. Selecting a pack updates the matching size and gallery together. Quantity must be an integer from 1 to 10,000. `ProductGallery` decodes the selected image before switching; a reserved frame prevents layout shifts. Its native zoom dialog supports Escape, close and focus restoration. No autoplay or added animation library is needed for this shopping interaction.

`useBasket` subscribes to a stable localStorage snapshot with `useSyncExternalStore`. It stores only known variant IDs and quantities, never contact details. Header count, basket and product controls update in the same tab and across tabs. Corrupt entries are discarded, duplicate IDs combined, and unavailable storage reports an error instead of claiming an item was saved. `/cart` supports editing and removal.

“Request order” opens the existing wholesale enquiry flow. Twelve-bottle packs convert to bottle quantities; carton quantities remain cartons. Mixed selections prefill an itemised message and leave incompatible aggregate quantity/units for the customer to confirm. No online payment is collected. Existing enquiry validation/delivery/error handling remains authoritative.

## Assets and reference differences

Reuse `content/shop-gallery.ts`, existing optimized bottle/carton assets, `waterfall-bg.webp`, and the existing origin illustration. The hero-style product scene layers the actual transparent bottle over the waterfall; no flattened replacement or invented pouring/video image. Cap/label thumbnails are crops of supplied artwork. Origin artwork is illustrative, not documentary photography. No additional source files or dependencies.

The reference's reviews, subscriptions, guaranteed delivery, payment/security badges, numerical pH/mineral profile and ISO statements are omitted because their data or integrations are absent. The five quality highlights reuse existing registered staging claims; their evidence status is unchanged and strict production release still requires verification. Distributor Supply remains italic. Approved draft prices do not approve scientific claims or screenshots.

## Verification and review

Lint, TypeScript and pure pricing/pack-conversion checks pass. A styled diagnostic Webpack production build passes; its temporary configuration was restored byte-for-byte. This does not establish that the environment-restricted default Turbopack build passes.

Final browser run: **170 passed, 0 failed, 0 incomplete**, at 320, 375, 768, 1024, 1280 and 1440 px. Covers gallery/zoom/focus, selections, quantity validation, basket persistence/corruption/storage failure, mixed orders, unknown price, actual quotation submission, no-JS fallback and existing product/hero links. Mocked provider regression: **40/40**; unconfigured delivery: **31/31**. See `verification/shop-reference-final/report.md` and the six `shop-reference-*.png` images. Screenshots are provisional and await owner review; §5/§6 baselines remain provisional too.

No push or deployment was performed.
