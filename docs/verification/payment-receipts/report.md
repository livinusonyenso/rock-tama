# Visual check: 2026-11-18T12-03-11

**Result:** PASS · 19 passed · 0 failed · 0 incomplete · 0 info

Sections: checkout-pay-success, checkout-pay-failed, checkout-pay-tampered, checkout-pay-expired · Viewports: mobile 375px

> Automated checks catch overflow, loading, console and regression problems. Reference comparison sheets are indicative (the reference is a scaled mock) and must be reviewed by a person; passing checks are not proof of pixel-perfect accuracy.

| Scope | Check | Status | Detail |
|---|---|---|---|
| checkout @mobile 375px | fonts loaded | PASS | loaded |
| checkout @mobile 375px | images loaded | PASS |  |
| checkout @mobile 375px | no horizontal overflow | PASS |  |
| checkout @mobile 375px | no console errors | PASS |  |
| checkout-pay-success @mobile 375px | test gateway is clearly labelled and charged the server-side total | PASS |  |
| checkout-pay-success @mobile 375px | confirmation shows the reference and empties the basket | PASS |  |
| checkout-pay-success @mobile 375px | a separate itemised TEST receipt is saved for the customer email | PASS |  |
| checkout-pay-success @mobile 375px | one TEST PAYMENT order notification is delivered with the items and amount | PASS |  |
| checkout-pay-success @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-success @mobile 375px | no console errors | PASS |  |
| checkout-pay-failed @mobile 375px | failed payment is reported honestly and the basket is kept | PASS |  |
| checkout-pay-failed @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-failed @mobile 375px | no console errors | PASS |  |
| checkout-pay-tampered @mobile 375px | a forged or unknown payment is never shown as successful | PASS |  |
| checkout-pay-tampered @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-tampered @mobile 375px | no console errors | PASS |  |
| checkout-pay-expired @mobile 375px | without a pending order the payment page explains and links back to checkout | PASS |  |
| checkout-pay-expired @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-expired @mobile 375px | no console errors | PASS |  |
