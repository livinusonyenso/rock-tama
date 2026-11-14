# Project Structure

## Current — [CONFIRMED] 2026-11-14

```text
rocktama/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # create-next-app starter page
├── public/               # starter SVGs only
├── docs/                 # project documentation (this folder)
│   └── reference/homepage-reference.png
├── .claude/              # Claude Code rules + skills
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json / package-lock.json
└── tsconfig.json         # alias @/* → ./*
```

## Proposed — [PROPOSED] (D-004)

The project has no `src/` directory and the alias already maps `@/*` to the root, so new folders sit at the root alongside `app/`.

```text
app/
├── layout.tsx                 # fonts, metadata, AnnouncementBar + SiteHeader + SiteFooter
├── page.tsx                   # HomePage: composes sections only
├── globals.css                # Tailwind import + @theme design tokens
├── icon.svg                   # (later) from logo mark
└── (future routes: shop/, wholesale/, our-story/, quality/, contact/ … after Scope B approval)

components/
├── layout/
│   ├── AnnouncementBar.tsx    # ✓ M2.2
│   ├── SiteHeader.tsx         # ✓ M2.4 (desktop)
│   ├── NavLink.tsx            # ✓ M2.4 "use client"
│   ├── ShopMenu.tsx           # "use client"
│   ├── MobileNav.tsx          # ✓ M2.6 "use client" (native <dialog>)
│   ├── MobileNavPanel.tsx     # ✓ M2.6 Server, drawer contents
│   ├── SiteFooter.tsx
│   └── NewsletterForm.tsx     # "use client"
├── home/                      # homepage-only sections
│   ├── HeroSection.tsx
│   ├── HeroWaves.tsx
│   ├── TrustStrip.tsx
│   ├── ProductRangeSection.tsx
│   ├── OriginSection.tsx
│   ├── QualitySection.tsx
│   └── WholesaleBanner.tsx
├── ui/                        # shared, design-system level
│   ├── Container.tsx          # ✓ M2.2
│   ├── ButtonLink.tsx
│   ├── SectionHeading.tsx
│   ├── IconFeature.tsx
│   ├── MediaFrame.tsx
│   └── ProductCard.tsx
├── brand/
│   ├── Logo.tsx               # ✓ M2.3
│   └── AfricaMap.tsx
└── icons/
    ├── Icon.tsx               # ✓ M2.2 IconName → lucide-react / custom SVG map
    └── GlobeFilled.tsx        # ✓ M2.7 Heroicons solid globe-alt (MIT notice inside)

content/                       # typed static content (no React)
├── routes.ts                  # ✓ M2.1 route plan + availability, homepage section flags
├── site.ts                    # ✓ M2.1 brand, logos, announcements
├── navigation.ts              # ✓ M2.1 main nav, Shop dropdown, header actions
├── products.ts                # M5
└── highlights.ts              # M4/M6/M7

types/
└── content.ts                 # ✓ M2.1 shared content types

scripts/
├── visual-check.mjs           # ✓ M2.V `npm run verify:visual`
└── visual-check.config.mjs    # viewports, pages, sections + reference rects

lib/
└── navigation.ts              # ✓ M2.1 resolveHref(), ✓ M2.6 resolveNavItem() (+ temporary Shop guard)

public/
├── brand/                     # logo SVGs (to be supplied)
└── images/
    ├── products/
    ├── origin/
    └── textures/
```

### Conventions [PROPOSED]

- One component per file, PascalCase filename = component name, named exports (`export function HeroSection`). Next.js route files (`page.tsx`, `layout.tsx`) keep their required default export.
- `components/home/*` may import from `ui/`, `brand/`, `icons/`, `content/`. `ui/` must **not** import from `home/` or `layout/`.
- `content/` holds data only: no JSX, no React imports.
- No barrel `index.ts` files except `components/icons/index.tsx`.
- Server-only modules (future DB/email code) go under `lib/server/` with `import "server-only"`.
