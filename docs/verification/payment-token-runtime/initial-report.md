# Visual check: 2026-11-17T17-17-01

**Result:** FAIL · 9 passed · 1 failed · 0 incomplete · 0 info

Sections: checkout-pay-cancel, checkout-pay-expired · Viewports: mobile 375px

> Automated checks catch overflow, loading, console and regression problems. Reference comparison sheets are indicative (the reference is a scaled mock) and must be reviewed by a person; passing checks are not proof of pixel-perfect accuracy.

| Scope | Check | Status | Detail |
|---|---|---|---|
| checkout @mobile 375px | fonts loaded | PASS | loaded |
| checkout @mobile 375px | images loaded | PASS |  |
| checkout @mobile 375px | no horizontal overflow | PASS |  |
| checkout @mobile 375px | no console errors | PASS |  |
| checkout-pay-cancel @mobile 375px | cancelling returns to the payment page with the order and basket intact | PASS |  |
| checkout-pay-cancel @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-cancel @mobile 375px | no console errors | FAIL | Error: Route "/checkout/pay/test": Next.js encountered the unstable value `Date.now()` while prerendering.

This value can change between renders, so it must be either prerendered or computed later.

Ways to fix this:
  - [dynamic] Render at request time by adding a dynamic data access (e.g. `await  |
| checkout-pay-expired @mobile 375px | without a pending order the payment page explains and links back to checkout | PASS |  |
| checkout-pay-expired @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-expired @mobile 375px | no console errors | PASS |  |
