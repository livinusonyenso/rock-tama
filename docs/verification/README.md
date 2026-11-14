# Visual Verification Records

Run `npm run verify:visual` (how and when: `docs/DEVELOPMENT_GUIDELINES.md` → "Visual verification"). This folder holds **curated, committed** material only:

- `baselines/`: **approved** section screenshots per viewport, used for regression checks. Updated only with `--approve` after review (D-042). Current: `announcement-{mobile,tablet,laptop,desktop}.png` (from the accepted M2.2 state, captured 2026-11-15 on macOS Chrome).
- `provisional/`: **provisional, NOT approved** regression references (D-049). Current: `header-{laptop,desktop}.png` (from the accepted M2.4 run `6132526`); `header-{small,mobile,tablet}.png` and `mobile-nav-open-{small,mobile,tablet}.png` (from M2.6, pending owner review). Replace with approved baselines after owner acceptance (header: after V-004/V-005 in M2.7).
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
| — | Deliberate: `gold-700` underline/badge (D-043); logo is a placeholder until the official SVG |

Original entries:

| ID | Area | Difference | Owner direction | Approach to evaluate in M2.7 |
|---|---|---|---|---|
| V-001 | Announcement bar: globe icon | Reference globe looks filled/solid; ours is Lucide `Globe` (outline) | Match it with a **suitable licensed SVG**, not an extra icon library | Find a permissively licensed filled globe SVG (record source + licence in `ASSET_SPECIFICATIONS.md`), add it to the `Icon` map as a custom icon |
| V-002 | Announcement bar: right-hand spacing | At 1440px the right group sits ~60px further from the edge than in the reference (the mock's right margin is narrower than its left; our container is symmetric) | Investigate a **local** alignment adjustment; **do not change the shared `Container` globally** | Compare against the header's right edge (cart icon) once the header exists, so bar and header align with each other; a local negative margin/padding override on the bar if justified |
| V-004 | Header: right cluster position | Nav + divider + icons end at x≈1355 vs ≈1410 in the reference at 1440 (same symmetric-container cause as V-002; the bar and header right edges align with each other, as in the reference) | Same as V-002: local adjustment, not a global `Container` change | Resolve together with V-002 so the bar and header stay aligned |
| V-005 | Header: nav text weight | Reference nav text looks slightly heavier than Source Sans 3 500 | Keep the font family | Compare 500 vs 600 at `xl:text-base` |
| V-003 | Announcement bar: typography | Reference text looks slightly wider/heavier than Source Sans 3 | **Keep the approved font family.** Compare weight, letter spacing and size against the screenshot before changing anything | Measure glyph widths of the same words at 400/500 weight and small tracking values; adjust only within Source Sans 3 |
