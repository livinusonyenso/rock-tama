# Visual Verification Records

Run `npm run verify:visual` (how and when: `docs/DEVELOPMENT_GUIDELINES.md` → "Visual verification"). This folder holds **curated, committed** material only:

- `baselines/`: **approved** section screenshots per viewport (D-042). Current: `announcement-*` and `header-*` (all 7 widths), `mobile-nav-open-{small,mobile,tablet}` (approved 2026-11-15, D-080). Drawer baselines **re-approved 2026-11-16 after F2** (owner): differences confirmed to start at the Shop row (y=148 at all widths; header and Home rows identical) and all 69 drawer interaction/accessibility checks passed. Previous baselines kept in `baselines-history/mobile-nav-open-*.pre-f2.png`.
- `provisional/`: none at present (header and drawer references were promoted).
- `<task>/`: optional evidence saved with `--save <task>`.
- the earlier evidence images and the open-differences log below.

Generated run output (`.verification/`) is git-ignored.

## Evidence

| Task | File | What it shows |
|---|---|---|
| M2.2 | `m2.2-announcement-vs-reference-1440.png` | Reference bar (scaled to 1440) vs implementation, full width + 2× detail |
| M2.2 | `m2.2-announcement-responsive.png` | Implementation at 375 / 768 / 1280 |
| M2.4 | `m2.4/header-desktop-reference.png`, `m2.4/report.md` | Header vs reference at 1440 (saved with `--save m2.4`). **Header baselines not yet approved** (awaiting owner review) |
| M2.7 | `m2.7-investigation/`, `m2.7-before/`, `m2.7-after/` (`before-after-1440.png`, `after-1366.png`, `after-1280.png`, `sections/`, `report.md`) | Measured investigation; full before/after sets at 320–1440 incl. drawer states; V-008 sweep + 1359/1360 images. **Awaiting owner visual approval; baselines not promoted** |
| F2 | `f2/` | Shop, product page, Shop menu, mobile drawer with Shop list, hero carousel (desktop/mobile/carton slide), functional + visual reports |
| §4 Trust strip | `home-4-trust/` | Reference vs implementation @1440, responsive 320/375/768, report |
| §5 Our Products | `home-5-products/` | Reference vs implementation @1440, sections at 320/375/768/1024/1440, functional + visual reports. **No baseline yet** (awaiting owner review) |
| Wholesale landing | `wholesale-landing/` | Desktop/tablet/mobile + functional reports (D-076) |
| F1 | `f1/` (`wholesale-and-drawer.png`, `functional-*.md`) | /wholesale desktop + mobile, drawer with live Wholesale; functional reports for all 3 delivery modes |
| M3.3 | `m3.3/` (`hero-animation-initial-*.png` = frozen t=0, `hero-desktop.png` = final, `hero-reduced-motion-desktop.png`, `report.md`) | Entrance animation states; final = static hero (≤0.01%) |
| M3.2 | `m3.2/` (`hero-desktop-reference.png`, `hero-responsive.png`, `sections/`) | Static hero vs reference @1440; 320/375/768/1024/1280 layouts |
| M2.6 | `m2.6/` | Open drawer at 320 / 375 / 768, the 320px page with header, and the full run report (119 checks) |
| M2.3 | `m2.3-logo-placeholders-1440-375.png` | Header (ivory) and footer (forest) logo placeholders, rendered in a temporary harness at 1440 and 375 |

## Visual differences log (status after M2.7, 2026-11-15)

V-001–V-005 were recorded at the M2.2/M2.4 reviews and handled in M2.7. Positions are @1440 vs the reference scaled ×1.326.

| ID | Status after M2.7 |
|---|---|
| V-001 | **Resolved:** filled globe (Heroicons, MIT; D-061) |
| V-002 / V-004 | **Resolved:** root cause was a too-narrow `wide` token + the reference's left-only header inset; corrected (D-059, D-060). Logo −1, divider −2, icons ≤2, badge −1, bar truck +1 / text end −1 px |
| V-003 / V-005 | **Closed, no change:** weights already match by stroke density (D-062) |
| V-006 | **Open, accepted residual:** nav word centres −8/−5/0/+3/+5/+1 and bar globe/text start −6 px, caused by Source Sans 3 letter widths (CONTACT 12px narrower, "International…" 6px wider than the reference face). Only a font change would remove it, which is out of scope |
| V-007 | **Open, minor:** bar truck ink 22px vs 26px; truck and globe share one icon size (globe matches at 20 vs 21) |
| V-008 | **Resolved (D-064):** the 60px step at 1359→1360 is replaced by a fluid `clamp()` inset; max step between adjacent widths 1px. Evidence: `m2.7-after/v008-logo-position-sweep.png`, `m2.7-after/v008-1359-vs-1360.png` |
| V-009 | **Open, minor (from M2.6):** at 320px "Our Story" wraps to two lines in the drawer next to its COMING SOON tag; disappears when the route goes live |
| V-010 | **Open, minor:** trust strip "Pathogens Absent" uses Lucide `bug-off`; the reference shows a crossed-out microbe in a circle (custom artwork would be needed) |
| V-011 | **Open (§5), visual approval withheld (D-090):** historical 496px vs ≈448px reference. Spacing/card investigation and additional visual differences: `home-5-products/height-review.md`. Button size alone does not account for 48px; preserve 44px targets and readability. No UI change or baseline promotion. |
| — | Deliberate: `gold-700` underline/badge (D-043); logo is a placeholder until the official SVG |

Original entries:

| ID | Area | Difference | Owner direction | Approach to evaluate in M2.7 |
|---|---|---|---|---|
| V-001 | Announcement bar: globe icon | Reference globe looks filled/solid; ours is Lucide `Globe` (outline) | Match it with a **suitable licensed SVG**, not an extra icon library | Find a permissively licensed filled globe SVG (record source + licence in `ASSET_SPECIFICATIONS.md`), add it to the `Icon` map as a custom icon |
| V-002 | Announcement bar: right-hand spacing | At 1440px the right group sits ~60px further from the edge than in the reference (the mock's right margin is narrower than its left; our container is symmetric) | Investigate a **local** alignment adjustment; **do not change the shared `Container` globally** | Compare against the header's right edge (cart icon) once the header exists, so bar and header align with each other; a local negative margin/padding override on the bar if justified |
| V-004 | Header: right cluster position | Nav + divider + icons end at x≈1355 vs ≈1410 in the reference at 1440 (same symmetric-container cause as V-002; the bar and header right edges align with each other, as in the reference) | Same as V-002: local adjustment, not a global `Container` change | Resolve together with V-002 so the bar and header stay aligned |
| V-005 | Header: nav text weight | Reference nav text looks slightly heavier than Source Sans 3 500 | Keep the font family | Compare 500 vs 600 at `xl:text-base` |
| V-003 | Announcement bar: typography | Reference text looks slightly wider/heavier than Source Sans 3 | **Keep the approved font family.** Compare weight, letter spacing and size against the screenshot before changing anything | Measure glyph widths of the same words at 400/500 weight and small tracking values; adjust only within Source Sans 3 |
