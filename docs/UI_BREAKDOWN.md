# UI Breakdown — Homepage Reference

Source: [`reference/homepage-reference.png`](reference/homepage-reference.png) — **1086 × 1448 px**, desktop only.

- All measurements are **[OBSERVED]** in reference pixels ("ref px"). The design was probably intended for a wider viewport; multiply by ≈ **1.33** to estimate values at a 1440 px viewport. Treat every number as an estimate, not a spec.
- Tablet and mobile behaviour is **not** in the reference. Everything about smaller screens below is **[PROPOSED]**.
- Colours are sampled values; see [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).

## Page map (top to bottom)

| # | Section | y-range (ref px) | Height (ref) | Background |
|---|---|---|---|---|
| 01 | Announcement bar | 0–32 | 32 | Deep forest green |
| 02 | Header + navigation | 32–96 | 64 | Ivory |
| 03 | Hero | 96–492 | 396 | Forest-green gradient + waves |
| 04 | Purity / trust strip | 492–580 | 88 | Forest green |
| 05 | Our Products | 580–918 | 338 | Ivory |
| 06 | Our Origin | 918–1105 | 187 | Ivory |
| 07 | Quality & Safety | 1105–1205 | 100 | Light sage, droplet texture |
| 08 | Business supply banner | 1207–1280 | 73 | Forest-green rounded card on sage |
| 09 | Footer | 1288–1448 | 160 | Forest green, darker bottom bar |

---

## 01 — Announcement Bar

**[OBSERVED]**
- Full-width strip, background `#073021` (sampled). Height ≈ 32 ref px.
- **Left group:** delivery-truck outline icon (light/gold tone, ~16 px), "Nationwide Delivery", a thin vertical `|` divider, then "Wholesale & Bulk Supply for Hotels, Offices, Retailers & Export".
- **Right group:** thin vertical `|` divider, globe outline icon, "International Enquiries Welcome".
- Text: cream/white sans-serif, regular weight, ≈ 12 ref px. Single line, vertically centred.
- Left edge aligns with the header logo, right edge with the header icons, so it uses the same content container.

**Reference copy (preserved verbatim; claims pending business verification, D-030):**

| Message | Reference wording | Interim published wording (`content/site.ts`) | Verification needed |
|---|---|---|---|
| Delivery | "Nationwide Delivery" | "Ask About Delivery to Your Area" | Confirm delivery coverage |
| Wholesale | "Wholesale & Bulk Supply for Hotels, Offices, Retailers & Export" | "Wholesale & Bulk Supply Enquiries for Hotels, Offices & Retailers" | Confirm wholesale fulfilment and export operations |
| International | "International Enquiries Welcome" | unchanged (already enquiry-oriented) | — |

When the business confirms a service, update the wording in `content/site.ts` and this table together.

**[VERIFIED] Implemented M2.2 (2026-11-15):** `<aside aria-label="Store information">` › `<ul>` of 3 items. Under 640px: delivery only, centred. 640–1279px: delivery left, international right. 1280px and up: the reference layout with all three. One line at normal text sizes; wraps (never truncates) under enlarged text. Evidence: `docs/verification/m2.2-*.png`.

Known deviations from the reference: the globe icon is outline (Lucide), not filled. The right group sits ~60px further from the edge at 1440px because the container is symmetric, while the mock's right margin is narrower than its left. The reference typeface for this bar looks slightly wider/heavier than Source Sans 3.

**[PROPOSED]**
- Component: `AnnouncementBar` (Server Component). It is a single-instance layout part, not "reusable" across sections, but it earns its own file as a distinct layout responsibility rendered from the root layout. Messages come from `content/site.ts`, not hard-coded JSX.
- Semantics: `<div role="region" aria-label="Store announcements">` containing a `<ul>` of messages. Icons are `aria-hidden`. Dividers are CSS borders, not text characters, so screen readers don't announce "|".
- Tablet: hide the long wholesale message below `lg`, keep delivery + international.
- Mobile: one centred line, "Nationwide Delivery · International Enquiries Welcome", or delivery only. No auto-rotating ticker (it would need a Client Component and hurts accessibility).

## 02 — Main Header and Navigation

**[OBSERVED]**
- Ivory background (`#F9F4ED`), hairline bottom border (`#DEE6E1`). Height ≈ 64 ref px.
- **Logo (left):** gold/bronze mountain-peak mark with a small star/sun arc above. Wordmark **"ROCK-TAMA"** (hyphenated) in a dark-green serif, with **"NATURAL SPRING WATER"** in small, widely tracked caps beneath.
- **Primary nav (centre-right):** HOME · SHOP ⌄ · WHOLESALE · OUR STORY · QUALITY · CONTACT. Uppercase sans-serif, ≈ 12 ref px, medium weight, dark ink, ≈ 35–45 ref px gaps.
- **Active link:** HOME has a gold underline (~2 px) beneath the label.
- **Shop dropdown indicator:** small chevron-down after "SHOP".
- **Separator:** one thin vertical gold divider between the nav and the icon group. There are no separators between nav items.
- **Icon group (right):** search (magnifier), account (person), cart. Outline icons ≈ 20 ref px, dark ink.
- **Cart badge:** gold circle at the cart's top-right with "0" in white.

**[PROPOSED] Server vs Client**

| Element | Boundary | Why |
|---|---|---|
| Header shell, logo, link list, icons as links | Server | Static markup, no state. |
| Active-link indicator (`aria-current="page"`) | Client (`NavLink`, tiny) | Needs `usePathname()`. Only the link is a client island, not the whole nav. |
| Shop dropdown | Client (`ShopMenu`), **deferred to M2.5b (M5)** | Disclosure pattern; only rendered once a Shop destination is available (D-048, D-050). Today SHOP is pending text with its arrow. |
| Mobile menu drawer | Client (`MobileNav`) | Toggle state, focus management, scroll lock. |
| Search | **Decision pending:** a plain link to `/search` (Server) or an overlay (Client). | |
| Cart badge | Server with static `0` for now. Becomes dynamic only when the cart (Scope B) is approved. | |

- Semantics: `<header>` › logo link (`aria-label="Rock Tama home"`) › `<nav aria-label="Main">` › `<ul>`. Icon-only controls get accessible names ("Search", "Account", "Cart, 0 items").
- **[VERIFIED] Below 1024 (M2.6):** logo · cart (0) · menu button; search and account live in the drawer (D-053). Drawer per D-054–D-056; all interactive states verified at 320/375/768 (`docs/verification/m2.6/`).
- Sticky header is **not shown** in the reference. Proposed: not sticky for v1 (decision pending).

**[VERIFIED] Desktop header implemented M2.4 (2026-11-15):** matches the reference layout at 1440 for nav word widths, item spacing, icon size and underline weight (sheet: `docs/verification/m2.4/header-desktop-reference.png`). Deliberate deviations: `gold-700` underline/badge (D-043). Open: right cluster ~55px left of the reference (same cause as V-002), nav text slightly lighter than the reference (V-003); both for M2.7. Shop dropdown deferred to M2.5b (M5).

## 03 — Hero

**[OBSERVED]**
- Background: deep forest green (`#0A2C23` sampled) with a soft lighter glow toward the bottom-left. Two or three layered, low-contrast **wave shapes** (`#153C30` → `#193F33`) sweep across the lower third and rise toward the right, passing behind the bottle.
- Two-column layout. The left column starts ≈ 108 ref px from the left edge, which is noticeably more inset than the products grid (22 px).
- **Left column, top to bottom:**
  1. Eyebrow "NATURAL SPRING WATER FROM AFRICA": gold (`≈ #E9C36A`), tracked caps, ≈ 13 ref px, semibold.
  2. Short gold rule, ≈ 48 × 2 ref px, below the eyebrow.
  3. Headline "ROCK TAMA" (**no hyphen**, unlike the logo): large serif caps, ≈ 64 ref px, cream (`#FCFEF1`), bold.
  4. Tagline "Pure by Nature. African at Heart.": italic serif, ≈ 26 ref px, cream.
  5. Paragraph, sans-serif ≈ 15 ref px, cream, 5 lines, max-width ≈ 360 ref px. **Copy issue:** "…Nigeria, Naturally filtered…" should read "…Nigeria. Naturally filtered…".
  6. CTA row with ≈ 16 ref px gap:
     - **Primary "SHOP NOW":** gold vertical gradient (`#FCE2A8` → `#E0AD5F`), near-black text, cart icon, ≈ 188 × 40 ref px, radius ≈ 4, soft shadow.
     - **Secondary "REQUEST WHOLESALE":** transparent with a 1 px gold border, cream text, warehouse/building icon, ≈ 216 × 40 ref px, radius ≈ 4.
- **Right column:** large bottle-silhouette placeholder, centred around x ≈ 762, spanning y ≈ 110–475 (≈ 140 × 365 ref px, ratio ≈ 2:5). Light fill, thin light outline, drop shadow. It nearly fills the hero's height and sits on the wave.

**[PROPOSED]**
- Semantics: `<section aria-labelledby="hero-heading">`. The eyebrow is a `<p>`, not a heading. **`<h1 id="hero-heading">` is "Rock Tama"** (the only h1 on the page). The tagline is a `<p>`. Consider a visually hidden "Natural Spring Water" inside the h1 for SEO (decision pending).
- CTAs are **links** (`<a>` via `next/link`) to `/shop` and `/wholesale`, styled as buttons. They navigate, they don't perform actions.
- Waves: an inline, `aria-hidden` **SVG** absolutely positioned at the bottom with `preserveAspectRatio="none"`, plus a CSS `radial-gradient` for the glow. No raster images.
- Bottle: the `MediaFrame` placeholder at a fixed aspect ratio (2:5). When the real cut-out arrives, it becomes `next/image` with `priority` (it is the likely LCP element). See [`ASSET_SPECIFICATIONS.md`](ASSET_SPECIFICATIONS.md).
- Tablet: still two columns from `md`, with a smaller bottle (~360 px tall).
- Mobile: single column. Text first, CTAs full-width and stacked, bottle below the text at ~300 px tall, waves scaled down.

**[VERIFIED] Implemented M3.1–M3.2 (2026-11-15):** static hero at all widths; @1440 every element within ±3px of the reference (eyebrow, rule, heading, tagline, description, both buttons, bottle); residual: tagline −19px / description −21px wide (letter shapes, as V-006). CTAs go through `resolveHref` and stay transitional until `/shop` (F2) and `/wholesale` (F1) work (D-067). Evidence `docs/verification/m3.2/`.

**[VERIFIED] Hero Product Carousel (F2, D-085):** reference bottle position preserved within 4px @1440; controls beside the bottle on desktop. Shop Now → `/shop` works.

## 04 — Purity / Trust Indicators Strip

**[OBSERVED]**
- Full-width band, background `#0D3427`, ≈ 88 ref px tall, directly under the hero (subtle top edge).
- Six items evenly distributed, separated by thin vertical lines (≈ 50 ref px tall, muted sage `#9CB4A7` at low opacity):

| # | Icon (gold outline, ≈ 28 ref px) | Label (cream, ≈ 13 ref px, centred) |
|---|---|---|
| 1 | Water drop | Ultra Pure |
| 2 | Mountain peaks | Bottled / at Source |
| 3 | Wavy lines | Low TDS / (6–8 mg/L) |
| 4 | Lab flask | Heavy Metals / Not Detected |
| 5 | Crossed-out microbe | Pathogens / Absent |
| 6 | Clipboard with check | Lab Tested |

- Single-line labels (1, 6) sit lower than two-line labels, so the icons are top-aligned and the labels flow below.

**[PROPOSED]**
- Data-driven: `content/highlights.ts` exports `purityHighlights: { icon, label }[]`. `TrustStrip` maps over the array with the shared `IconFeature` component. Markup is written once, not six times.
- Semantics: `<section aria-label="Purity highlights">` › `<ul>` › `<li>`. Icons are `aria-hidden`.
- Dividers: CSS (`divide-x` or border on `li + li`), so there are no extra elements.
- Tablet: 3 × 2 grid. Mobile: 2 × 3 grid. Dividers are hidden at both sizes and replaced by gaps.
- These are **claims** (see the evidence table in [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md)).

**[VERIFIED] Implemented 2026-11-15 (D-079):** see `docs/verification/home-4-trust/`. Every label is a registered claim (D-078).

## 05 — Our Products

**[OBSERVED]**
- Ivory background (`#FAF5F0`).
- **Heading block (centred):**
  - Eyebrow "OUR PRODUCTS": gold-brown tracked caps with short gold lines on **both** sides.
  - H2 "THE ROCK TAMA RANGE": serif caps, ≈ 28 ref px, near-black.
  - Subtitle "Natural spring water for everyday hydration, premium hospitality and bulk supply.": italic serif, ≈ 14 ref px.
- **Grid:** 4 cards spanning x ≈ 22–1062 (wider than the hero text), ≈ 8 ref px gaps. Cards are ≈ 235 ref px tall, cream background `#F5ECE1`, very soft border/shadow, radius ≈ 6–8.
- **No prices are shown.** Do not add any.

| Card | Layout | Image placeholder | Title | Text | CTA |
|---|---|---|---|---|---|
| 1 | **Side-by-side**: image left, text column right | Bottle silhouette, ≈ 62 × 207 ref (~3:10) | "750 ml / Glass Bottle", serif bold, 2 lines | "A refined choice for premium drinking, hotels and personal use." | Outline gold, small: "SHOP 750 ML ›" |
| 2 | **Side-by-side** | Bottle silhouette, ≈ 78 × 207 ref (~3:8) | "1.5 L / Bottle" | "Ideal for home, office and everyday hydration." | "SHOP 1.5 L ›" |
| 3 | **Stacked**: title, text, image, CTA | Carton box (3-D), ≈ 195 × 112 ref (~7:4) | "Carton Packs", serif bold, centred | "Convenient multi-bottle packs for retail and events." | "SHOP CARTONS ›", centred |
| 4 | **Stacked** | Pallet of cases, ≈ 233 × 114 ref (~2:1) | "Distributor Supply", serif bold **italic** (differs from card 3) | "Bulk volumes for supermarkets, retailers, hotels and institutions." | "REQUEST SUPPLY ›", centred |

**[PROPOSED]**
- One `ProductCard` component with a `layout: "side" | "stacked"` prop. Content comes from `content/products.ts`. Card 4 is the same component with a CTA pointing to wholesale, not a product page. The italic title on card 4 is **pending confirmation** (intentional vs. inconsistency). Until then, reproduce it via a data flag rather than special-casing JSX.
- Semantics: `<section aria-labelledby="products-heading">`, H2, then `<ul>` of `<li><article>` with an H3 title. Each CTA is a link with a unique accessible name (the visible "SHOP 750 ML" already is).
- Desktop (≥ 1024): 4 columns. Tablet: 2 × 2. Mobile: 1 column; side cards keep their horizontal layout (it works well narrow), stacked cards stay stacked.
- Cards should be equal height in a row (`grid` with `h-full` cards and the CTA pushed to the bottom via `mt-auto`).

**[IMPLEMENTED 2026-11-16, D-087]** `ProductRangeSection` with the shared `OfferCard` (`media-side` for cards 1–2, `media-middle` for 3–4; `ProductCard` adapts products to it). Card 4 is a `ServiceOffer` in `content/home.ts`, not a product. Media-side cards stack below 640px (deviation from the proposal above: at 320px the side layout clipped the button). Italic card-4 title kept as a data flag, still pending owner confirmation.

## 06 — Our Origin

**[OBSERVED]**
- Ivory background. Three horizontal regions on desktop:
  1. **Landscape image placeholder** (left): x ≈ 25–490, y ≈ 935–1092 (≈ 465 × 157 ref, **≈ 3:1**), radius ≈ 6, light grey fill with an image icon and label "Story Section Image (Landscape)".
  2. **Text (middle):**
     - Eyebrow "OUR ORIGIN" (gold caps) with a trailing short gold line.
     - H2 "FROM NANKA, ANAMBRA STATE": serif caps, ≈ 22 ref px.
     - Paragraph (≈ 12.5 ref px, 4 lines): "ROCK TAMA springs from a naturally protected source in Nanka, Anambra State, Nigeria. The water is naturally filtered through ancient rock formations, giving it a clean, balanced mineral profile and a remarkably smooth taste."
     - Three inline features separated by vertical dividers, each a gold icon + 2-line label: pin + "Nanka, / Anambra State"; leaf + "Naturally / Protected Source"; layered strata + "Preserved / Natural Purity".
  3. **Map (right):** Africa silhouette in sand (`#EBDCC6`), ≈ 140 × 150 ref px, with a dark-green location pin near Nigeria. It bleeds slightly toward the right edge.

**[PROPOSED]**
- `OriginSection` (Server). The features use `IconFeature` in `inline` layout. The map is an inline SVG (`AfricaMap`), decorative (`aria-hidden`) because the text already states the location. **The map outline must come from an accurate, licensed source**, not hand-drawn.
- Image: `MediaFrame` at 3:1 on desktop. On mobile, a taller crop (16:9) is proposed so it isn't a thin sliver (art-direction decision pending).
- Tablet: image full width on top; text and map side by side below.
- Mobile: image, then text, then features stacked vertically. The map is small and centred below, or hidden (decision pending).

## 07 — Quality & Safety

**[OBSERVED]**
- Light sage background (`#E5E7DA` left → `#CDD1C4` right) with a **water-droplet/bubble texture**, strongest on the left.
- Left to right, separated by vertical dividers:
  1. Eyebrow "QUALITY & SAFETY" (gold caps). H2 "PURITY YOU / CAN TRUST": serif caps, **dark green** (`≈ #0B2A1D`), ≈ 24 ref px, 2 lines.
  2. Statement (≈ 12 ref px, 3 lines): "Naturally pure, rigorously tested and bottled at the source to international quality standards."
  3. Four indicators, each a dark-green **circular outlined icon** (≈ 32 ref px) above a centred label: "Low TDS / 6–8 mg/L"; "**Unstilled** / (Natural State)" — **likely a typo for "Undistilled"**; "Odourless & / Tasteless / at Source"; "Lab / Tested".
  4. **ISO badge:** gold laurel wreath around "ISO / 22000" (serif bold), followed by the text "Manufactured under ISO 22000 Food Safety Management".

**[PROPOSED]**
- `QualitySection` (Server). Indicators come from `content/highlights.ts` (`qualityIndicators`) and are rendered by `IconFeature` with `tone="light"` and the `circled` icon style.
- The ISO badge stays inside `QualitySection` (single use) and is **behind a content flag**. It renders only when certification evidence is confirmed. **Never use the official ISO logo.** A generic laurel + text badge is acceptable only for a genuinely certified business.
- Texture: CSS gradients first. An optional lightweight texture image is decided at implementation time (see assets doc).
- Tablet: heading + statement in one row, indicators in a 4-column row, badge below.
- Mobile: stacked; indicators 2 × 2; badge centred.

## 08 — Business & Institutional Supply Banner

**[OBSERVED]**
- Rounded card (radius ≈ 10 ref px), inset from the page edges (x ≈ 30–1055), background `#082D20`. It sits on the sage background just above the footer.
- Left to right:
  1. H2 "SUPPLY FOR / BUSINESS & INSTITUTIONS": serif caps, cream, ≈ 20 ref px.
  2. Vertical divider.
  3. Text (≈ 10.5 ref px, 3 lines): "Reliable, high-quality natural spring water for hotels, restaurants, offices, events, retailers and export markets."
  4. Four segments, each a gold outline icon above a 2-line cream label: bed + "Hotels & / Hospitality"; office building + "Offices & / Workplaces"; cart + "Retail & / Supermarkets"; ship + "Export / Supply".
  5. CTA "REQUEST WHOLESALE ›": the **same gold-gradient primary button** as the hero, slightly smaller.

**[PROPOSED]**
- `WholesaleBanner` (Server). Segments come from `content/highlights.ts` (`businessSegments`) via `IconFeature`. The CTA reuses `ButtonLink variant="primary"`. Section padding and the card use the shared `Container`.
- Tablet: two rows (heading + text, then segments + CTA).
- Mobile: stacked; segments 2 × 2; full-width CTA.

## 09 — Footer

**[OBSERVED]**
- Background `#0A3125`. The bottom bar is slightly darker (`#072D1F`), separated by a thin horizontal line (`#758579`, low opacity).
- **Brand area (left):** gold mountain mark centred above the wordmark "ROCK·TAMA" (cream serif; this variant appears to use a centred dot or a lighter hyphen), with "NATURAL SPRING WATER" in small tracked caps. A vertical divider follows.
- **Link columns** (heading: cream, ≈ 11 ref px, semibold; links: muted `#C2CCC6`, ≈ 10.5 ref px):
  - **Shop:** All Products · 750 ml Bottle · 1.5 L Bottle · Carton Packs
  - **Company:** Our Story · Quality & Safety · Wholesale & Distribution · Contact Us
  - **Help:** Delivery & Returns · FAQs · Terms & Conditions · Privacy Policy
  - Then a vertical divider.
- **Stay Connected:** heading, "Get news, offers and updates from Rock Tama.", an email input with outlined border and placeholder "Enter your email", and an attached gold-outlined square submit button with a right arrow.
- **Social (far right):** Instagram, Facebook, LinkedIn, YouTube. Cream icons, ≈ 18 ref px.
- **Bottom bar:** left "© 2025 Rock Tama Natural Spring Water. All Rights Reserved."; right "Natural Spring Water from Africa | Nanka, Anambra State, Nigeria".

**[PROPOSED]**
- Semantics: `<footer>` (contentinfo). Each link column is a `<nav aria-labelledby>` with a small `<h2>` and a `<ul>`. The newsletter is a `<form>` with a visually hidden `<label>` ("Email address"), `type="email"`, `autocomplete="email"`, and a submit `<button aria-label="Subscribe">`. Social links are a `<ul>` with accessible names.
- `NewsletterForm` is a small Client Component (pending/success/error state). The **UI** is built in Milestone 7. **Submission wiring waits for Scope B approval** (provider not chosen).
- Copyright year: generate it rather than hard-coding 2025. Note that with `cacheComponents` enabled, `new Date()` in a Server Component must be inside a cached scope; see the gotcha in [`DEVELOPMENT_GUIDELINES.md`](DEVELOPMENT_GUIDELINES.md).
- Tablet: brand on top; three link columns in a row; newsletter + social full width.
- Mobile: brand centred; link columns in a 2-column grid; newsletter full width; social centred; bottom bar stacked and centred.

---

## Copy and consistency issues found in the reference (need owner decisions)

1. ~~Brand spelling varies~~ **Resolved (D-017):** official name **ROCK-TAMA** in copy, title, metadata and docs; the hero headline may show "ROCK TAMA". Copy that reads "Rock Tama" (footer, copyright, section copy) is normalised to ROCK-TAMA when implemented. Logo artwork is used as supplied.
2. Hero: "Nigeria, Naturally filtered" → "Nigeria. Naturally filtered".
3. Quality: "Unstilled" → "Undistilled" (assumed).
4. Products: card 4 title is italic, card 3 is not.
5. Copyright year shows 2025 (current year is 2026).
6. Cart badge shows "0". Should the badge be hidden when the cart is empty?
