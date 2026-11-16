# Visual check: 2026-11-16T10-50-27

**Result:** PASS · 40 passed · 0 failed · 0 incomplete · 0 info

Sections: wholesale-resend-success, wholesale-resend-failure, wholesale-rate-limit · Viewports: small 320px, mobile 375px, tablet 768px, laptop 1024px, large 1280px, hd 1366px, desktop 1440px

> Automated checks catch overflow, loading, console and regression problems. Reference comparison sheets are indicative (the reference is a scaled mock) and must be reviewed by a person; passing checks are not proof of pixel-perfect accuracy.

| Scope | Check | Status | Detail |
|---|---|---|---|
| wholesale @small 320px | fonts loaded | PASS | loaded |
| wholesale @small 320px | images loaded | PASS |  |
| wholesale @small 320px | no horizontal overflow | PASS |  |
| wholesale @small 320px | no console errors | PASS |  |
| wholesale @mobile 375px | fonts loaded | PASS | loaded |
| wholesale @mobile 375px | images loaded | PASS |  |
| wholesale @mobile 375px | no horizontal overflow | PASS |  |
| wholesale @mobile 375px | no console errors | PASS |  |
| wholesale-resend-success @mobile 375px | success shown | PASS |  |
| wholesale-resend-success @mobile 375px | Resend API called correctly (auth, to, reply_to, subject with reference) | PASS |  |
| wholesale-resend-success @mobile 375px | no horizontal overflow | PASS |  |
| wholesale-resend-success @mobile 375px | no console errors | PASS |  |
| wholesale-resend-failure @mobile 375px | provider failure shows an honest error, not success | PASS |  |
| wholesale-resend-failure @mobile 375px | typed values kept for retry | PASS |  |
| wholesale-resend-failure @mobile 375px | provider was actually called | PASS |  |
| wholesale-resend-failure @mobile 375px | no horizontal overflow | PASS |  |
| wholesale-resend-failure @mobile 375px | no console errors | PASS |  |
| wholesale-rate-limit @mobile 375px | 6th submission within 10 minutes is refused | PASS |  |
| wholesale-rate-limit @mobile 375px | no horizontal overflow | PASS |  |
| wholesale-rate-limit @mobile 375px | no console errors | PASS |  |
| wholesale @tablet 768px | fonts loaded | PASS | loaded |
| wholesale @tablet 768px | images loaded | PASS |  |
| wholesale @tablet 768px | no horizontal overflow | PASS |  |
| wholesale @tablet 768px | no console errors | PASS |  |
| wholesale @laptop 1024px | fonts loaded | PASS | loaded |
| wholesale @laptop 1024px | images loaded | PASS |  |
| wholesale @laptop 1024px | no horizontal overflow | PASS |  |
| wholesale @laptop 1024px | no console errors | PASS |  |
| wholesale @large 1280px | fonts loaded | PASS | loaded |
| wholesale @large 1280px | images loaded | PASS |  |
| wholesale @large 1280px | no horizontal overflow | PASS |  |
| wholesale @large 1280px | no console errors | PASS |  |
| wholesale @hd 1366px | fonts loaded | PASS | loaded |
| wholesale @hd 1366px | images loaded | PASS |  |
| wholesale @hd 1366px | no horizontal overflow | PASS |  |
| wholesale @hd 1366px | no console errors | PASS |  |
| wholesale @desktop 1440px | fonts loaded | PASS | loaded |
| wholesale @desktop 1440px | images loaded | PASS |  |
| wholesale @desktop 1440px | no horizontal overflow | PASS |  |
| wholesale @desktop 1440px | no console errors | PASS |  |
