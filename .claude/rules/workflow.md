# Workflow rules

- **Analyse before implementing.** Read `CLAUDE.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md` and the docs for the task first.
- **Inspect before editing.** Read every file before modifying it; never overwrite working code blindly.
- **One logical task at a time.** Present the briefing (What / Why / Where / Concepts / Risks / Verification / Next step, per `docs/DEVELOPMENT_GUIDELINES.md`) and wait for explicit approval before writing code.
- **Implement only the approved scope.** If something else needs changing, stop and ask.
- **Verify.** Run `npm run lint` and `npx tsc --noEmit` (plus `npm run build` from M3 or when config/routes change) and compare against the reference. Report real results, including failures and anything not checked.
- **Record.** Update `docs/PROGRESS.md` and `docs/SESSION_HANDOFF.md` after each task; update `docs/DECISIONS.md` when a decision is approved or changed. Keep docs consistent with code.
- **Stop.** After each task, summarise and ask for approval before the next one. Approval of one task does not carry over.
- Dependencies: explain purpose, size and alternatives; install only after approval, with npm.
