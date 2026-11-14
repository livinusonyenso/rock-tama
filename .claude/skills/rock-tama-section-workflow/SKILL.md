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
3. **Review the design system:** `docs/DESIGN_SYSTEM.md`, the image slots in `docs/ASSET_SPECIFICATIONS.md`, and the reference image `docs/reference/homepage-reference.png` (view the relevant region).
4. **Identify the next approved section/task.** Check its milestone dependencies in `docs/IMPLEMENTATION_PLAN.md` are complete and its decisions are APPROVED. If not, stop and list what's missing.
5. **Inspect the current code** that the task touches.

## Phase B: Propose and get approval

6. **Explain the proposed implementation** using the briefing format in `docs/DEVELOPMENT_GUIDELINES.md` (What / Why / Where / Concepts / What could go wrong / Verification / Next step).
7. **Determine reusable components:** reuse existing `components/ui` pieces first; justify any new component (responsibility, reuse, or client boundary); state the Server/Client boundary for each.
8. **Obtain approval before writing code.** End the message with a clear question and STOP. Do not proceed on silence or ambiguous replies.

## Phase C: Build and verify (only after explicit approval)

9. **Implement only the approved scope.** Use tokens and content modules. Links go through `resolveHref()`. If the task ships a homepage section or page, update its availability in `content/routes.ts` in the same change. If scope must change, stop and ask.
10. **Run checks:** `npm run lint`, `npx tsc --noEmit`, and `npm run build` (from M3 onward or when config/routes change). Fix failures in scope; report any you can't fix, with output.
11. **Compare against the reference:** desktop (≥1280) against the screenshot region; tablet (768) and mobile (375) against the documented responsive behaviour; keyboard and accessibility basics. List deviations honestly.

## Phase D: Record and stop

12. **Record changes and unresolved issues:** update `docs/PROGRESS.md` (completed + how verified, blockers, next task), `docs/SESSION_HANDOFF.md`, `docs/DESIGN_SYSTEM.md` if tokens changed, and `docs/DECISIONS.md` if anything was decided. Mark work [VERIFIED] only for checks that actually ran.
13. **Commit** code + docs together with a meaningful conventional message after reviewing the staged files for secrets. Do not push unless asked.
14. **Stop and request approval** for the next task. Name it, but do not start it.
