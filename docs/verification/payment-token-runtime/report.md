# Visual check: 2026-11-17T17-18-58

**Result:** PASS · 13 passed · 0 failed · 0 incomplete · 0 info

Sections: checkout-pay-failed, checkout-pay-cancel, checkout-pay-expired · Viewports: mobile 375px

> Automated checks catch overflow, loading, console and regression problems. Reference comparison sheets are indicative (the reference is a scaled mock) and must be reviewed by a person; passing checks are not proof of pixel-perfect accuracy.

| Scope | Check | Status | Detail |
|---|---|---|---|
| checkout @mobile 375px | fonts loaded | PASS | loaded |
| checkout @mobile 375px | images loaded | PASS |  |
| checkout @mobile 375px | no horizontal overflow | PASS |  |
| checkout @mobile 375px | no console errors | PASS |  |
| checkout-pay-failed @mobile 375px | failed payment is reported honestly and the basket is kept | PASS |  |
| checkout-pay-failed @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-failed @mobile 375px | no console errors | PASS |  |
| checkout-pay-cancel @mobile 375px | cancelling returns to the payment page with the order and basket intact | PASS |  |
| checkout-pay-cancel @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-cancel @mobile 375px | no console errors | PASS |  |
| checkout-pay-expired @mobile 375px | without a pending order the payment page explains and links back to checkout | PASS |  |
| checkout-pay-expired @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-expired @mobile 375px | no console errors | PASS |  |
