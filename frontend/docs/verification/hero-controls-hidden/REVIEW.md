# Hero toolbar removal — D-103

Owner requested removing the visible dot/arrow/pause strip. It is now visually hidden by default, without a reserved grid row. Keyboard focus reveals accessible controls as an absolute overlay without changing hero dimensions. Autoplay, swipe and hover/focus pause remain; no content/image/timer changes. No baselines promoted, push or deployment.

Lint and TypeScript PASS. Styled diagnostic Webpack build PASS; temporary config restored exactly. Default Turbopack restriction remains as recorded for D-102; no default pass claimed. Browser verification: **102/102 PASS** at320/375/768/1024/1280/1440: no visible toolbar, focus-only reveal without resizing, swipe both directions, arrows, pause/play and reduced motion. Raw report: report.md; desktop/mobile normal-view captures in sections/. Prior D-102 measurements restored; current measurements copied here and future measurement writes go to ignored .verification/hero-measurements rather than overwriting older evidence.

Inspected desktop capture: toolbar absent; bottle, copy and CTAs preserved. All screenshots remain pending owner review.
