# M2.7 investigation (2026-11-15, before any code change)

All numbers measured, not estimated. Reference = `docs/reference/homepage-reference.png` (1086px wide); "@1440" = reference coordinates ×1.326.

## Why compare at 1440 (scaled) and not 1:1 at 1086
The reference's text sizes at 1086 are 10.5–13px (footer links 10.5px, nav ≈12.5px). Those are implausibly small for a production design. ×1.326 gives standard 14–17px sizes. So the mock is treated as a **downscaled ~1440px design**, and the primary comparison is at a 1440 viewport against the scaled reference.

## Content frame (V-002 / V-004 root cause)
Left/right extents in the reference (ref px; margins in brackets):

| Block | Left | Right |
|---|---|---|
| Product cards row | 21 (21) | 1063 (22) |
| Origin row | 24 (24) | 1056 (29) |
| Footer bottom bar | 35 (35) | 1048 (37) |
| Announcement bar content | **66** | 1062 (23) |
| Header row (logo … cart badge) | **70** | 1063 (22) |

→ The reference uses a **symmetric frame with ≈22px margins** (≈29px @1440, content ≈1382px). The bar and header end at that frame's right edge; only their **left items carry an extra ≈45–49px inset**. Our `wide` container (max 1320 incl. 32px padding → content 92–1348 @1440) is ≈62px narrower on each side than the reference frame. The logo matching at x≈92 was a coincidence of the two differences.

## Element positions @1440 (before)
| Element | Reference | Ours | Δ |
|---|---|---|---|
| Logo left | 93 | 92 | −1 |
| HOME start | 549 | 492 | −57 |
| Nav gap | ≈48 | 44 | −4 |
| CONTACT end | 1192 | 1121 | −71 |
| Divider x | 1231 | 1169 | −62 |
| Search icon (ink) | 1268–1288 | glyph in 1206–1232 box | ≈−60 |
| Cart + badge end | 1412 | 1358 | −54 |
| Bar: truck (ink) | 88–113 (w27) | 92–112 box (glyph ≈18) | size −9 |
| Bar: globe (ink) | 1162–1181 (w21) | outline icon | style |
| Bar: international text | 1197–1408 (w212) | 1130–1348 (w218) | −67 / −60 |

## Typography (V-003 / V-005): measured, weight is already right
Word widths @1440: HOME 44 vs 44, WHOLESALE 89 vs 90, OUR STORY 82 vs 84, QUALITY 62 vs 63, "International Enquiries Welcome" 212 vs 218.
Ink coverage (stroke density inside the word box):

| Text | Reference | Ours now | One weight heavier |
|---|---|---|---|
| WHOLESALE (nav) | 0.302 | 0.296 (500) | 0.334 (600, +11%) |
| International… (bar) | 0.202 | 0.207 (400) | 0.241 (500, +19%) |

The heavier look comes from the upscaled, slightly blurred mock and wider letter shapes, not from weight. Heavier weights would move us further away.

## Globe (V-001)
`globe-candidates.png`: reference crop vs Lucide (current), Heroicons `globe-alt` solid (MIT, Tailwind Labs, heroicons@2.2.0), Phosphor `globe` / `globe-simple` fill (MIT, Phosphor Icons, @phosphor-icons/core@2.1.1). Heroicons is the closest (filled disc with a latitude/longitude lattice).
