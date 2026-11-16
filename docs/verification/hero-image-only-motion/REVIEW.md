# Image-only carousel changes — D-106

Removed slide-copy opacity/translate transitions. Inactive panels use visibility:hidden, active panel visibility:visible: text/CTAs swap instantly, with no fade/blink interval. All panels retain their shared grid cell and intrinsic sizing, so hero height remains constant. Bottle450ms transition,4s autoplay and initial brand entrance unchanged.

Lint and TypeScript PASS; styled diagnostic Webpack build PASS with config restored. Mobile/desktop all-five-slide and reduced-motion checks94/94 PASS: per-slide title/CTA/image synchronization, copy opacity1/translate none/transition0s/animation none, preserved hero/frame geometry and manual selection. Raw report report.md. Default Turbopack environment restriction not claimed resolved. No push/deploy or visual baseline promotion.
