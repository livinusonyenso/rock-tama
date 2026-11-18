# Homepage §7–§9 completion — 2026-11-16

**All nine homepage sections are implemented.** This pass adds Quality & Safety, Business Supply and the shared Footer under the owner's combined authorisation (D-095). No push/deployment or baseline promotion. Source commit follows the previously pushed `32e826d`; all earlier commits retained.

## What now works

- Quality band: reference-style sage surface, forest heading, four circled shared indicators, safe origin description and registered evidence-dependent labels. ISO output absent because no certificate is supplied or verified. Gate requires enabled configuration, verified claim, complete identity/scope and valid issue/expiry dates.
- Business banner: four existing enquiry segments, two-line 26px reference-style heading, gold CTA to working `/wholesale`. No export fulfilment promise; Events & Institutions is the fourth segment. Responsive auto-fit grid avoids squeezing at enlarged text.
- Footer: shared across home/shop/product/wholesale pages; existing stacked-light logo placeholder, labelled Shop/Company/Help navigation, live catalogue/Origin/Quality/Wholesale links, cached server copyright year and actual source location. Missing contact/help/policy pages are non-interactive text. Newsletter email/button disabled with “Newsletter coming soon”; no form, fake success or data collection. Social links omitted until official URLs exist.

Existing hero, carousel, product cards, Origin/map and enquiry logic preserved. Shared IconFeature old defaults unchanged; new compact/circled variants only. No dependency or permanent build-config changes.

## Checks actually run

| Check | Result |
|---|---|
| Lint + TypeScript | PASS |
| Styled diagnostic Webpack production build | PASS, all 14 routes generated; config restored byte-for-byte; `webpack-build.log` |
| `node scripts/certification-check.mjs` | PASS, 8 positive/negative certificate gates; synthetic fixtures only, no real claim status modified |
| Production-guard configuration check with synthetic delivery env | PASS, rejects all **13** unverified claims, including Quality/ISO |
| Full browser/functional dev-file run before final visual/text refinements | **777 passed, 4 failed, 0 incomplete**, `full-regression-report.md` |
| Final focused seven-width new-section, CTA, navigation, no-JS, reduced-motion and enlarged-text run | **200 passed, 2 failed, 0 incomplete**, `focused-final-report.md`; both failures are the existing global header text-stress issue below |
| Resend mock/provider error/rate-limit journeys | **40/40 PASS**, `functional-resend-mock.md` |
| Unconfigured delivery journeys | **31/31 PASS**, `functional-unconfigured.md` |

The full run covers existing carousel rotation/pauses, shop/product navigation, successful enquiry storage, no-JS submission, validation/provider error behaviour, Origin reveal/End/anchor paths and new supply/footer/Quality navigation. Subsequent changes were confined to new compact-label wrapping, footer word wrapping, quality inset/contrast and supply heading/grid; final focused checks cover those changes. No unchanged long-running carousel suite was repeated merely to inflate verification counts.

All tests use the styled diagnostic Webpack artifact because the previously investigated Turbopack loader-worker EPERM remains an environment limitation. Existing build scripts/config are unchanged; this is **not a default Turbopack build pass**. Details and normal-terminal verification commands remain in `../home-6-origin-review/RECOVERY_REPORT.md`.

## Remaining failed checks / limits

1. Existing **global header overflow at 200% root text**: +216px in mobile mode, +950px at desktop. It is still reported, not suppressed. New Quality/banner/footer text and Origin's own text pass their enlarged-text assertions after wrapping/grid fixes. Header code was not changed.
2. Full-run drawer screenshot differences: **3.79% at 320**, **0.60% at 375**, caused by Our Story and Quality becoming live anchors instead of pending rows. Approved images retained. Normal announcement/header screenshots remain **0.00%** against approved baselines at all seven widths.

No normal-size page overflow, console errors, broken images or new functional-journey failures were found in the completed runs. This is basic accessibility/responsive verification, not the whole M8 Lighthouse/performance/assistive-technology audit.

## Reference review and responsive captures

Desktop comparison sheets (reference, implementation, difference overlay):

- [Quality](quality-desktop-reference.png)
- [Supply](supply-desktop-reference.png)
- [Footer](footer-desktop-reference.png)

Whole homepage: [desktop](homepage-desktop.png), [mobile](homepage-mobile.png). Individual sections saved at 320/375/768/1024/1280/1366/1440: `quality-*`, `supply-*`, `footer-*` with small/mobile/tablet/laptop/large/hd/desktop suffixes. Captures inspected visually, including mobile reading order, tablet/footer grid and desktop reference sheets. Screenshots remain **unapproved**.

| Width | Quality height | Supply height | Footer height |
|---|---:|---:|---:|
| 320 | 454 | 481 | 800 |
| 375 | 435 | 443 | 749 |
| 768 | 274 | 282 | 540 |
| 1024 | 250 | 228 | 556 |
| 1280 | 148 | 229 | 246 |
| 1366 | 137 | 191 | 246 |
| 1440 | 137 | 137 | 246 |

At 1440 the approximate scaled reference heights are Quality 131, supply 109, footer 215px. Current differences reflect readable type, ≥44px CTA, accessible link spacing and explicit newsletter availability. Layout is content-led: intermediate widths may need more height as the banner segments wrap; no fixed height or truncation imposed.

Quality title starts around x112, versus reference ≈117. Certification/its manufacturing text and droplet bitmap texture are intentionally absent; safe description is shorter than the mock's scientific prose, and indicators use the vacated certificate space. Circles use existing Lucide icons rather than recreating artwork. Banner fourth segment is Events & Institutions rather than unverified export supply. Footer logo remains the existing placeholder; social icons absent without URLs; policies/contact text stays pending. Different typeface shapes/column proportions remain visible in the comparison overlays.

Quality eyebrow uses new gold-800 (#704a16): calculated contrast **6.26:1** on sage-100 and **5.04:1** on sage-200. The prior gold-700 did not meet AA at the dark endpoint, so its global value was preserved and a new token added only for this surface. New supply font token is 26px/1.15. Other colour/type tokens untouched.

## Launch inputs still required

Official logo/product/origin photography; lab/process/purity evidence and any applicable certificate; genuine Contact/Help/policy content and pages; newsletter provider/consent flow; official social destinations; real enquiry delivery configuration. No evidence was inferred from permission to build the layout. Existing 13-claim production guard stays enabled. Search/account/cart/checkout remain separately planned commerce scope, not fabricated by this homepage pass.

Documentation, decisions, progress, session handoff and Claude Code section skill updated. Next work is owner feedback/client inputs and M8 wider audit; no further homepage section needs a build briefing.
