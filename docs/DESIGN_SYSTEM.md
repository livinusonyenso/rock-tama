# Design System — **[PROPOSED]**, derived from the reference

The values below are **sampled from the reference PNG** (pixel averages via `sharp`) or are **visual estimates**. They are not official brand specifications. If the brand has a style guide, it overrides everything here.

## 1. Colour

Legend: **S** = sampled from a flat area of the screenshot · **S~** = sampled, anti-aliased (text/thin lines), so it may be off · **E** = estimate/derived.

### Greens (dark surfaces)

| Proposed token | Hex | Src | Role |
|---|---|---|---|
| `forest-950` | `#062C1F` | S | Announcement bar, footer bottom bar (darkest) |
| `forest-900` | `#0A2C23` | S | Hero base |
| `forest-850` | `#0A3125` | S | Footer, wholesale banner (`#082D20`) |
| `forest-800` | `#0D3427` | S | Trust strip |
| `forest-700` | `#153C30` | S | Hero wave (mid) |
| `forest-600` | `#1E4A3B` | E | Hero wave highlight / glow |
| `forest-heading` | `#0B2A1D` | S~ | Dark-green headings on light backgrounds (Quality H2, wordmark) |

### Gold (accent)

| Proposed token | Hex | Src | Role |
|---|---|---|---|
| `gold-200` | `#FCE2A8` | S | Primary button gradient top |
| `gold-400` | `#F2C475` | S | Primary button gradient bottom / banner CTA |
| `gold-500` | `#E0AD5F` | S | Primary button mid, gold on dark (eyebrow, icons) |
| `gold-600` | `#C9A466` | S | Gold icons/lines on light backgrounds, card button borders (`#D0A46A`) |
| `gold-700` | `#9A6A1F` | E (from S~ `#9A5C00`) | Eyebrow **text** on light backgrounds, nav active underline, cart badge. **Darker than the icon gold so small text meets contrast.** |

### Light surfaces

| Proposed token | Hex | Src | Role |
|---|---|---|---|
| `ivory-50` | `#FAF5F0` | S | Page background |
| `ivory-100` | `#F9F4ED` | S | Header background |
| `cream-200` | `#F5ECE1` | S | Product card background |
| `sand-300` | `#EBDCC6` | S | Africa map fill |
| `sage-100` | `#E5E7DA` | S | Quality section (left) |
| `sage-200` | `#CDD1C4` | S | Quality section (right) |
| `placeholder` | `#DAD4CC` | S | Image placeholder fill |
| `placeholder-ink` | `#64645F` | S~ | Placeholder icon + label |

### Text and lines

| Proposed token | Hex | Src | Role |
|---|---|---|---|
| `ink-900` | `#111814` | E (S~ near-black) | Headings on light |
| `ink-700` | `#2A2823` | S~ | Body text on light |
| `ink-500` | `#5E5B53` | E | Secondary/muted text on light |
| `on-dark` | `#F7F8F5` | S~ | Primary text on green |
| `on-dark-muted` | `#C2CCC6` | S~ | Footer links |
| `line-light` | `#DEE6E1` | S | Header border |
| `line-card` | `#EADFCF` | E | Card border |
| `line-dark` | `#758579` | S | Footer divider (use at ~40–60 % opacity) |
| `line-dark-strong` | `#9CB4A7` | S | Trust strip dividers (low opacity) |

**Contrast check (must run at implementation):** gold `#E0AD5F` on `forest-900` passes for large text. On ivory it **fails** for small text, which is why `gold-700` exists for eyebrows on light backgrounds. Verify every text/background pair against WCAG AA (4.5 : 1 body, 3 : 1 large).

**Dark mode:** the reference is light-only. Proposed: remove the starter's `prefers-color-scheme: dark` tokens (decision pending).

## 2. Typography

| Role | Observed character | Proposed font | Est. size (ref → 1440) | Weight / style |
|---|---|---|---|---|
| Hero headline "ROCK TAMA" | High-contrast bracketed serif, caps | **Serif family** | 64 → ~80–88 px | 600–700 |
| Hero tagline | Same serif, italic | Serif italic | 26 → ~34 px | 400–500 italic |
| Section H2 ("THE ROCK TAMA RANGE") | Serif caps, slight tracking | Serif | 22–28 → ~32–38 px | 600 |
| Section subtitle | Serif italic | Serif italic | 14 → ~18 px | 400 italic |
| Card titles | Serif bold, title case | Serif | 18 → ~22–24 px | 700 |
| Eyebrows | Sans caps, wide tracking (~0.2em) | Sans | 11–13 → ~13–15 px | 600 |
| Navigation | Sans caps, slight tracking | Sans | 12 → ~14 px | 500 |
| Body | Humanist sans | Sans | 12–15 → ~15–17 px | 400 |
| Buttons | Sans caps, slight tracking | Sans | 12–14 → ~14 px | 600 |
| Footer links | Sans | Sans | 10.5 → ~14 px | 400 |
| Wordmark | Custom/logo serif | **Use the logo asset**, not a font | — | — |

**Proposed fonts** (via `next/font/google`, self-hosted at build, no runtime request to Google):
- **Serif:** `Cormorant Garamond` (600/700 + italic). Alternatives to compare: `Playfair Display`, `Libre Caslon Text`. Choose by side-by-side render in M1.
- **Sans:** `Source Sans 3` (variable, humanist, close to the body copy). Alternative: `Inter`.
- Fallback stacks: serif → `Georgia, "Times New Roman", serif`; sans → `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

## 3. Layout

| Item | Proposal |
|---|---|
| Breakpoints | Tailwind defaults: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`. The reference layout applies from **`lg`**. |
| Containers | `wide`: max 1320 px (products grid, banner, footer). `default`: max 1200 px (header, hero, origin). Gutters 16 px (mobile) → 24 px (`md`) → 32 px (`lg`). Hero text adds its own left inset at `xl`. |
| Section spacing | Desktop vertical padding ≈ 64–80 px for content sections; strips (trust, quality) ≈ 32–40 px. Mobile ≈ 48 px. |
| Vertical rhythm | 4 px base grid (Tailwind spacing). Eyebrow → heading 12 px; heading → subtitle 8 px; heading block → content 32–40 px. |
| Announcement bar | 32 px mobile / 36–40 px desktop |
| Header | 64 px mobile / ~84 px desktop |
| Hero | min-height ~520 px desktop; content-driven on mobile |
| Product grid | 4 cols `lg`, 2 cols `md`, 1 col mobile; gap 12–16 px; equal-height cards, min-height ~300 px desktop |
| Buttons | `md`: height 48–52 px, padding-x 28 px · `sm`: height 34–36 px, padding-x 16 px · radius 4 px |
| Radii | Buttons 4 px · cards/media 8 px · wholesale banner 12–14 px · badges full |
| Shadows | Card: very soft (`0 1px 2px rgb(0 0 0 / .04), 0 4px 16px rgb(60 40 10 / .05)`). Primary button: `0 4px 14px rgb(224 173 95 / .25)`. Hero bottle: soft drop shadow. All estimates. |

Implementation home: Tailwind v4 `@theme` block in `app/globals.css` (tokens become utilities such as `bg-forest-900` and `font-serif`). No colour or size literals scattered across components.

## 4. Images and placeholders

Every image area renders through `MediaFrame` with a **fixed aspect ratio**, so a missing image never collapses or distorts the layout. Full per-image specs: [`ASSET_SPECIFICATIONS.md`](ASSET_SPECIFICATIONS.md).

## 5. Iconography

Thin outline icons (~1.5 px stroke) in gold on dark backgrounds and dark green/ink on light backgrounds. Several are domain-specific (bottle-at-source mountains, TDS waves, crossed microbe, strata layers, laurel), so a **custom inline SVG set** is needed regardless. Generic UI icons (search, user, cart, truck, globe, chevrons, arrow) could come from a library. **Library choice is pending** (see `DECISIONS.md` D-008).
