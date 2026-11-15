# E-commerce Requirements (Scope B)

## Approved direction — D-024 (2026-11-14)

The target is a **real e-commerce website**, not a brochure with contact forms. There are two purchasing experiences:

| Retail customers (planned) | Wholesale and distributors (planned) |
|---|---|
| Product listing | Product and supply information |
| Product detail pages | Request Wholesale form |
| Shopping cart | Business and contact details |
| Checkout | Quantity requirements |
| Payment integration | Location and delivery requirements |
| Order confirmation | Enquiry submission and follow-up |
| Delivery information | |

**Sequencing (updated 2026-11-15, D-066):** the commercial CTAs must work, so `/wholesale` (F1) and `/shop` (F2) are built **during M3**; cart, checkout and payment follow progressively (F3–F4) as business data and integrations become available. Never fake a step.

**Still requires approval:** payment provider, pricing, currency, delivery rules/zones/fees, payment flow, guest vs. account checkout, order handling process, wholesale form fields and recipient, database choice.

## Shopping status (F2, 2026-11-15)

Working now: `/shop` listing → `/shop/<product>` → **Request this product** → enquiry form with the product preselected → delivered enquiry. Prices show "Price on request" (`price: null`). **Not yet:** cart (F3), checkout/payment/order confirmation (F4); these need prices, delivery rules and a payment provider. Sachet Water and Customised & Event Water are recorded in the catalogue as unconfirmed and are not offered (D-081).

## Configuring enquiry delivery (F1, live since 2026-11-15)

`/wholesale` works now. Locally, enquiries go to `.data/enquiries.jsonl` (git-ignored, contains personal data, development only). For production on Vercel, set these in the Vercel project (template: `.env.example`):

| Variable | Value |
|---|---|
| `ENQUIRY_DELIVERY` | `resend` |
| `RESEND_API_KEY` | API key from resend.com (secret) |
| `ENQUIRY_TO` | Recipient address(es), comma-separated |
| `ENQUIRY_FROM` | Sender on a domain verified in Resend, e.g. `ROCK-TAMA Enquiries <enquiries@your-domain>` |
| `ENQUIRY_RATE_LIMIT` | Optional (default 5 per 10 minutes) |

A Vercel **production** build fails if these are missing; preview deployments build, but their forms report an honest "could not be sent" error. **Still needed from the client:** recipient address(es), a sending domain to verify in Resend, the privacy notice (NDPA) before the form is public, and confirmation of the page copy in `content/wholesale.ts`.

## Business information and integrations required (launch dependencies, 2026-11-15)

| Needed | Unblocks | Interim behaviour (honest, configurable) |
|---|---|---|
| Product prices (NGN), pack sizes/variants, MOQ for wholesale | Cart totals, checkout (F3/F4) | Catalogue shows "Price on request"; purchase action submits an order request |
| Stock policy | Availability display | Treated as available on request |
| Delivery zones, fees, lead times | Checkout (F4) | Delivery location captured in enquiries |
| Payment provider choice + merchant account keys (e.g. Paystack / Flutterwave) | Payment (F4) | No payment step; nothing is charged |
| Enquiry/order recipient email(s) and a sending domain (or a chosen database + admin access) | Production delivery of enquiries (F1) | Local development store; **production build refuses to ship without configured delivery** (proposed) |
| Hosting target (e.g. Vercel) | Storage/runtime choices | — |
| Contact details (phone, email, address, WhatsApp) | Contact page (F5), footer | — |
| Newsletter provider + consent wording | F6 | — |
| Social media URLs | F8 | Icons not linked |
| Privacy notice (NDPA), Terms, Delivery & Returns, FAQs copy | F10; **required before public forms** | — |
| Official logo + product photography | Visual completion | Placeholders |
| Evidence for quality/process claims | Publication | Flagged |

## Detailed checklist (status of individual items still open)

The homepage (Scope A) can be built entirely without any of the items below.

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

**Answered (D-024):** full online ordering for retail plus a wholesale enquiry flow. Next step after the homepage: a requirements session to fill in the "Owner must confirm" column above.

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

## Homepage footer availability — D-095

Footer UI exists; no newsletter data is collected while provider/consent configuration is missing. Input/button are disabled and honestly labelled. Contact, FAQs, delivery/returns and legal destinations remain planned non-links until actual content/pages are supplied; social links await official URLs. Shop, Origin, Quality and Wholesale navigation are live. This UI pass does not implement checkout/payments/accounts or a newsletter backend.
