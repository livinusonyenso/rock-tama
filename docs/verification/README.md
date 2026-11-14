# Visual Verification Records

Evidence images from browser verification, plus the log of known differences from the reference that are deliberately deferred. Method: `docs/DEVELOPMENT_GUIDELINES.md` → "Visual verification method".

## Evidence

| Task | File | What it shows |
|---|---|---|
| M2.2 | `m2.2-announcement-vs-reference-1440.png` | Reference bar (scaled to 1440) vs implementation, full width + 2× detail |
| M2.2 | `m2.2-announcement-responsive.png` | Implementation at 375 / 768 / 1280 |

## Open visual differences (to fix in M2.7 "Header visual refinement")

Recorded at owner review of M2.2 (2026-11-15). **Do not fix ad hoc; address in M2.7.**

| ID | Area | Difference | Owner direction | Approach to evaluate in M2.7 |
|---|---|---|---|---|
| V-001 | Announcement bar: globe icon | Reference globe looks filled/solid; ours is Lucide `Globe` (outline) | Match it with a **suitable licensed SVG**, not an extra icon library | Find a permissively licensed filled globe SVG (record source + licence in `ASSET_SPECIFICATIONS.md`), add it to the `Icon` map as a custom icon |
| V-002 | Announcement bar: right-hand spacing | At 1440px the right group sits ~60px further from the edge than in the reference (the mock's right margin is narrower than its left; our container is symmetric) | Investigate a **local** alignment adjustment; **do not change the shared `Container` globally** | Compare against the header's right edge (cart icon) once the header exists, so bar and header align with each other; a local negative margin/padding override on the bar if justified |
| V-003 | Announcement bar: typography | Reference text looks slightly wider/heavier than Source Sans 3 | **Keep the approved font family.** Compare weight, letter spacing and size against the screenshot before changing anything | Measure glyph widths of the same words at 400/500 weight and small tracking values; adjust only within Source Sans 3 |
