# Homepage §6 — Our Origin implementation briefing

2026-11-16 · **[PROPOSED — implementation awaits explicit owner approval]**

## What / scope

Build the origin story of ROCK-TAMA natural spring water from Nanka, Anambra State, Nigeria. Primary spec: `reference/homepage-reference.png`, interpreted with `UI_BREAKDOWN.md` §06 and D-058 scaling (1440/1086 ≈ 1.326). This is a briefing only: no section, asset or route implementation in this task. §5 is functionally accepted; its screenshots remain provisional. No push or deployment.

## Desktop layout and reference measurements

Measurements below are approximate screenshot observations, not CSS constraints. Source image is 1086px wide. Section source y≈918–1105 (187px), equivalent ≈248px tall at 1440; its absolute page position will differ because earlier sections have residual height differences.

| Element | Reference pixels | Equivalent at 1440 / proposal |
|---|---|---|
| Landscape | x≈25–490, y≈935–1092; 465×157 | x≈33–650; ≈617×208; 3:1 slot |
| Copy start | x≈519, y≈935 | x≈688; ≈38px gap from image |
| Heading | ≈22px serif caps | ≈29px; use existing 30px scale, natural wrapping |
| Paragraph | ≈12.5px, four lines | ≈16.6px; existing 16px body with readable line height |
| Map | ≈140×150 | ≈186×199, bounded within container |
| Section top/bottom breathing room | ≈17/13px around image | ≈23/17px; start with existing 24/16 spacing |

**[PROPOSED]** Two main desktop columns from `lg` (1024): image ≈46%, story region takes remainder, gap 32–40px. Within the story region, copy and map sit side by side: the map occupies about 160–186px at wide desktop, with text/indicators allowed to extend beneath it where needed to match the reference. At 1024, reduce map to ≈128px and let indicators wrap. Use `Container size="wide"`, existing ivory/sand/forest/gold tokens, rounded-card and existing typography. The three observed visual regions do not require three equal columns. No fixed section height; ≈248px at 1440 is a comparison target, not a clipping boundary. Record any extra height required by readable copy and claim review status.

## Tablet and mobile

- Tablet 768–1023: full-width 3:1 landscape; below it a story row with text and ≈144px map; indicators wrap with 16–24px gaps. Section padding ≈32px, image-to-story gap 24px.
- Mobile 320–767: image → OUR ORIGIN → heading → paragraph → three indicators → map. Use 16:9 image, existing 16/24px container gutters, 24px major gaps, ≈32px section padding; map ≈128px centred, retained rather than hidden. Indicators become a vertical list; remove desktop dividers. No CSS order that disagrees with reading order.
- Use min-width:0, natural text wrapping, max-width:100%, intrinsic SVG ratio and no fixed content heights. At enlarged text, desktop may grow/wrap without overlap. Tablet/mobile are proposals because the supplied reference is desktop only.

## Complete component inventory / reuse

| Component | Boundary / responsibility | Work |
|---|---|---|
| `OriginSection` | New Server section, `id="origin"`, labelled by h2; composes media, story, indicators, map | Justified section responsibility; no generic section factory |
| `Container` | Existing Server width/gutters | Reuse unchanged |
| `MediaFrame` | Existing Server placeholder/next-image slot | Add optional fit, focal-position and responsive-aspect support; defaults unchanged for products/hero. Origin uses cover; reserve identical placeholder/photo box |
| `SectionHeading` | Existing Server eyebrow/h2 | Add minimal options for sentence-case source title with CSS caps, origin-sized heading and trailing eyebrow rule; defaults preserve §5. Avoid forcing existing 38px heading into narrow story column |
| `IconFeature` | Existing Server icon/label | Add inline layout, preserve stacked default and trust strip sizing. Origin uses light tone, smaller icon and no stacked-label minimum height |
| `Icon` / `IconName` | Existing Server Lucide mapping | Add map-pin, leaf, layers; decorative SVGs remain hidden from assistive technology |
| `AfricaMap` | New Server at `components/brand/AfricaMap.tsx` | Encapsulates licensed outline, viewBox and correctly projected static pin. Only className needed; no interactive map API |
| `Reveal` | Existing small Client island | Reuse for server-rendered children; section stays Server |
| Native paragraph / list / dividers | Semantic local markup | No new wrapper components |

Concepts: server composition keeps static content out of the client bundle; responsive aspect ratio reserves layout before loading; marker and outline must share one projection. Only Reveal needs browser APIs. No dependency additions.

## Copy and evidence

Heading data: **From Nanka, Anambra State.** Eyebrow: **OUR ORIGIN**.

Proposed factual paragraph: “ROCK-TAMA natural spring water originates from Nanka, Anambra State, Nigeria. This is where our story begins.” This uses the owner's supplied location without adding mineral, geological, safety, processing or environmental claims. Location indicator: “Nanka, Anambra State, Nigeria”.

Required labels “Naturally Protected Source” and “Preserved Natural Purity” are evidence-dependent, even though present in the screenshot. They must reference claim IDs, stay unverified and block production until evidenced. Proposed IDs: `naturallyProtectedSource` (site/hydrogeological evidence establishing natural protection) and `preservedNaturalPurity` (documented handling/process and relevant current analyses supporting preservation). Register now as unverified; never mark them verified based on design approval. During implementation render only through the existing registered-claim pattern, as with §4. Production release remains blocked; if evidence or wording is rejected, replace/omit only with owner agreement.

Do not reuse the reference's mineral-profile, smooth-taste or ancient-rock assertions. Existing `rockFiltered` remains unverified; adding it to origin is outside this proposed copy. Location is owner-supplied, not an exact spring survey coordinate.

## Image and map handling

Keep `src:null` with “Story Section Image (Landscape)” in a fixed-ratio MediaFrame; no fabricated source photography. Future official photo: planned `public/images/origin/nanka-source.webp`, ≥2400×1350 master outside public, lazy loaded via next/image; accurate sizes ≈617px at 1440, ≈46vw desktop, viewport minus gutters below lg. Confirm crop/focal point and alt text from the actual photo before swapping it in.

Map: retain D-021's Natural Earth 1:110m Admin 0 countries choice, dissolve African country polygons into an outline including Madagascar; no internal political boundaries. Source: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/ . Licence checked 2026-11-16: https://www.naturalearthdata.com/about/terms-of-use/ states vector data are public domain, commercial adaptation allowed, attribution optional. At implementation, record exact archive URL, dataset version, retrieval date, checksum and conversion/projection steps in ASSET_SPECIFICATIONS; add a source/notice beside the derived SVG path. Do not claim an asset has been acquired yet.

Source a reputable gazetteer coordinate for Nanka before implementation is completed and record that citation, coordinate precision and date; exact source-site coordinates remain client input. Project both outline and coordinate using the same documented projection/viewBox and anchor the pin tip to the projected point in southeastern Nigeria. Never eyeball the pin or use the reference pin's pixel position as geography. Pin denotes approximate town location, not a surveyed spring. Verify mainland Nigeria containment and Nanka/Anambra placement against an independent location reference. No map SDK or runtime fetch.

## Proposed animation storyboard

Reuse approved D-088 Reveal (600ms opacity + 16px rise, existing easing), triggered once as each below-viewport group enters. Image delay 0ms; eyebrow/heading/paragraph as one text group delay 80ms; indicators each 0/60/120ms when their own list enters (latest finishes 720ms). Avoid nesting reveals and accumulating text/list delays. Map, background and divider lines stay static; no pulse, parallax or looping. Reduced motion: immediately visible, no transforms/transitions; no JS/unsupported observer: visible by default. Jump-past/anchor navigation must never strand hidden content.

## Files to create / modify after approval

Create `components/home/OriginSection.tsx`, `components/brand/AfricaMap.tsx`. Extend `content/home.ts` with origin copy/media/claim IDs and location configuration; add only needed content types to `types/content.ts`. Modify `components/ui/{MediaFrame,SectionHeading,IconFeature}.tsx`, `components/icons/Icon.tsx` and IconName; `app/page.tsx` to compose §6; `content/routes.ts` to set origin built only when mounted. `ourStory` stays a planned page and resolves to `/#origin`; no added CTA or fake story page. `content/claims.ts` entries are documentation-stage registration now, later consumed by the section. Modify `app/globals.css` only for missing named token/aspect support (no change to global typography or Reveal defaults). Extend `scripts/visual-check.config.mjs` for origin and navigation journeys. Maintain architecture, asset, animation, checklist, progress, decisions, handoff and workflow skill records. No new photography asset until official supply.

## Risks / accessibility

One existing h1; origin h2 and labelled section; indicators in a ul. Placeholder decorative and visibly labelled; real photo alt based on content. Map decorative (`aria-hidden`, non-focusable) because readable location text supplies meaning. Pin is non-interactive. Small gold text uses gold-700; gold-600 only decorative. Check WCAG AA text contrast, 200% text and 400% zoom reflow, keyboard focus through newly live Our Story links and mobile drawer. Preserve existing touch targets. Risks: heading overflow in the nested story region, long indicator wording, cover-crop ambiguity, map pin anchor errors, shared primitive regressions and hiding content during restored scrolling. Test those directly.

## Test plan and acceptance criteria (not run for this planning task)

1. `npm run lint`, `npx tsc --noEmit`, `npm run build`; normal development build passes; simulated production build still rejects unverified claims including the two origin IDs.
2. `npm run verify:visual -- --section origin`; add deterministic settled, initial/reveal, jump-past, no-JS and reduced-motion cases. Verify no overflow, distortion, clipping, console errors or layout-box changes at 320/375/768/1024/1280/1366/1440. Review 1440 comparison against source crop y918–1105 scaled ×1.326; record measured deviations, especially section height, image edges, heading and pin.
3. Full `npm run verify:visual` checks shared primitive effects on hero, trust, cards, shop and wholesale; existing approved baselines unchanged unless separately approved. Save origin screenshots as provisional only; §5 remains provisional.
4. `npm run verify:functional` plus new desktop/mobile Our Story → actual origin anchor journeys (including from shop), close drawer/focus behaviour, no fake /our-story page. Verify location text and each required indicator/claim ID in server HTML.
5. Manual keyboard/accessibility inspection, text/zoom reflow, photo-fixture swap at both ratios (temporary fixture removed), map provenance/coordinate transformation review. Confirm no scientific claims outside registry and no implication that the pin identifies an exact spring.

Acceptance: all ten requested UI elements present; clear responsive reading order; reference composition recognisable; image box stable; accurate approximate-town marker with source; readable typography and AA contrast; approved motion mechanism with reduced-motion/no-JS fallbacks; no broken navigation or shared-component regressions. Automated pass is not visual approval. Report all remaining visual differences for owner review.

## Next step / approval

Approve this §6 scope, responsive proposals, restrained storyboard and safe paragraph before implementation. §7 Quality remains subsequent work. §5 visual approval is separate and stays pending.
