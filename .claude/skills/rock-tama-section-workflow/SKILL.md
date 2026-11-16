---
name: rock-tama-section-workflow
description: Standard approval-gated workflow for implementing one ROCK-TAMA website section or milestone task (announcement bar, header, hero, trust strip, products, origin, quality, wholesale banner, footer, or a foundation task). Use when starting, implementing, or verifying any section of the ROCK-TAMA site.
argument-hint: "[section or task, e.g. 'hero' or 'M1 task 1.2']"
---

# ROCK-TAMA section workflow

Target: **$ARGUMENTS** (if empty, use the "Next proposed task" in `docs/PROGRESS.md`).

The project docs are the source of truth. Reference them, don't restate them.

## Phase A: Prepare (no code)

1. **Read project instructions:** `CLAUDE.md`, `docs/SESSION_HANDOFF.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`.
2. **Review the approved UI breakdown** for this section in `docs/UI_BREAKDOWN.md` and its components in `docs/COMPONENT_ARCHITECTURE.md`.
3. **Review the design system:** `docs/DESIGN_SYSTEM.md` and the motion rules in `docs/ANIMATION_SYSTEM.md`, the image slots in `docs/ASSET_SPECIFICATIONS.md`, and the reference image `docs/reference/homepage-reference.png` (view the relevant region).
4. **Identify the next approved section/task.** Check its milestone dependencies in `docs/IMPLEMENTATION_PLAN.md` are complete and its decisions are APPROVED. If not, stop and list what's missing.
5. **Inspect the current code** that the task touches.

## Phase B: Propose and get approval

6. **Explain the proposed implementation** using the briefing format in `docs/DEVELOPMENT_GUIDELINES.md` (What / Why / Where / Concepts / What could go wrong / Verification / Next step), including an **animation storyboard** (what animates, what stays static, timing, reduced-motion behaviour) per `docs/ANIMATION_SYSTEM.md`.
7. **Determine reusable components:** reuse existing `components/ui` pieces first; justify any new component (responsibility, reuse, or client boundary); state the Server/Client boundary for each.
8. **Obtain approval before writing code.** End the message with a clear question and STOP. Do not proceed on silence or ambiguous replies.

## Phase C: Build and verify (only after explicit approval)

9. **Implement only the approved scope.** Use tokens and content modules. Any product/process/quality claim must reference an entry in `content/claims.ts` (D-078). Links go through `resolveHref()`. If the task ships a homepage section or page, update its availability in `content/routes.ts` in the same change. Product data comes from `content/products.ts`; only `listedProducts` may be shown, linked or offered (D-081). Product links go through `productHref()`; enquiries through `wholesaleQuoteHref()`. Reuse `OfferCard`/`ProductCard` for cards and `Reveal` for below-the-fold scroll reveals (D-087/D-088). If scope must change, stop and ask.
10. **Run checks:** `npm run lint`, `npx tsc --noEmit`, `npm run build`. Fix failures in scope; report any you can't fix, with output.
11. **Visual verification:** add/update the section in `scripts/visual-check.config.mjs` (interactive components also get `actions` + `expect` entries for each state: open, keyboard, Escape, close paths, reduced motion), run `npm run verify:visual -- --section <name>`, then **look at** the reference comparison sheet in `.verification/<run>/compare/` (1440 vs reference ×1.326, D-058). When tuning, measure element edges and stroke density (method in `docs/DEVELOPMENT_GUIDELINES.md`) instead of eyeballing; save before/after sets with `--save <task>-before|after`. Judge tablet/mobile against the documented responsive behaviour, and check keyboard/accessibility basics. List deviations honestly, and never present passing automated checks as proof of pixel accuracy. Update approved baselines (`--approve`) only after the owner accepts the result; use `--provisional` for regression protection while visual differences remain open.

## Phase D: Record and stop

11b. **Functional verification** (anything interactive): add journeys to `functionalJourneys()` in `scripts/visual-check.config.mjs` and run `npm run verify:functional` (dev-file, resend-mock, unconfigured). Every button/link performs its advertised action; forms validate, submit and report honest success/error; data is stored or delivered (checked server-side). Rendering or building is not completion (D-066). After client-side navigation, scope checks to the visible `<main>` (Next keeps the previous route hidden in the DOM, D-089).
12. **Record changes and unresolved issues:** update `docs/HOMEPAGE_CHECKLIST.md` (homepage sections), `docs/PROGRESS.md` (completed + how verified, blockers, next task), `docs/SESSION_HANDOFF.md`, `docs/DESIGN_SYSTEM.md` if tokens changed, and `docs/DECISIONS.md` if anything was decided. Mark work [VERIFIED] only for checks that actually ran.
13. **Commit** code + docs together with a meaningful conventional message after reviewing the staged files for secrets. Do not push unless asked.
14. **Stop and request approval** for the next task. Name it, but do not start it.

## Current owner constraints (2026-11-16, D-090/D-091)

§5 functional acceptance is separate from visual approval: keep comparisons provisional and Distributor Supply italic. Read `docs/ORIGIN_SECTION_BRIEFING.md` before §6; the owner approved implementation in D-092. Chrome verification recovered with a styled diagnostic Webpack artifact (D-093/D-094); normal Turbopack build still needs checking outside this worker restriction. §7–§9 were subsequently authorised together under D-095 and are implemented. New scope still needs explicit authorisation. Register required evidence-dependent copy as unverified, never infer verification from design approval. Record exact vector source/licence and a sourced approximate-town map coordinate using the same projection as the outline; never eyeball location. Do not push or deploy.


## Verification recovery safeguards (D-093/D-094)

Classify EPERM versus EADDRINUSE using logs, listener inventory and an isolated loopback bind test. An escalated parent bind does not establish Turbopack worker permission. `next build --webpack` is a diagnostic alternative, never proof of the default build. This project configures Tailwind only via Turbopack: reject plain unstyled Webpack screenshots; any temporary existing-loader hook must be restored exactly and documented. Do not upgrade dependencies, weaken guards or change working app code to bypass restrictions. Run browser journeys with `--no-build` against the identified artifact and label results by bundler. Static Origin captures must scroll the whole section and assert content opacity 1. Preserve negative results (including global header font-stress overflow) and do not promote §5/§6/drawer baselines without owner review. Refer to the recovery report for evidence and external-terminal commands.

## Combined homepage scope — D-095/D-096 (2026-11-16)

The owner explicitly authorised all remaining homepage sections in one pass, overriding the per-section approval stops for §7–§9. They are now implemented; do not keep asking to start those sections. Current evidence: `docs/verification/home-7-9-completion/REPORT.md`. Future scope still needs actual authorisation; this does not approve screenshots or push/deployment. Keep certificate output disabled without verified evidence and complete current config; preserve disabled newsletter/no invented socials or contact/policy destinations. The claim register has 13 unverified entries. All future footer links still use resolver data; provider and legal content require real inputs. Next work is feedback/verification and client inputs, not a new homepage section briefing.

## Image assets — D-098/D-099

Use `content/media.ts` for live paths/alt/focal points; no per-page image duplication. Source originals outside public, optimized live WebP files in public/images by role, unconfirmed artwork internal only. Supplying artwork does not change availability or verify printed claims/pack quantities. Do not invent/extract official logos from bottle artwork. Preserve alpha, contain full products, cover crop Origin, reserve aspect boxes, preload only primary image and use responsive sizes. Browser checks must decode visible media and scroll through lazy images rather than awaiting offscreen lazy images before scroll. Check CTA containment inside cards, not only page overflow. Do not promote old/new baselines without visual approval.

## Deployment mode update — D-100

Owner authorised removal of the missing-enquiry build blocker. Automatic mode (DEPLOY_MODE unset) now stages incomplete delivery/evidence with warnings + noindex; staging explicitly stages and production explicitly restores strict checks. Do not restore a default fatal build guard against this instruction. Never infer verified claims or functioning email from a staging build. Check mode behaviour with `node scripts/deployment-config-check.cjs`; runtime enquiry failure remains honest. No push/deploy without separate scope.

## Proposed logo/hero assets — D-101
Three supplied originals are preserved in docs/assets/source/branding and derivatives/manifests regenerated with prepare-brand-images.mjs. Logos are proposed branding, not client-approved. Use existing Logo + site.logos horizontal/stacked; retain ivory footer backing until a genuine light variant is supplied, never filter artwork. Hero background decorative/static with responsive cover and contrast-tested forest overlay; preserve carousel, selectors, CTAs and existing entrance/reduced-motion. Keep baselines provisional; no push/deploy.

## Five-slide hero — D-102
Owner authorised replacing old three-product controls with five synchronized copy/bottle slides. Use HeroCarousel + typed hero-slides.ts and server-rendered slots; one stationary waterfall. New custom-labels enquiry reuses existing delivery and keeps availability/pricing conditional. User explicitly allowed imagegen for missing memorial/coronation; generated concepts must stay documented/pending approval. Preserve static background,44px targets, decode-before-show, timer/listener/request cleanup, focus/hover/hidden-tab pause, touch pan-y and reduced-motion manual navigation. Headless Chrome needs foreground focus emulation to test actual focus events; swipe harness uses CDP touch. Keep baseline approvals separate.

D-103: keep hero toolbar visually hidden by default per owner; reveal only on keyboard focus without reflow. Do not restore visible dots/arrows/pause strip unless asked. Retain accessible controls, autoplay and swipe. Tests focus hidden controls before activation.

D-104: use supplied image copy6 for750ml hero (ROCK-TAMA-only main wordmark), via bottle-750ml-rock-tama.webp and updated generator/manifest. Do not revert first slide to AFRICA artwork or present750ml image as1.5L.

D-105: current hero timing is4s autoplay /450ms copy and bottle transitions, per owner request. Retain focus/hover pause and reduced motion.

D-106: only bottle frames animate on slide changes; copy swaps visibility instantly, no fade/translate. Preserve per-slide text/CTA data and overlapping-grid height.

D-107: homepage range galleries use shared MediaCarousel + rangeMediaVariants, only images move. Owner explicitly approved newer750ml as proposed packaging; keep fixed note and existing Glass Bottle SKU/title/route. Do not infer pack counts/material/availability from supplied illustrations. Preserve static shared-card defaults elsewhere, current frame aspects,4s/450ms, reduced motion, visibility pause, swipe and cleanup. MediaAsset.claims/data-claims references printed unverified artwork;15registered unverified claims. Reveal tests must allow absent data-reveal for reduced motion/already-visible elements; scroll every mobile card before asserting visibility. Keep visual approval separate.
