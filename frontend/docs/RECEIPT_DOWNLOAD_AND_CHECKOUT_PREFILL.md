# Receipt downloads and signed-in checkout — 2026-11-18

## Completed behaviour

A verified successful payment now shows **Download receipt (PDF)**. The receipt email also includes the same generated PDF as an attachment, retaining readable HTML and plain text. Failed/pending/unverified bank-transfer claims do not receive paid receipts. Test PDFs and emails explicitly state no money was charged.

Download is a normal POST form, so it does not require client JavaScript or put the signed test token into a second URL. The callback/test-success action issues a signed httpOnly browser proof containing only the payment reference, valid for one hour. The endpoint requires matching proof and re-verifies paid status before returning `application/pdf`, an attachment filename and private/no-store headers. Arbitrary references, missing/expired proof and unverified payments are rejected. Test gateway tokens may expire sooner than the download proof. Proof grants only this receipt download; it is not distributor authentication. The email attachment remains usable after the browser download session ends.

The small dependency-free PDF writer uses A4 pages, a forest-green brand heading, wrapped text and pagination. Standard PDF fonts use explicit NGN amounts; unsupported glyphs are normalized to available Latin characters or `?`. HTML/plain-text email preserves original Unicode. International-script fidelity would require an embedded Unicode font in a future enhancement. PDF strings are escaped and have no executable PDF actions. This is a payment receipt, not a VAT/tax invoice or PDF/UA-certified document.

## Signed-in details

Current login is still an owner-authorised demo, not the future Express authentication service. Its only initially known customer field is email. Checkout automatically fills that email and asks for missing name, phone and address once. After valid checkout submission, the six contact/address fields are stored in a signed httpOnly, SameSite=Lax cookie for up to eight hours, bound to that demo-session email. Notes and payment-card data are not saved.

Subsequent checkout, including after a successful payment, displays an editable contact/address summary instead of six repeated fields. Guests retain the full form. Unknown details are never invented. Consent is not automatically checked. Logout and starting a new demo login clear the saved-details cookie, preventing data from a previous login from appearing. This is a same-browser demo-session convenience, not a persistent customer database. Express integration should replace the identity/profile reader with the actual authenticated customer profile.

Shared `checkoutDetailsSchema` validates both checkout submissions and stored profile reads. A request-bound Suspense island reads cookies; the page banner/shell retain their layout. Cookie-dependent expiry reads use connection(), consistent with the earlier clock fix. Existing server basket re-pricing and payment validation remain authoritative.

## Verification

- Main browser run60/60: PDF download/headers, emailed local PDF copy, guest flows, prefill, saved-summary/editing, logout and denied download without proof (mobile375 and desktop1440).
- Repeat-order run14/14: signed-in customer completes a test payment, starts another order and reuses details.
- Mock email run7/7: actual transport includes the PDF attachment to the checkout recipient, separate from the merchant email.
- Receipt tests verify emailed PDF bytes match generated download bytes. Profile/access tests cover owner isolation, tampering, expiry, cookie flags and paid re-verification.
- Native macOS PDFKit parses the generated PDF and extracts its reference and amount. Rendered PNG inspected; saved-checkout desktop and mobile captures retained. No additional dependency installed.
- Lint, TypeScript and styled diagnostic Webpack build pass; temporary config restored. Default Turbopack production build is not claimed.

Evidence: `verification/receipt-download-prefill`, `receipt-repeat-order`, `receipt-pdf-email`. PDF preview: `verification/receipt-download-prefill/receipt-download.pdf` and PNG. Screenshots remain provisional.

No real money or real email was sent during verification. Tests isolate the supplied Paystack credentials. Real email sending still needs Resend credentials/verified sender; the prior Paystack HTTP403 validation blocker remains unresolved. No push or deployment.
