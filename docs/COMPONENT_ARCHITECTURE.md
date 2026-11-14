# Component Architecture — **[PROPOSED]**, awaiting approval

Guiding rule: a component exists only when it has a **distinct responsibility**, is **reused**, or **needs client interactivity**. Dividers, eyebrows inside a heading block, single icons and wrappers are Tailwind classes, not components.

Default boundary: **Server Component**. A Client Component (`"use client"`) is added only for state, effects, or browser APIs, and kept as small as possible (an "island").

Paths below follow [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md). Priorities reference milestones in [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md).

## 1. Page-level

| Component | Section | Responsibility | Reusable | Boundary | Props | Dependencies | Responsive | Priority |
|---|---|---|---|---|---|---|---|---|
| `HomePage` (`app/page.tsx`) | Page | Composes the homepage sections in order and sets page metadata | No | Server | — (route) | All section components | Sections handle their own | M3 (created with the Hero), grows each milestone |

## 2. Layout

| Component | Section | Responsibility | Reusable | Boundary | Props | Dependencies | Responsive | Priority |
|---|---|---|---|---|---|---|---|---|
| `RootLayout` (`app/layout.tsx`, **exists**) | All | `<html>/<body>`, fonts, global metadata, renders bar + header + footer around `children` | — | Server | `children` | `AnnouncementBar`, `SiteHeader`, `SiteFooter`, fonts | — | M1 (fonts/metadata), M2 (header), M7 (footer) |
| `Container` ✓ M2.2 | All | Max-width + horizontal gutters | Yes | Server | `size?: "content" \| "wide"` (default `content`), `className?`, `children` (no `as` prop, not needed yet) | — | Gutters 16/24/32px | **Implemented** `components/ui/Container.tsx` |
| `AnnouncementBar` ✓ M2.2 | 01 | Renders `site.announcements` | No (single instance) | Server | none (reads `content/site.ts`) | `Container`, `Icon` | Priority 1 always, 2 from `sm`, 3 from `xl`; wraps only under enlarged text | **Implemented** `components/layout/AnnouncementBar.tsx`, rendered in `app/layout.tsx` |
| `SiteHeader` | 02 | Logo, main nav, icon actions, mobile trigger | No | Server | none (reads `content/navigation.ts`) | `Logo`, `NavLink`, `ShopMenu`, `MobileNav`, icons | Text nav ≥ `lg`; hamburger below | M2 |
| `SiteFooter` | 09 | Brand, link columns, newsletter, social, bottom bar | No | Server | none (reads content) | `Logo`, `NewsletterForm`, icons, `Container` | 2-col links + stacked on mobile | M7 |

## 3. Interactive (Client islands)

| Component | Section | Responsibility | Reusable | Boundary | Props | Dependencies | Responsive | Priority |
|---|---|---|---|---|---|---|---|---|
| `NavLink` | 02 (and possibly footer) | Link that sets `aria-current="page"` + gold underline when active | Yes | **Client** (`usePathname`) | `href`, `children`, `exact?` | `next/link` | — | M2 |
| `ShopMenu` | 02 | "Shop" disclosure dropdown (keyboard, Escape, outside click) | No | **Client** | `items` | `NavLink` | Desktop only; inside `MobileNav` it is a simple list | M2 |
| `MobileNav` | 02 | Hamburger button + drawer with nav, account, focus handling, scroll lock | No | **Client** | `items` | `NavLink` | Visible < `lg` | M2 |
| `NewsletterForm` | 09 | Email form UI with validation and pending/success/error states | No | **Client** (`useActionState`) | `action?` (wired after Scope B) | — | Full width on mobile | M7 (UI only) |
| `SearchTrigger` | 02 | **Pending decision:** link vs. overlay. If it's a link, it isn't a component | — | — | — | — | — | Decide in M2 |

## 4. Section components (all Server)

| Component | Section | Responsibility | Reusable | Props | Dependencies | Responsive | Priority |
|---|---|---|---|---|---|---|---|
| `HeroSection` | 03 | Brand headline, copy, CTAs, bottle media, wave background | No | none (content module) | `Container`, `ButtonLink`, `MediaFrame`, `HeroWaves` | 2 col ≥ `md`, stacked below | M3 |
| `HeroWaves` | 03 | Decorative layered SVG waves (`aria-hidden`) | No | `className?` | — | Scales with `preserveAspectRatio="none"` | M3 |
| `TrustStrip` | 04 | Six purity highlights | No | `items` (default from content) | `IconFeature`, `Container` | 6 → 3×2 → 2×3 | M4 |
| `ProductRangeSection` | 05 | Heading block + product grid | No | `products` | `SectionHeading`, `ProductCard` | 4 → 2 → 1 columns | M5 |
| `OriginSection` | 06 | Landscape media, origin copy, features, map | No | none | `MediaFrame`, `SectionHeading`, `IconFeature`, `AfricaMap` | 3 regions → stacked | M6 |
| `AfricaMap` | 06 | Decorative Africa outline with pin | No | `className?` | Licensed SVG path data | Scales | M6 (needs asset decision) |
| `QualitySection` | 07 | Heading, statement, indicators, conditional ISO badge, texture | No | `showCertification` (content flag) | `SectionHeading`, `IconFeature` | Row → stacked; 4 → 2×2 | M6 |
| `WholesaleBanner` | 08 | Business supply pitch, segments, CTA | No | none | `Container`, `IconFeature`, `ButtonLink` | Row → 2 rows → stacked | M7 |

## 5. Shared UI

| Component | Used in | Responsibility | Boundary | Props | Notes | Priority |
|---|---|---|---|---|---|---|
| `ButtonLink` | 03, 05, 08 (+ later pages) | Link styled as a button | Server | `href`, `variant: "primary" \| "outline-dark" \| "outline-light"`, `size: "md" \| "sm"`, `icon?`, `trailingChevron?`, `children` | `primary` = gold gradient (hero, banner); `outline-dark` = gold border on green (hero); `outline-light` = gold border on cream (cards). A separate `Button` (`<button>`) is added only when a real action needs it, e.g. the newsletter submit. | M1/M3 |
| `SectionHeading` | 05, 06, 07, 08 | Eyebrow + H2 + optional subtitle | Server | `eyebrow`, `title`, `subtitle?`, `id`, `align: "center" \| "left"`, `eyebrowLines: "both" \| "after" \| "none"`, `tone: "light" \| "dark"`, `as?` (h1/h2) | The hero does **not** use it; its layout differs enough (rule below, h1). | M5 |
| `IconFeature` | 04, 06, 07, 08 | Icon + label pair | Server | `icon`, `label`, `layout: "stacked" \| "inline"`, `tone: "dark-bg" \| "light-bg"`, `iconStyle: "plain" \| "circled"` | One component covers 4 sections. Prevents four near-duplicate markup blocks. | M4 |
| `ProductCard` | 05 (later: shop pages) | One product/offer card | Server | `product: Product` (title, description, image, cta, `layout`, `titleStyle?`) | `side` and `stacked` layouts | M5 |
| `MediaFrame` | 03, 05, 06 | Fixed-aspect image slot: renders `next/image` if `src` exists, otherwise a labelled placeholder of identical size | Server | `aspect`, `label`, `src?`, `alt`, `fit: "cover" \| "contain"`, `sizes`, `priority?`, `shape?: "rect" \| "bottle"` | **Key to "no layout collapse"**: real and placeholder images share the same box. | M1/M3 |
| `Logo` | 02, 09 | Brand mark + wordmark | Server | `variant: "header" \| "footer"` | **Blocked on logo asset** (see questions). Uses a text-only fallback until then. | M2 |
| `Icon` ✓ M2.2 (`components/icons/Icon.tsx`) | All | Maps `IconName` → Lucide icon; always `aria-hidden` | Server | `name`, `className?`, `strokeWidth?` (default 1.5) | Exhaustive `Record<IconName, LucideIcon>`; custom SVGs join the same map later | **Implemented** |

## 6. Data-driven content (`content/`, plain typed TS modules)

Types live in `types/content.ts`. Content is plain, serialisable data: icons are string names (`IconName`), never component references, so the same data can be passed into Client Components (`MobileNav`, `ShopMenu`).

| Module | Exports | Consumed by | Status |
|---|---|---|---|
| `routes.ts` | `routes` (route plan: `live`/`planned`, path, optional interim homepage section), `homeSections` (`built` flags) | `lib/navigation.ts` | **Implemented M2.1** |
| `site.ts` | `site`: name `ROCK-TAMA`, `heroDisplayName`, title, description, location, logo references (planned paths, placeholder sizes, `available: false`), announcement messages | `app/layout.tsx` metadata ✓, `AnnouncementBar`, `Logo`, `SiteFooter` | **Implemented M2.1** |
| `navigation.ts` | `mainNav` (Shop has `children`), `headerActions` (search/account/cart), `navigationCopy.comingSoon`. `footerNav`, `socialLinks` are added in M7. | `SiteHeader`, `ShopMenu`, `MobileNav` | **Implemented M2.1** (header parts) |

### Navigation resolution (`lib/navigation.ts`), implemented in M2.1

`resolveHref(key: RouteKey): string | null`: live route → path; planned route whose interim section is built → `/#<section>`; otherwise `null`. Components **must** render `null` as non-interactive text with "Coming soon" accessible text (D-027), never `href="#"`. Nav items reference `RouteKey`s, so a misspelled destination is a compile error.

**Maintenance rule:** when a page ships, set its route to `"live"`; when a homepage section ships, set `homeSections.<id>.built = true` and render it with `id="<id>"`, both in the same commit.

**Cart count (D-029):** runtime data, not content. `SiteHeader` will accept `cartCount: number` (default supplied by the page/layout, `0` until the cart exists).

Planned content modules (not yet created):

| Module | Exports | Consumed by |
|---|---|---|
| `products.ts` | `Product[]` (4 homepage offers) | `ProductRangeSection` |
| `highlights.ts` | `purityHighlights`, `originFeatures`, `qualityIndicators`, `businessSegments`, `certification` flag | `TrustStrip`, `OriginSection`, `QualitySection`, `WholesaleBanner` |

Why TS modules rather than a CMS or database now: the content is static and small. A typed module gives compile-time checking at zero runtime cost. The same shapes can later be loaded from a database/CMS without touching components, because components receive data through props.

## Not components (deliberately)

Eyebrow lines, vertical dividers, the gold hero rule, badge counts, single headings, `<ul>` wrappers, section backgrounds. These are Tailwind utilities or markup inside their owning section.
