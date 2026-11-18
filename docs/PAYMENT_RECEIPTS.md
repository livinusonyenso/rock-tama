# Customer payment receipts — 2026-11-18

After a server-verified successful payment, ROCK-TAMA now sends two separate messages: the existing business order notification and an itemised receipt to the customer's checkout email. No receipt is issued for failed, pending or invalid payments, or an unverified bank-transfer claim. Callback, signed webhook and built-in test gateway share notifyPaidOrder. The confirmation Server Component remains read-only.

The receipt has plain-text and branded HTML versions with customer name, payment/order reference, verified provider payment date when available, item quantities/prices, verified NGN total and delivery address. Delivery fee is explicitly excluded. Customer-provided HTML is escaped. The same receipt is now also attached as a PDF and downloadable after payment; see RECEIPT_DOWNLOAD_AND_CHECKOUT_PREFILL.md. Test receipts say TEST / no money charged / not proof of payment.

## Delivery and retry handling

Reuses ENQUIRY_DELIVERY=resend, RESEND_API_KEY, ENQUIRY_FROM (verified sender) and ENQUIRY_TO (business recipient). The customer is the receipt recipient; the business address is not reused as the customer recipient. No provider credentials enter client code. No additional email library.

Concurrent confirmations share an in-flight promise. Merchant notification and receipt have separate success markers, so failure of one channel can retry without resending the successful channel within the instance. Receipt transport uses a stable Resend Idempotency-Key, payment-receipt/<reference>, and a stable payload. Resend deduplicates for24hours; this is not permanent cross-instance exactly-once delivery. See https://resend.com/docs/dashboard/emails/idempotency-keys . A future database/outbox can extend durable delivery history. Merchant notification's existing cross-instance deduplication limits are unchanged.

The webhook returns500 until both adapters accept delivery, allowing existing Paystack retries. Email failure does not change verified payment status, and API acceptance does not guarantee inbox placement. Customer success pages do not falsely assert that email has arrived.

Local development writes one preview JSON per payment to ignored `.data/payment-receipts/<reference>.json`; duplicate references do not overwrite it. This does not send email. Real receipt sending needs a verified sender and Resend configuration. Those settings are currently absent locally.

## Supplied Paystack test credentials

User-provided test secret/public credentials are stored only in ignored `.env.local` with restrictive file permissions. No key values are recorded here. Hosted Paystack uses the server secret; the supplied public key is retained locally and is not exposed unnecessarily. No live key was installed. Test checkout initialization and a read-only transaction lookup returned HTTP403; acceptance of the credentials could not be established from this environment. No card/payment was submitted. Do not report the keys as verified.

Managed browser verification now explicitly empties PAYSTACK_SECRET_KEY, overriding .env.local loading, so tests cannot accidentally hit the developer's gateway. Existing live developer server is untouched by that override. Rebuild/restart outside local development after environment changes as normal; configure Paystack's signed webhook callback before launch.

## Verification

Receipt logic tests pass: recipient, amount/itemisation, HTML escaping, test labelling, stable idempotency payload, local preview, provider failure, concurrent confirmations, independent retries and rejection of non-paid inputs. Browser19/19 tests include actual local customer receipt generation and failed/invalid/expired flows; mock Resend7/7 verifies separate customer and merchant emails through the HTTP transport. Final mock run also passes with supplied keys present in ignored local settings, proving managed test isolation. Lint/TypeScript and styled diagnostic Webpack build pass; temporary config restored. Default Turbopack production build is not claimed verified.

Email preview inspected in Chrome: verification/payment-receipts/receipt-preview.html and receipt-preview.png. Reports in verification/payment-receipts and payment-receipts-resend. No real email was sent, money charged, push or deployment performed.
