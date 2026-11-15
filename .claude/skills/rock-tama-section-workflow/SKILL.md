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
