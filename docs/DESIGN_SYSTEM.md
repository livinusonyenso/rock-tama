# Design System

**Implemented in [`app/globals.css`](../app/globals.css)** (Tailwind v4 `@theme`) and [`app/layout.tsx`](../app/layout.tsx) (fonts). Milestone 1, 2026-11-14.

Colour values are **sampled from the reference PNG** (pixel averages via `sharp`) or **estimates**. They are not official brand specifications. A brand style guide, if one is supplied, overrides them. Changing a token value means updating this file and `globals.css` together.

## 1. Colour — [APPROVED as tokens, M1]

Legend: **S** = sampled from a flat area · **S~** = sampled from anti-aliased text/lines (approximate) · **E** = estimate · **A** = adjusted for accessibility.

Utility examples: `bg-forest-900`, `text-gold-700`, `border-line-card`, `border-line-dark/50` (opacity modifier).

### Greens (dark surfaces)

| Token | Hex | Src | Role |
|---|---|---|---|
| `forest-950` | `#062C1F` | S | Announcement bar, footer bottom bar |
| `forest-900` | `#0A2C23` | S | Hero base |
| `forest-850` | `#0A3125` | S | Footer, wholesale banner (banner sampled `#082D20`, merged) |
| `forest-800` | `#0D3427` | S | Trust strip |
| `forest-700` | `#153C30` | S | Hero wave (mid) |
| `forest-600` | `#1E4A3B` | E | Hero wave highlight / glow |
| `forest-heading` | `#0B2A1D` | S~ | Dark-green headings on light surfaces |

### Gold (accent)

| Token | Hex | Src | Role |
|---|---|---|---|
| `gold-200` | `#FCE2A8` | S | Primary button gradient top |
| `gold-400` | `#F2C475` | S | Primary button gradient bottom |
| `gold-500` | `#E0AD5F` | S | Gold text and icons **on dark green** |
| `gold-600` | `#C9A466` | S | Gold icons, rules and borders **on light** surfaces. **Not for text** (2.16 : 1 on ivory). |
| `gold-700` | `#885D1B` | A | Small gold **text on light** surfaces (eyebrows), nav active underline, cart badge background. Darkened from the first estimate `#9A6A1F` (same hue), which failed AA. |

Utility: `bg-gold-gradient` (custom `@utility`) = `linear-gradient(to bottom, gold-200, gold-400)`, the primary CTA fill.

### Light surfaces

| Token | Hex | Src | Role |
|---|---|---|---|
| `ivory-50` | `#FAF5F0` | S | Page background (set on `body`) |
| `ivory-100` | `#F9F4ED` | S | Header background |
| `cream-200` | `#F5ECE1` | S | Product card background |
| `sand-300` | `#EBDCC6` | S | Africa map fill |
| `sage-100` | `#E5E7DA` | S | Quality section (light end) |
| `sage-200` | `#CDD1C4` | S | Quality section (dark end) |
| `placeholder` | `#DAD4CC` | S | Image placeholder fill |
| `placeholder-ink` | `#5C5C57` | A | Placeholder icon + label (darkened from `#64645F` to pass AA) |

### Text and lines

| Token | Hex | Src | Role |
|---|---|---|---|
| `ink-900` | `#111814` | E | Headings on light |
| `ink-700` | `#2A2823` | S~ | Body text on light (default `body` colour) |
| `ink-500` | `#5E5B53` | E | Secondary text on light |
| `on-dark` | `#F7F8F5` | S~ | Primary text on green |
| `on-dark-muted` | `#C2CCC6` | S~ | Footer links, secondary text on green |
| `line-light` | `#DEE6E1` | S | Header bottom border |
| `line-card` | `#EADFCF` | E | Card border |
| `line-dark` | `#758579` | S | Dividers on green (use with opacity, e.g. `/50`) |
| `line-dark-strong` | `#9CB4A7` | S | Trust strip dividers (use with opacity) |

### Contrast results [VERIFIED 2026-11-14, computed WCAG 2.x ratios]

| Pair | Ratio | Result |
|---|---|---|
| `gold-700` on `ivory-50` / `cream-200` / `sage-100` / `ivory-100` | ≥ 4.62 | AA body ✓ |
| `gold-500` on `forest-900` | 7.38 | AA ✓ |
| `on-dark` on `forest-900` / `forest-800` | 14.10 / 12.81 | AAA ✓ |
| `on-dark-muted` on `forest-850` | 8.62 | AAA ✓ |
| `ink-900` on `gold-400` (button text) | 11.10 | AAA ✓ |
| `ink-700` on `cream-200` | 12.60 | AAA ✓ |
| `ink-500` on `cream-200` / `ivory-50` | 5.80 / 6.26 | AA ✓ |
| `forest-heading` on `sage-200` | 9.91 | AAA ✓ |
| white on `gold-700` (cart badge) | 5.79 | AA ✓ |
| `placeholder-ink` on `placeholder` | 4.57 | AA ✓ |
| `gold-600` on `ivory-50` | 2.16 | **Decorative only.** Fine for icons that sit beside a text label and for button borders whose text identifies the control. Never for text. |

### Feedback colour and form controls (F1)

| Token | Hex | Role |
|---|---|---|
| `error` | `#A3261B` | Form error text and invalid borders on light surfaces: 7.37 (white), 6.80 (ivory), 6.30 (cream) |

Form controls: white field, 1px `ink-500` border (6.78:1, meets the 3:1 non-text minimum), `rounded-button`, `px-4 py-3`, `focus-ring`; invalid = `border-error` + error text linked by `aria-describedby`; labels `font-semibold ink-900`, hints `text-sm ink-500`.

### Dark mode — [APPROVED, M1]

The site is light-only (with dark-green sections). Implementation: the starter `prefers-color-scheme: dark` tokens were removed, `html { color-scheme: light }` keeps form controls and scrollbars light, and the `dark:` variant is re-bound to an explicit `.dark` class (`@custom-variant dark`) that is never set. So no `dark:` utility, including those left in the starter `page.tsx`, can respond to the OS setting.

## 2. Typography — [APPROVED, D-007]

Fonts are loaded once in `app/layout.tsx` via `next/font/google`. They are self-hosted at build time (no runtime request to Google) with `display: swap`.

| Font | CSS variable (on `<html>`) | Tailwind utility | Use |
|---|---|---|---|
| Cormorant Garamond (400/500/600/700, normal + italic) | `--font-cormorant` | `font-serif` | Hero headline + tagline, section headings, card titles, premium editorial elements |
| Source Sans 3 (variable) | `--font-source-sans` | `font-sans` (body default) | Navigation, body, buttons, labels, eyebrows, footer |

Fallbacks: serif → `Georgia, "Times New Roman", serif`; sans → `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

### Type scale tokens (estimates; tune during visual review)

| Token / utility | Size | Line height | Use |
|---|---|---|---|
| `text-display` | **5.5rem (88px)** (M3) | 1 | Hero "ROCK TAMA" from `xl` (`text-5xl` → `sm:text-6xl` → `md:text-5xl` → `lg:text-7xl`) |
| `text-tagline` | **2.5rem (40px)** (M3) | 1.1 | Hero tagline (semibold italic serif) from `xl` |
| `text-hero-eyebrow` | 1.3125rem (21px) | 1.4 | Hero eyebrow from `lg` (with `tracking-hero-eyebrow` 0.12em) |
| `text-section` | 2.375rem (38px) | 1.15 | Section H2 (measured §5, D-087; was 36px) |
| `text-card-title` | 1.5rem (24px) | 1.2 | Product card titles |
| `text-subtitle` | 1.375rem (22px) | 1.3 | Italic serif section subtitle (§5, D-087) |
| `text-eyebrow` | 0.8125rem (13px) | 1.4 | Eyebrows (pair with `tracking-eyebrow`, uppercase, semibold) |
| Tailwind defaults (`text-sm`, `text-base`, `text-lg`) | — | — | Body, nav, buttons, footer |

Tracking: `tracking-eyebrow` (0.2em), `tracking-nav` (0.04em; tuned in M2.4, was 0.06em).

Smaller-screen sizes are set per component with responsive classes (e.g. `text-5xl lg:text-display`).

## 3. Layout and spacing — [APPROVED as tokens, M1]

| Token / utility | Value | Use |
|---|---|---|
| Spacing grid | Tailwind default (4px steps) | Everything not listed below |
| `py-section` / `py-section-sm` | 5rem / 3rem | Content-section padding, desktop / mobile |
| `py-strip` | 2.5rem | Trust strip, quality strip |
| `min-h-announcement` | 2.5rem (40px) | Announcement bar **min-height** (D-035; was 36px) |
| `h-header` / `h-header-sm` | 5.25rem / 4rem | Header height, desktop / mobile |
| `max-w-content` | **75.75rem (1212px)** (measured M3, D-070) | Hero |
| `max-w-wide` | **90rem (1440px)** (corrected M2.7 from 1320, D-059) | Announcement bar, header (D-034), product grid, banner, footer. With 32px padding: content 32–1408 at 1440 = reference frame |
| `pl-header-inset` / `pl-bar-inset` | `clamp()` tokens (D-064) | Fluid left padding of header / bar rows from `xl`: 32px at 1280 → 92 / 88px at 1440, constant above |
| `rounded-button` / `rounded-card` / `rounded-banner` | 4px / 8px / 12px | Buttons / cards and media / wholesale banner |
| `shadow-card` / `shadow-gold` | see `globals.css` | Product cards / primary CTA |

Still **proposed**, not tokens (they are component decisions for later milestones):
- Breakpoints: Tailwind defaults (`sm 640`, `md 768`, `lg 1024`, `xl 1280`); the reference desktop layout applies from `lg`; the header-row inset is fluid between 1280 and 1440 (D-064).
- Gutters: 16 → 24 → 32 px (inside `Container`).
- Heading rhythm: eyebrow → heading 12px, heading → subtitle 8px, heading block → content 32–40px.
- Product grid: 4 / 2 / 1 columns, 12–16px gaps.
- Buttons: `md` 48–52px tall, `sm` 34–36px.

## 3a. Component specs (implemented)

**Announcement bar (M2.2; refined M2.7):** icons `lg:size-6`; `xl:pl-bar-inset` (fluid); globe = filled `GlobeFilled` (Heroicons, MIT). Original M2.2 spec: `bg-forest-950`, `text-on-dark`, Source Sans 3 400; `text-sm` (14px) below `lg`, `text-base` (16px) from `lg`. Icons `gold-500`, stroke 1.75, `size-4` → `lg:size-5`. Dividers 1px × `h-3` → `lg:h-4`, `line-dark-strong` (full opacity). Gaps: icon–text `gap-2.5` → `lg:gap-3`; between items `gap-x-3.5` → `lg:gap-x-4`. Min-height 40px, `py-2`.

**Header (M2.4; refined M2.7, D-059–D-063):** From `xl`: `pl-header-inset` (fluid), nav `gap-12`, divider `w-0.5 h-7` `ml-10 mr-9`, icons `gap-7` + `mr-2`; positions at 1440 within ±2px of the reference for logo, divider, icons, badge. Original M2.4 spec: `bg-ivory-100`, `border-b border-line-light`, height `h-header-sm` (64) → `lg:h-header` (84), `wide` container. Logo `h-10` → `lg:h-12` → `xl:h-16`. Nav: uppercase Source Sans 3 500, `text-sm` → `xl:text-base`, `tracking-nav`, `text-ink-900`, gap `gap-8` → `xl:gap-11`; active underline `::after` `h-0.75` `bg-gold-700`, `bottom-1`; Shop chevron `size-3.5` stroke 2. Divider `w-px h-7 bg-gold-600`, `lg:ml-8 lg:mr-6` → `xl:ml-12 xl:mr-9`. Icons `forest-heading`, stroke 1.75, `size-6` → `xl:size-6.5`, gap `gap-5` → `xl:gap-8`. Cart badge `size-6` circle `bg-gold-700`, white `text-xs` semibold, `-top-3.5 -right-2.5`. Live links: `hover:text-gold-700` + `focus-ring`; pending items: no hover, default cursor.

**Mobile header (M2.6, below `lg`):** logo `h-9` → `sm:h-10`; cart (badge as desktop); menu button `size-11` with `menu` icon `size-7`, stroke 1.75, `text-forest-heading`, `-mr-2` optical alignment. Search/account hidden (`hidden lg:block`).

**Mobile drawer (M2.6):** `<dialog>` `bg-forest-850 text-on-dark`, `w-5/6 max-w-sm h-dvh`, right edge, `backdrop:bg-forest-950/60`, `translate-x` slide-in 200ms `ease-out` via `starting:` + `motion-reduce:transition-none`. Inner padding `px-6 pt-4 pb-8`. Eyebrow "MENU" `text-eyebrow tracking-eyebrow text-gold-500`; close button `size-11`, `x` icon `size-7`. Main rows `font-serif text-2xl font-semibold min-h-12 pl-4`, separators `divide-line-dark/40` + `border-y`, current page `before:w-0.75 bg-gold-500`, pending rows `text-on-dark-muted` with a "COMING SOON" tag (`font-sans text-xs font-semibold uppercase tracking-eyebrow`). Secondary rows `text-base` with `gold-500` icons `size-5`; group gap `mt-6`.

**Focus indicators:** `focus-ring` (2px `gold-700`, 4px offset) on light surfaces; `focus-ring-dark` (2px `gold-500`, 6.97:1 on `forest-850`) on dark surfaces.

**Hero (M3.2, measured @1440, all elements within ±3px of the reference):** `bg-hero` (vertical forest gradient + lower-left glow) + `HeroWaves` (2 static SVG layers, forest-600→800 gradients). `content` container, 2 columns from `md`, `min-h-hero` (525) from `lg`. Text column `lg:pt-11`: eyebrow `text-hero-eyebrow` semibold uppercase `gold-500`; rule `w-16 h-px gold-500`; h1 `font-serif font-bold` `xl:text-display`; tagline `font-serif font-semibold italic` `xl:text-tagline`; description `lg:text-xl leading-snug max-w-120`; CTA row `gap-5`, buttons `min-w-62 min-h-13 px-8 lg:text-lg` with 24px icons. Bottle `MediaFrame` 2:5, `lg:h-hero-media` (484), 20px above the hero bottom. Below `md`: single column, bottle below the CTAs (`h-72 sm:h-80`), CTAs stacked under `sm`.

**Buttons (`ButtonLink`):** `primary` = `bg-gold-gradient text-ink-900 shadow-gold`, hover `shadow-gold-hover brightness-105 -translate-y-px`; `outline-dark` = `border-gold-500 text-on-dark`, hover `border-gold-400 bg-gold-500/10`; 150ms `ease-standard`; no lift with reduced motion; `focus-ring-dark`.

**Trust strip (§4, D-079):** `bg-forest-800`, top `border-line-dark/60`; track `max-w-332` `lg:ml-auto lg:mr-2.5`; `IconFeature`: icon `size-9` → `lg:size-12` stroke 1.5 `gold-500`; label `font-medium` `text-base` → `lg:text-xl lg:leading-5`, two-line min-height; dividers `after:` `w-px h-15 bg-line-dark-strong/50` from `lg`; `lg:py-3`. Grid 2 → `sm` 3 → `lg` 6.

**Shop (F2):** `ShopPageHeader` (compact `bg-hero` + waves), product grid `ProductCard` with a serif price line (`formatPrice` → "Price on request"); product page: cream media panel (`min-h-96 lg:min-h-136`), `font-serif text-5xl/6xl lining-nums` name, `dl` packaging/price, primary "Request this product" (`ButtonLink primary surface=light`) + outline "All products".

**Shop menu (F2):** trigger = nav item style, `data-current` underline; panel `bg-ivory-100 rounded-card shadow-card-hover w-64`, links `px-4 py-3 text-base font-medium`, current = `bg-cream-200`; 150ms `enter` animation (rise 4). Mobile: Shop label row + indented `pl-8` list, 44px rows, gold bar for the current page.

**Hero carousel controls (F2):** labels `min-h-11 px-4 text-sm uppercase tracking-nav rounded-button border`; active `border-gold-500 bg-gold-500/15 text-gold-200`, inactive `border-line-dark/70 text-on-dark-muted`; Pause/Play `size-11` round; "View …" link `text-gold-500`. Desktop: stacked to the right of the bottle (`lg:left-full lg:ml-6`); smaller screens: row below.

## 3b. Motion

Animation principles, technologies, duration/easing tokens, reduced-motion and performance rules, and verification live in **[`ANIMATION_SYSTEM.md`](ANIMATION_SYSTEM.md)** (proposed; approved per section). Don't add motion that isn't documented there.

## 4. Images and placeholders

Every image renders through `MediaFrame` with a fixed aspect ratio, so missing images never collapse the layout. Per-slot specs: [`ASSET_SPECIFICATIONS.md`](ASSET_SPECIFICATIONS.md).

## 5. Iconography — [APPROVED, D-008]

- **`lucide-react`** (installed 1.73.0, M2.2) for standard interface icons, rendered through `components/icons/Icon.tsx` (an `IconName` → Lucide map). Default stroke 1.5 (the announcement bar uses 1.75 to match the reference weight), size via `size-*`, colour via `currentColor`. The `globe` icon is a custom filled SVG (`components/icons/GlobeFilled.tsx`, Heroicons v2.2.0 solid `globe-alt`, MIT; D-061), resolving V-001. The `Icon` map accepts Lucide and custom SVG components.
- **Custom inline SVG** only for distinctive brand/decorative icons with no suitable Lucide equivalent (likely: crossed-out microbe, laurel badge, Africa map). Decide case by case; avoid custom work when a Lucide icon fits.
- Tone: gold on dark backgrounds (`gold-500`); dark green/ink on light backgrounds; `gold-600` for decorative gold on light.
