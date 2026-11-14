# E-commerce Requirements (Scope B) — **NOT APPROVED**

Nothing in this file is approved. The homepage (Scope A) can be built entirely without any of it.

Legend: **Visible** = a UI affordance appears in the reference · **Implied** = a visible element links to or depends on it · **Recommended** = engineering recommendation · **Confirm** = owner decision required.

## Requirements checklist

| Capability | Visible | Implied by | Recommended for v1? | Owner must confirm |
|---|---|---|---|---|
| Product listing page (`/shop`) | — | SHOP nav, "Shop Now", footer "All Products" | Yes (simple) | Product list, variants |
| Product detail pages | — | "Shop 750 ml", "Shop 1.5 L", "Shop Cartons" | Yes | Pricing, pack sizes, stock policy |
| Product variants (size, pack count) | — | Carton packs | Probably | Variant matrix |
| Pricing display | **Not shown** | — | — | **Prices, currency (NGN? USD for export?), VAT** |
| Shopping cart | Cart icon + badge "0" | Header | Only if online ordering is wanted | **Is v1 order-online or enquiry-only?** |
| Checkout | — | Cart | Only with cart | Guest checkout vs. accounts |
| Payment integration | — | Checkout | Only with checkout | Provider (Nigerian options include Paystack and Flutterwave; owner to choose), merchant account |
| Customer accounts | Account icon | Header | **Defer**; guest checkout is simpler | Needed for v1? |
| Order management | — | Checkout | With checkout: minimal admin view + email notifications | Who processes orders, how |
| Shipping & delivery logic | "Nationwide Delivery" | Announcement bar, footer "Delivery & Returns" | Flat rates/zones table first | Zones, fees, lead times, minimum order |
| Wholesale enquiry form | "Request Wholesale/Supply" CTAs (3) | Hero, products, banner | **Yes, high business value, low complexity** | Fields, recipient email, CRM? |
| Contact page/form | CONTACT nav, "Contact Us" | Header, footer | Yes | Phone, email, address, WhatsApp? |
| Newsletter subscription | Footer form | Footer | UI yes; backend once a provider is chosen | Provider (e.g. Mailchimp, Brevo, Resend audiences), consent wording |
| Search | Search icon | Header | Low value with ~4 products; propose filtering on `/shop` or hide icon | Keep icon? |
| Content pages | — | Our Story, Quality & Safety, Wholesale, FAQs, Delivery & Returns, Terms, Privacy | Yes (static) | Copy for each page |
| Admin product management | — | — | Defer; content in code or a headless CMS | Who edits content, how often |
| Analytics / cookies | — | — | Recommended (privacy-friendly) | Tool, consent requirements (Nigeria Data Protection Act) |
| Database | — | Orders, enquiries, subscribers | Only once forms/orders are approved | — |

**Key question that decides most of Scope B:** is v1 (a) **brochure + enquiries** (forms only, no payments), or (b) **full online ordering**? (a) is much smaller and can ship first. (b) can follow without rework if the data shapes are designed now.

## Backend architecture options

| | **1. Next.js Route Handlers + Server Actions (same app, Node.js runtime)** | **2. Separate Node.js API (Express / NestJS)** |
|---|---|---|
| Deployment | One app, one deploy | Two services, CORS, two pipelines |
| Type sharing | Direct imports of shared types | Needs a shared package or codegen |
| Forms | Server Actions with progressive enhancement | Client fetch + API endpoints |
| Webhooks (payments) | Route Handler `app/api/.../route.ts` | Express route |
| Long-running jobs / queues | Weak; needs an external queue/cron service | Natural fit |
| Multiple clients (mobile app, partners) | Possible via Route Handlers, less structured | Strong fit |
| Team/complexity | Minimal | NestJS adds significant structure/boilerplate |

**Recommendation [PROPOSED] (D-011):** Option 1. Use **Server Actions** for forms (wholesale enquiry, contact, newsletter) and **Route Handlers** for anything that must be a plain HTTP endpoint (payment webhooks, future public API). Keep business logic in `lib/server/*` modules, not inside actions or handlers, so it can move into a standalone service later if a mobile app or heavy background processing appears. Revisit when Scope B is approved.

**Database:** decide only after Scope B. If needed: PostgreSQL (managed) with a typed query layer (Drizzle or Prisma), as a proposal only.
