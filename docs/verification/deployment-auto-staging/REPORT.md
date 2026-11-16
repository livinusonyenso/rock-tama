# Automatic staging build verification — 2026-11-16

Owner requested removing the fatal missing-enquiry configuration error. D-100 makes incomplete deployments automatically use staging behaviour (warnings + noindex), instead of requiring the missing DEPLOY_MODE=staging setting. The subsequent claim guard also warns; no evidence statuses change. Explicit DEPLOY_MODE=production retains strict delivery and claim checks. Ready automatic configuration returns normal indexable output.

Checks run: lint and TypeScript pass; `node scripts/deployment-config-check.cjs` passes six actual-config cases (automatic missing config warning/noindex, explicit staging, strict missing-delivery rejection, strict pending-claims rejection, ready strict config, ready auto config). Fixture claim statuses are mutated only in process memory and restored; real source statuses unchanged. No messages sent.

`VERCEL_ENV=production node /tmp/rocktama-webpack-diagnostic.cjs` builds/prerenders all 14 routes successfully, with missing delivery and pending-claim warnings; log saved alongside this report. This is the previously documented styled Webpack diagnostic, not a default Turbopack pass. Temporary webpack hook restored exactly. No dependency, form delivery or UI changes; no browser recapture needed for config-only change.

For current Vercel preview: leave DEPLOY_MODE unset or set staging. If currently set to production, remove/change it for preview, because that mode deliberately remains strict. After this commit is pushed, redeploy to use it. No push or deployment executed here. Actual email delivery still requires ENQUIRY_DELIVERY=resend, RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM; unconfigured runtime continues to show an honest error.
