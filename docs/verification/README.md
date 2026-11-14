# Visual Verification Records

Run `npm run verify:visual` (how and when: `docs/DEVELOPMENT_GUIDELINES.md` → "Visual verification"). This folder holds **curated, committed** material only:

- `baselines/`: **approved** section screenshots per viewport, used for regression checks. Updated only with `--approve` after review (D-042). Current: `announcement-{mobile,tablet,laptop,desktop}.png` (from the accepted M2.2 state, captured 2026-11-15 on macOS Chrome).
- `<task>/`: optional evidence saved with `--save <task>`.
- the earlier evidence images and the open-differences log below.

Generated run output (`.verification/`) is git-ignored.

## Evidence

| Task | File | What it shows |
|---|---|---|
| M2.2 | `m2.2-announcement-vs-reference-1440.png` | Reference bar (scaled to 1440) vs implementation, full width + 2× detail |
| M2.2 | `m2.2-announcement-responsive.png` | Implementation at 375 / 768 / 1280 |
| M2.4 | `m2.4/header-desktop-reference.png`, `m2.4/report.md` | Header vs reference at 1440 (saved with `--save m2.4`). **Header baselines not yet approved** (awaiting owner review) |
| M2.3 | `m2.3-logo-placeholders-1440-375.png` | Header (ivory) and footer (forest) logo placeholders, rendered in a temporary harness at 1440 and 375 |

## Open visual differences (to fix in M2.7 "Header visual refinement")

Recorded at owner review of M2.2 (2026-11-15). **Do not fix ad hoc; address in M2.7.**

| ID | Area | Difference | Owner direction | Approach to evaluate in M2.7 |
|---|---|---|---|---|
| V-001 | Announcement bar: globe icon | Reference globe looks filled/solid; ours is Lucide `Globe` (outline) | Match it with a **suitable licensed SVG**, not an extra icon library | Find a permissively licensed filled globe SVG (record source + licence in `ASSET_SPECIFICATIONS.md`), add it to the `Icon` map as a custom icon |
| V-002 | Announcement bar: right-hand spacing | At 1440px the right group sits ~60px further from the edge than in the reference (the mock's right margin is narrower than its left; our container is symmetric) | Investigate a **local** alignment adjustment; **do not change the shared `Container` globally** | Compare against the header's right edge (cart icon) once the header exists, so bar and header align with each other; a local negative margin/padding override on the bar if justified |
| V-004 | Header: right cluster position | Nav + divider + icons end at x≈1355 vs ≈1410 in the reference at 1440 (same symmetric-container cause as V-002; the bar and header right edges align with each other, as in the reference) | Same as V-002: local adjustment, not a global `Container` change | Resolve together with V-002 so the bar and header stay aligned |
| V-005 | Header: nav text weight | Reference nav text looks slightly heavier than Source Sans 3 500 | Keep the font family | Compare 500 vs 600 at `xl:text-base` |
| V-003 | Announcement bar: typography | Reference text looks slightly wider/heavier than Source Sans 3 | **Keep the approved font family.** Compare weight, letter spacing and size against the screenshot before changing anything | Measure glyph widths of the same words at 400/500 weight and small tracking values; adjust only within Source Sans 3 |
