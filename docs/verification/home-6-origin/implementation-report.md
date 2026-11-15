# §6 Our Origin — implementation and verification status

2026-11-16 (client date) · **SOURCE IMPLEMENTED; BUILD/BROWSER VERIFICATION INCOMPLETE**

Owner approved briefing (D-092). Implemented: two-column desktop image/story with nested Africa map; tablet image above story/map; mobile image → label/heading/copy → three indicators → map. Source uses existing components/tokens, extends shared defaults conservatively, retains safe approved paragraph, once-only 600ms reveals and reduced-motion/no-JS fallbacks. Our Story resolves to real `/#origin`; page itself remains planned. No push/deploy or baseline promotion.

## Checks actually run

| Check | Result |
|---|---|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `git diff --check` | PASS |
| `python3 scripts/generate-africa-map.py /tmp/rocktama-countries.geojson` | PASS: pinned checksum, 51 African features → two closed dissolved coastline rings, town point inside Nigeria |
| Temporary Node SSR harness using ReactDOMServer and TypeScript transpilation | PASS: labelled origin/h2, factual copy, three indicators, both registered unverified claims, decorative projected pin, visible server/no-JS markup, Our Story resolver → /#origin |
| Same SSR harness exercising `src` with temporary in-memory photo path/alt | PASS: actual img branch, cover style, responsive aspect variables, lazy/non-priority path. No repo photo added; no visual crop/layout claim |
| Simulated production build with synthetic delivery config | Expected rejection: all **9** unverified claims listed, including both origin indicators |
| `npm run build` (normal and escalated retries) | FAIL: Turbopack CSS worker cannot bind local port: `Operation not permitted (os error 1)` |
| `npm run verify:visual -- --section origin --no-build --save home-6-origin` | INCOMPLETE: 0 passed, 0 failed, 1 incomplete; production server cannot start without build; report.md saved, no screenshots |

Turbopack panic logs report `[project]/app/globals.css.css [app-client] (css)` → creating new process → binding to a port → EPERM. Escalated npm and direct Next retries did not resolve it. The visual server log says no production build was found. Do not interpret this as a successful build, functional run or pixel-accurate result.

## Remaining verification

In an environment permitting the required local worker/server/Chrome ports:

1. `npm run build`.
2. `npm run verify:visual -- --section origin --no-build --save home-6-origin` and personally inspect the 1440 reference comparison and all seven viewport screenshots. Then the full `npm run verify:visual -- --no-build` suite for shared-component/header/drawer regressions. Do not run `--approve`.
3. `npm run verify:functional` in all three delivery modes (script does this); origin journeys cover reveal initial/scroll/jump-past/reduced-motion/no-JS, desktop keyboard from shop, mobile drawer-to-anchor and enlarged text. Runtime outcomes are pending, not passes.
4. Inspect actual photo-fixture crop at both aspect ratios (temporary fixture removed after checks), 200% text, 400% zoom reflow, keyboard focus/anchor behaviour and assistive-technology structure. Confirm contrast with existing AA colour tokens. No image-distortion or layout-shift assertion is accepted until browser checks run.

The new Our Story live anchor intentionally changes drawer pending-label content. Review resulting drawer differences explicitly before baseline changes; preserve existing approved screenshots for now.

## Visual differences / limits

No new comparison image was produced, so no measured edge/height/typography accuracy is claimed. Source-calculated desktop image width at 1440 is about 633px versus reference ≈617px, and story starts about x705 versus ≈688; these are estimates to check, not browser measurements. Map width at 1440 is 176px versus reference ≈186px. Safe paragraph is shorter than reference scientific prose. Map uses accurate licensed coastline/projection rather than the mock's stylised geography; the pin denotes approximate Nanka town. No reference-specific scientific/mineral/taste prose added. Official photo/alt/crop and exact spring coordinate remain client inputs.

§5 remains untouched visually; 44px targets and Distributor Supply italics preserved, V-011 still open. §6 is not ready for visual acceptance until runtime verification and actual comparisons are available. Next section is §7 briefing only after §6 verification/review; §7 not started.
