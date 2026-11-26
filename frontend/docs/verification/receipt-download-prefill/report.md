# Visual check: 2026-11-18T14-29-02

**Result:** PASS · 60 passed · 0 failed · 0 incomplete · 2 info

Sections: checkout-pay-success, checkout-pay-failed, checkout-pay-expired, checkout-account-prefill, checkout-saved-details, checkout-edit-saved-details, checkout-logout-clears-details, receipt-download-no-proof · Viewports: mobile 375px, desktop 1440px

> Automated checks catch overflow, loading, console and regression problems. Reference comparison sheets are indicative (the reference is a scaled mock) and must be reviewed by a person; passing checks are not proof of pixel-perfect accuracy.

| Scope | Check | Status | Detail |
|---|---|---|---|
| checkout @mobile 375px | fonts loaded | PASS | loaded |
| checkout @mobile 375px | images loaded | PASS |  |
| checkout @mobile 375px | no horizontal overflow | PASS |  |
| checkout @mobile 375px | no console errors | PASS |  |
| checkout-pay-success @mobile 375px | verified browser session downloads a private PDF receipt | PASS |  |
| checkout-pay-success @mobile 375px | test gateway is clearly labelled and charged the server-side total | PASS |  |
| checkout-pay-success @mobile 375px | confirmation shows the reference and empties the basket | PASS |  |
| checkout-pay-success @mobile 375px | a separate itemised TEST receipt is saved for the customer email | PASS |  |
| checkout-pay-success @mobile 375px | one TEST PAYMENT order notification is delivered with the items and amount | PASS |  |
| checkout-pay-success @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-success @mobile 375px | no console errors | PASS |  |
| checkout-pay-failed @mobile 375px | failed payment is reported honestly and the basket is kept | PASS |  |
| checkout-pay-failed @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-failed @mobile 375px | no console errors | PASS |  |
| checkout-pay-expired @mobile 375px | without a pending order the payment page explains and links back to checkout | PASS |  |
| checkout-pay-expired @mobile 375px | no horizontal overflow | PASS |  |
| checkout-pay-expired @mobile 375px | no console errors | PASS |  |
| checkout-account-prefill @mobile 375px | signed-in email is filled, unknown details are still requested | PASS |  |
| checkout-account-prefill @mobile 375px | no horizontal overflow | PASS |  |
| checkout-account-prefill @mobile 375px | no console errors | PASS |  |
| checkout-saved-details @mobile 375px | returning signed-in checkout uses a summary instead of repeated forms | PASS |  |
| checkout-saved-details @mobile 375px | no horizontal overflow | PASS |  |
| checkout-saved-details @mobile 375px | section visible | PASS | 375×2502 |
| checkout-saved-details @mobile 375px | no console errors | PASS |  |
| checkout-edit-saved-details @mobile 375px | editing restores prefilled fields | PASS |  |
| checkout-edit-saved-details @mobile 375px | no horizontal overflow | PASS |  |
| checkout-edit-saved-details @mobile 375px | no console errors | PASS |  |
| checkout-logout-clears-details @mobile 375px | logout restores guest checkout without previous contact data | PASS |  |
| checkout-logout-clears-details @mobile 375px | no horizontal overflow | PASS |  |
| checkout-logout-clears-details @mobile 375px | no console errors | PASS |  |
| receipt-download-no-proof @mobile 375px | unauthenticated receipt download is denied | PASS |  |
| receipt-download-no-proof @mobile 375px | no horizontal overflow | PASS |  |
| receipt-download-no-proof @mobile 375px | no console errors | PASS |  |
| checkout @desktop 1440px | fonts loaded | PASS | loaded |
| checkout @desktop 1440px | images loaded | PASS |  |
| checkout @desktop 1440px | no horizontal overflow | PASS |  |
| checkout @desktop 1440px | no console errors | PASS |  |
| checkout-pay-success @desktop 1440px | verified browser session downloads a private PDF receipt | PASS |  |
| checkout-pay-success @desktop 1440px | test gateway is clearly labelled and charged the server-side total | PASS |  |
| checkout-pay-success @desktop 1440px | confirmation shows the reference and empties the basket | PASS |  |
| checkout-pay-success @desktop 1440px | a separate itemised TEST receipt is saved for the customer email | PASS |  |
| checkout-pay-success @desktop 1440px | one TEST PAYMENT order notification is delivered with the items and amount | PASS |  |
| checkout-pay-success @desktop 1440px | no horizontal overflow | PASS |  |
| checkout-pay-success @desktop 1440px | no console errors | PASS |  |
| checkout-account-prefill @desktop 1440px | signed-in email is filled, unknown details are still requested | PASS |  |
| checkout-account-prefill @desktop 1440px | no horizontal overflow | PASS |  |
| checkout-account-prefill @desktop 1440px | no console errors | PASS |  |
| checkout-saved-details @desktop 1440px | returning signed-in checkout uses a summary instead of repeated forms | PASS |  |
| checkout-saved-details @desktop 1440px | no horizontal overflow | PASS |  |
| checkout-saved-details @desktop 1440px | section visible | PASS | 1440×1433 |
| checkout-saved-details @desktop 1440px | no console errors | PASS |  |
| checkout-edit-saved-details @desktop 1440px | editing restores prefilled fields | PASS |  |
| checkout-edit-saved-details @desktop 1440px | no horizontal overflow | PASS |  |
| checkout-edit-saved-details @desktop 1440px | no console errors | PASS |  |
| checkout-logout-clears-details @desktop 1440px | logout restores guest checkout without previous contact data | PASS |  |
| checkout-logout-clears-details @desktop 1440px | no horizontal overflow | PASS |  |
| checkout-logout-clears-details @desktop 1440px | no console errors | PASS |  |
| receipt-download-no-proof @desktop 1440px | unauthenticated receipt download is denied | PASS |  |
| receipt-download-no-proof @desktop 1440px | no horizontal overflow | PASS |  |
| receipt-download-no-proof @desktop 1440px | no console errors | PASS |  |
| checkout-saved-details @mobile 375px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| checkout-saved-details @desktop 1440px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
