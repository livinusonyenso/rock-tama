# Homepage §7 — Quality & Safety briefing

2026-11-16 · **PROPOSED — no implementation approval**

## What / why

Build the reference's compact sage quality band after Origin, using existing layout, heading, icon-feature and motion components. This is preparation only. §6 browser testing can proceed with the styled Webpack diagnostic artifact; the default Turbopack build remains environmentally blocked and §5/§6 visual approval remains pending. No §7 component, content configuration, route flag or badge is implemented by this briefing.

Primary reference: `reference/homepage-reference.png`, `UI_BREAKDOWN.md` §07; approximate measurements use D-058 scale 1440/1086. Preserve the composition while treating every scientific, process and certification statement as evidence-dependent, never verified by its appearance in the mock.

## Desktop inventory and measurements

| Region | Reference observation (1086px mock) | Approximate equivalent at 1440 / proposal |
|---|---|---|
| Full band | y≈1105–1204, height≈99px | ≈131px high target; content-led, never fixed/clipped |
| Title | x≈88–247; eyebrow above “PURITY YOU / CAN TRUST”, ≈24px serif | x≈117–328; ≈32px h2 using existing scale |
| Statement | x≈306–496, ≈12px type, three lines | x≈406–658; ≈16px body |
| Four indicators | x≈546–847; ≈32px outlined icon circles | x≈724–1123; ≈42px circles; 14–16px labels |
| Certification region | x≈868–1060, ≈70px badge + accompanying copy | x≈1151–1406; ≈93px badge, **hidden unless evidence verified** |

Use existing Container and sage tokens, dark forest heading/icons, gold-700 eyebrow, decorative divider rules, existing typography and spacing. Desktop (`lg` ≥1024) reads title → statement → four-indicator list → optional certification. Fit inside available width rather than shrinking copy to match the mock's small type. At 1024, let certification move below and allow the title/statement row and indicator row to wrap. At ≥1280, aim for the reference's horizontal band.

Without certification, omit its badge and statement from the DOM. Let the indicator region use the remaining width; do not add a fake seal or “certificate pending” product message. This will intentionally differ from the screenshot until evidence permits a badge. Optional reserved desktop whitespace must not create empty mobile rows.

## Tablet / mobile

- Tablet 768–1023: title and statement in a two-column row, four indicators below; certification, if genuinely enabled, sits in a final centred row. Padding ≈24–32px; gaps ≈24px.
- Mobile 320–767: eyebrow/title → statement → indicators in a 2×2 grid → optional certification. Heading wraps naturally; indicators may become one column under enlarged text if necessary. No fixed card or section height. Padding ≈32px, internal gaps 16–24px.
- Keep DOM order identical to reading order. Check 320, 375, 768, 1024, 1280, 1366 and 1440, 200% text, and 320 CSS-pixel reflow. No horizontal scrolling, text truncation, badge overlap or blank certification space on small screens.

## Components / reuse and boundaries

| Piece | Plan |
|---|---|
| `QualitySection` | New Server section at `components/home/QualitySection.tsx`; single section responsibility; `id="quality"`, labelled h2 |
| `Container` | Reuse existing width/gutters; confirm content vs wide against measured title/indicator alignment |
| `SectionHeading` | Reuse left/compact treatment; optional controlled line break only if required to match two-line reference without harming reflow |
| `IconFeature` | Reuse stacked light tone; add a small `circled` icon presentation and compact size only as required; preserve trust/origin defaults |
| `Icon` | Reuse droplet, waves, leaf, clipboard-check/shield-check as suitable; add a map entry only if missing; hide decorative icons |
| `Reveal` | Existing Client island around server-rendered content; no new animation runtime |
| Certification markup | Local to QualitySection (single use); generic laurel/text only after applicable certificate verification, never an official ISO logo or invented certification number |
| Background/rules | Local CSS/utilities, not components; sage gradient first; no generated photography |

No extra QualityCard, BadgeSystem, texture factory, state library or dependency. Section stays Server; only existing Reveal uses browser APIs.

## Claims, copy and certification gate

Existing evidence ledger: `PROJECT_OVERVIEW.md` “Claims requiring verification”; executable registry: `content/claims.ts` with production blocking in `next.config.ts`. The following is a proposed mapping, **not a statement that evidence exists**. New IDs must be registered as unverified before any rendering during approved implementation; no §7 claim code is added by this briefing.

| Reference wording | Registry / evidence rule |
|---|---|
| “Low TDS (6–8 mg/L)” | Reuse `lowTds`; current lab analysis supporting the range; remains unverified |
| “Lab Tested” | Reuse `labTested`; laboratory identity/accreditation and testing frequency; remains unverified |
| “Unstilled (Natural State)” | Do not silently correct it. Proposed wording “Undistilled (Natural State)” needs owner confirmation and process evidence; proposed `undistilled` ID. Existing evidence ledger already records this item |
| “Odourless & Tasteless at Source” | Proposed `odourlessTastelessAtSource`, sensory/source evidence; not inferred from low TDS |
| “Purity You Can Trust” | Treat purity assurance as marketing requiring owner approval alongside supporting analyses; proposed `qualityPurityTrust` ID |
| “Naturally pure, rigorously tested and bottled at the source to international quality standards” | Do not reproduce as verified copy. Reuse existing purity/lab/bottling claims if ever rendered; “international standards” requires specifically named applicable standards and evidence, not a vague assurance |
| “Manufactured under ISO 22000 Food Safety Management” | Proposed `iso22000` ID only after wording/scope review. Valid applicable certificate: certifying body, certificate number, legal entity/site, scope, issue/expiry date and current validity must all be confirmed |

Proposed interim descriptive line: **“ROCK-TAMA natural spring water from Nanka, Anambra State, Nigeria.”** This uses the owner's supplied location without adding processing or scientific assertions. It is shorter than the reference statement; record that difference.

Proposed indicator order matches reference: Low TDS → Undistilled (only once spelling is approved) → Odourless & Tasteless at Source → Lab Tested. Unverified development copy must reference registry IDs and remain blocked from production, consistently with §4 and §6. If the owner prefers to omit unverified indicators entirely, confirm that content choice before implementation; never silently replace a scientific label with an invented fact.

Certification rendering requires **both** a verified registry entry and explicitly enabled certificate content backed by documentation. Default false. False means no visible/accessible badge, ISO claim, laurel or empty mobile row. A boolean alone is insufficient proof. Test false and an evidence-backed fixture true; do not commit synthetic evidence or change real claim status for tests.

## Images / texture

No photo is required. Use the existing sage gradient, optionally a restrained CSS highlight in the reference's left texture region. The detailed droplet texture is not available as an official asset; document its omission. Do not create stock/AI water imagery or add a dependency to imitate it. If the owner later supplies a licensed texture, record provenance, compress below the existing ≈40KB target and treat it as decorative. Badge artwork is withheld until certification is proven.

## Proposed animation storyboard

Use D-088 Reveal with opacity/16px rise over 600ms. Heading + statement in one group at 0ms; each indicator 0/50/100/150ms when its group enters; conditional badge 100ms. Do not nest reveal wrappers or stack parent/child delays. Background, rules and icon circles stay static. No continuous motion or parallax. Use the now-available zero viewport inset if this is the final built section, so short content at page end cannot remain hidden. Reduced motion/no JS: immediate final state.

## Files after approval

Create `components/home/QualitySection.tsx`. Extend `content/highlights.ts` for typed quality indicators and conservative certification configuration, and `content/home.ts` for section copy if consistent with current pattern. Add necessary unverified IDs/evidence to `content/claims.ts`; minimally extend `types/content.ts` if the existing Highlight type is insufficient. Modify `components/ui/IconFeature.tsx` only for circled/compact presentation, preserving defaults. Add icons through `components/icons/Icon.tsx` only when needed. Compose in `app/page.tsx` and mark `homeSections.quality.built=true` in `content/routes.ts` in the same implementation change; no fake Quality page. Add named design tokens only if an existing scale cannot express the reference. Extend `scripts/visual-check.config.mjs` with quality, claim/certification and anchor journeys. Maintain docs, decisions, handoff and workflow skill.

## Accessibility / risks / concepts

Use a labelled section/h2 and four-item ul, without introducing another h1. Circle/texture artwork is decorative. All scientific wording remains readable text. Check AA contrast over both gradient extremes; do not put small gold-500 text on light sage. Focus styles apply to newly live Quality navigation anchors; no added controls without a real action. Verify desktop and mobile keyboard navigation, drawer close behaviour and focus destination. A hidden certification must also be absent from assistive technology output.

Key risks are overstated claims, a badge enabled by a bare flag, truncation of long labels, trying to force the reference's dense band height, and shared IconFeature regressions. Server-side content gating and registry references must be verifiable in HTML, not dependent on client hiding. Evidence verification is independent of design approval.

## Verification and acceptance

1. Lint, TypeScript, normal Turbopack production build outside the restricted worker environment; record diagnostic Webpack results separately if still necessary. Keep production claim guard intact.
2. Screenshot at all seven configured widths, 1440 comparison against source y≈1105–1204. Record measurements and intentional badge/texture/copy deviations. Save provisional only.
3. Test default-false certificate output, verified+enabled fixture output, and negative cases (enabled+unverified, missing/expired certificate). No unsupported ISO output may reach production.
4. Test registered claim references, no unknown scientific labels, no typo correction without approval; production guard continues to fail on unverified claims.
5. Scroll, End-key/anchor jump, no-JS and reduced-motion cases; stable layout boxes and opacity/transform-only transitions; all groups reachable at page end.
6. Existing visual and three-delivery functional regression suites; shared trust/origin/product/header/hero behaviour preserved. Basic accessibility/contrast, 200% text and 320 CSS-pixel reflow; no overflow/clipping. Existing global header enlarged-text issue must remain tracked separately if not addressed beforehand.

Acceptance requires readable responsive composition, supported copy handling, strict certification gating, working Quality anchor navigation, safe motion, and honest verification evidence. Passing checks do not approve screenshots. No push or deployment.

## Approval needed / next step

Review the proposed interim sentence, evidence-gated indicator strategy, “Undistilled” spelling, hidden certification region and restrained motion. §7 implementation starts only after explicit approval. §6 comparison review remains separate; no §5 or §6 visual baseline promotion is authorised by this briefing.
