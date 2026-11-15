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
