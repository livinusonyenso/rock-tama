# Payment token request-time fix — 2026-11-17

The actual Next development log reported an unstable Date.now() read while prerendering `/checkout/pay`. The highlighted line in readPayload is the valid expiry check, not a reason to remove expiry enforcement.

Added `await connection()` to readPendingOrder before reading/validating the order cookie. The same live cancellation journey then exposed the identical error at `/checkout/pay/test`; added explicit request boundaries inside its existing Suspense child and the payment-result Suspense child, both of which synchronously validate expiring test tokens. The shared synchronous token helper and HMAC/expiry semantics are unchanged. No use-cache timestamp, client validation, global caching disable or dependency upgrade.

Official guidance: https://nextjs.org/docs/messages/blocking-prerender-current-time — defer unstable clock reads using connection within Suspense. The page shells keep their existing fallback/UI; only token-dependent content is request-bound.

Verification: live Turbopack development checkout cancellation, failed payment/result and expired-session journeys13/13 with no console errors. Initial targeted run9pass/1fail exposed the test-gateway path and is retained as initial-report.md. Pure signed-token checks cover valid-before-expiry, invalid-at-exact-expiry, bad secret, tampering, malformed input and signed invalid JSON. Lint/TypeScript pass; styled diagnostic Webpack production build passes, temporary config restored exactly. Default Turbopack production build is not claimed. No real payment, order notification, push or deployment.
