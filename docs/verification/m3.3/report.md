# Visual check: 2026-11-14T21-15-51

**Result:** FAIL · 159 passed · 5 failed · 0 incomplete · 22 info

Sections: announcement, header, hero, hero-animation-initial, hero-reduced-motion, mobile-nav-closed, mobile-nav-open, mobile-nav-tab-contained, mobile-nav-escape, mobile-nav-backdrop, mobile-nav-link, mobile-nav-reduced-motion, desktop-no-menu-button · Viewports: small 320px, mobile 375px, tablet 768px, laptop 1024px, large 1280px, hd 1366px, desktop 1440px

> Automated checks catch overflow, loading, console and regression problems. Reference comparison sheets are indicative (the reference is a scaled mock) and must be reviewed by a person; passing checks are not proof of pixel-perfect accuracy.

| Scope | Check | Status | Detail |
|---|---|---|---|
| home @small 320px | fonts loaded | PASS | loaded |
| home @small 320px | images loaded | PASS |  |
| home @small 320px | no horizontal overflow | PASS |  |
| announcement @small 320px | section visible | PASS | 320×40 |
| header @small 320px | section visible | PASS | 320×65 |
| hero @small 320px | section visible | PASS | 320×922 |
| home @small 320px | no console errors | PASS |  |
| mobile-nav-closed @small 320px | menu button visible | PASS |  |
| mobile-nav-closed @small 320px | search/account hidden in header | PASS |  |
| mobile-nav-closed @small 320px | drawer closed | PASS |  |
| mobile-nav-closed @small 320px | no horizontal overflow | PASS |  |
| mobile-nav-closed @small 320px | section visible | PASS | 320×65 |
| mobile-nav-closed @small 320px | no console errors | PASS |  |
| mobile-nav-open @small 320px | drawer open as modal (top layer, background inert) | PASS |  |
| mobile-nav-open @small 320px | aria-expanded true | PASS |  |
| mobile-nav-open @small 320px | focus moved into drawer | PASS |  |
| mobile-nav-open @small 320px | background scroll locked | PASS |  |
| mobile-nav-open @small 320px | drawer within viewport (not clipped) | PASS |  |
| mobile-nav-open @small 320px | pending items not focusable, no fake links | PASS |  |
| mobile-nav-open @small 320px | current page marked | PASS |  |
| mobile-nav-open @small 320px | no horizontal overflow | PASS |  |
| mobile-nav-open @small 320px | section visible | PASS | 267×640 |
| mobile-nav-open @small 320px | no console errors | PASS |  |
| mobile-nav-backdrop @small 320px | backdrop tap closes drawer | PASS |  |
| mobile-nav-backdrop @small 320px | no horizontal overflow | PASS |  |
| mobile-nav-backdrop @small 320px | no console errors | PASS |  |
| home @mobile 375px | fonts loaded | PASS | loaded |
| home @mobile 375px | images loaded | PASS |  |
| home @mobile 375px | no horizontal overflow | PASS |  |
| announcement @mobile 375px | section visible | PASS | 375×40 |
| header @mobile 375px | section visible | PASS | 375×65 |
| hero @mobile 375px | section visible | PASS | 375×844 |
| home @mobile 375px | no console errors | PASS |  |
| hero-animation-initial @mobile 375px | 6+ entrance animations present | PASS |  |
| hero-animation-initial @mobile 375px | animated elements start invisible | PASS |  |
| hero-animation-initial @mobile 375px | first starts ≤100ms, all done ≤1000ms | PASS |  |
| hero-animation-initial @mobile 375px | no layout shift (layout boxes identical at start and end) | PASS |  |
| hero-animation-initial @mobile 375px | CTAs hit-testable at t=0 | PASS |  |
| hero-animation-initial @mobile 375px | no horizontal overflow | PASS |  |
| hero-animation-initial @mobile 375px | section visible | PASS | 375×844 |
| hero-animation-initial @mobile 375px | no console errors | PASS |  |
| hero-reduced-motion @mobile 375px | no entrance animations | PASS |  |
| hero-reduced-motion @mobile 375px | all hero content fully visible | PASS |  |
| hero-reduced-motion @mobile 375px | no horizontal overflow | PASS |  |
| hero-reduced-motion @mobile 375px | section visible | PASS | 375×844 |
| hero-reduced-motion @mobile 375px | no console errors | PASS |  |
| mobile-nav-closed @mobile 375px | menu button visible | PASS |  |
| mobile-nav-closed @mobile 375px | search/account hidden in header | PASS |  |
| mobile-nav-closed @mobile 375px | drawer closed | PASS |  |
| mobile-nav-closed @mobile 375px | no horizontal overflow | PASS |  |
| mobile-nav-closed @mobile 375px | section visible | PASS | 375×65 |
| mobile-nav-closed @mobile 375px | no console errors | PASS |  |
| mobile-nav-open @mobile 375px | drawer open as modal (top layer, background inert) | PASS |  |
| mobile-nav-open @mobile 375px | aria-expanded true | PASS |  |
| mobile-nav-open @mobile 375px | focus moved into drawer | PASS |  |
| mobile-nav-open @mobile 375px | background scroll locked | PASS |  |
| mobile-nav-open @mobile 375px | drawer within viewport (not clipped) | PASS |  |
| mobile-nav-open @mobile 375px | pending items not focusable, no fake links | PASS |  |
| mobile-nav-open @mobile 375px | current page marked | PASS |  |
| mobile-nav-open @mobile 375px | no horizontal overflow | PASS |  |
| mobile-nav-open @mobile 375px | section visible | PASS | 312×812 |
| mobile-nav-open @mobile 375px | no console errors | PASS |  |
| mobile-nav-tab-contained @mobile 375px | focus stays inside drawer after 7× Tab | PASS |  |
| mobile-nav-tab-contained @mobile 375px | no horizontal overflow | PASS |  |
| mobile-nav-tab-contained @mobile 375px | no console errors | PASS |  |
| mobile-nav-escape @mobile 375px | Escape closes drawer | PASS |  |
| mobile-nav-escape @mobile 375px | focus returned to menu button | PASS |  |
| mobile-nav-escape @mobile 375px | scroll restored | PASS |  |
| mobile-nav-escape @mobile 375px | no horizontal overflow | PASS |  |
| mobile-nav-escape @mobile 375px | no console errors | PASS |  |
| mobile-nav-backdrop @mobile 375px | backdrop tap closes drawer | PASS |  |
| mobile-nav-backdrop @mobile 375px | no horizontal overflow | PASS |  |
| mobile-nav-backdrop @mobile 375px | no console errors | PASS |  |
| mobile-nav-link @mobile 375px | choosing a link closes drawer | PASS |  |
| mobile-nav-link @mobile 375px | no horizontal overflow | PASS |  |
| mobile-nav-link @mobile 375px | no console errors | PASS |  |
| mobile-nav-reduced-motion @mobile 375px | no drawer transition with reduced motion | PASS |  |
| mobile-nav-reduced-motion @mobile 375px | drawer animates without reduced motion (control) | PASS |  |
| mobile-nav-reduced-motion @mobile 375px | no horizontal overflow | PASS |  |
| mobile-nav-reduced-motion @mobile 375px | no console errors | PASS |  |
| home @tablet 768px | fonts loaded | PASS | loaded |
| home @tablet 768px | images loaded | PASS |  |
| home @tablet 768px | no horizontal overflow | PASS |  |
| announcement @tablet 768px | section visible | PASS | 768×40 |
| header @tablet 768px | section visible | PASS | 768×65 |
| hero @tablet 768px | section visible | PASS | 768×496 |
| home @tablet 768px | no console errors | PASS |  |
| mobile-nav-closed @tablet 768px | menu button visible | PASS |  |
| mobile-nav-closed @tablet 768px | search/account hidden in header | PASS |  |
| mobile-nav-closed @tablet 768px | drawer closed | PASS |  |
| mobile-nav-closed @tablet 768px | no horizontal overflow | PASS |  |
| mobile-nav-closed @tablet 768px | section visible | PASS | 768×65 |
| mobile-nav-closed @tablet 768px | no console errors | PASS |  |
| mobile-nav-open @tablet 768px | drawer open as modal (top layer, background inert) | PASS |  |
| mobile-nav-open @tablet 768px | aria-expanded true | PASS |  |
| mobile-nav-open @tablet 768px | focus moved into drawer | PASS |  |
| mobile-nav-open @tablet 768px | background scroll locked | PASS |  |
| mobile-nav-open @tablet 768px | drawer within viewport (not clipped) | PASS |  |
| mobile-nav-open @tablet 768px | pending items not focusable, no fake links | PASS |  |
| mobile-nav-open @tablet 768px | current page marked | PASS |  |
| mobile-nav-open @tablet 768px | no horizontal overflow | PASS |  |
| mobile-nav-open @tablet 768px | section visible | PASS | 384×1024 |
| mobile-nav-open @tablet 768px | no console errors | PASS |  |
| home @laptop 1024px | fonts loaded | PASS | loaded |
| home @laptop 1024px | images loaded | PASS |  |
| home @laptop 1024px | no horizontal overflow | PASS |  |
| announcement @laptop 1024px | section visible | PASS | 1024×40 |
| header @laptop 1024px | section visible | PASS | 1024×85 |
| hero @laptop 1024px | section visible | PASS | 1024×525 |
| home @laptop 1024px | no console errors | PASS |  |
| desktop-no-menu-button @laptop 1024px | menu button not rendered | PASS |  |
| desktop-no-menu-button @laptop 1024px | desktop nav visible | PASS |  |
| desktop-no-menu-button @laptop 1024px | no horizontal overflow | PASS |  |
| desktop-no-menu-button @laptop 1024px | no console errors | PASS |  |
| home @large 1280px | fonts loaded | PASS | loaded |
| home @large 1280px | images loaded | PASS |  |
| home @large 1280px | no horizontal overflow | PASS |  |
| announcement @large 1280px | section visible | PASS | 1280×40 |
| header @large 1280px | section visible | PASS | 1280×85 |
| hero @large 1280px | section visible | PASS | 1280×525 |
| home @large 1280px | no console errors | PASS |  |
| home @hd 1366px | fonts loaded | PASS | loaded |
| home @hd 1366px | images loaded | PASS |  |
| home @hd 1366px | no horizontal overflow | PASS |  |
| announcement @hd 1366px | section visible | PASS | 1366×40 |
| header @hd 1366px | section visible | PASS | 1366×85 |
| hero @hd 1366px | section visible | PASS | 1366×525 |
| home @hd 1366px | no console errors | PASS |  |
| home @desktop 1440px | fonts loaded | PASS | loaded |
| home @desktop 1440px | images loaded | PASS |  |
| home @desktop 1440px | no horizontal overflow | PASS |  |
| announcement @desktop 1440px | section visible | PASS | 1440×40 |
| header @desktop 1440px | section visible | PASS | 1440×85 |
| hero @desktop 1440px | section visible | PASS | 1440×525 |
| home @desktop 1440px | no console errors | PASS |  |
| hero-animation-initial @desktop 1440px | 6+ entrance animations present | PASS |  |
| hero-animation-initial @desktop 1440px | animated elements start invisible | PASS |  |
| hero-animation-initial @desktop 1440px | first starts ≤100ms, all done ≤1000ms | PASS |  |
| hero-animation-initial @desktop 1440px | no layout shift (layout boxes identical at start and end) | PASS |  |
| hero-animation-initial @desktop 1440px | CTAs hit-testable at t=0 | PASS |  |
| hero-animation-initial @desktop 1440px | no horizontal overflow | PASS |  |
| hero-animation-initial @desktop 1440px | section visible | PASS | 1440×525 |
| hero-animation-initial @desktop 1440px | no console errors | PASS |  |
| hero-reduced-motion @desktop 1440px | no entrance animations | PASS |  |
| hero-reduced-motion @desktop 1440px | all hero content fully visible | PASS |  |
| hero-reduced-motion @desktop 1440px | no horizontal overflow | PASS |  |
| hero-reduced-motion @desktop 1440px | section visible | PASS | 1440×525 |
| hero-reduced-motion @desktop 1440px | no console errors | PASS |  |
| desktop-no-menu-button @desktop 1440px | menu button not rendered | PASS |  |
| desktop-no-menu-button @desktop 1440px | desktop nav visible | PASS |  |
| desktop-no-menu-button @desktop 1440px | no horizontal overflow | PASS |  |
| desktop-no-menu-button @desktop 1440px | no console errors | PASS |  |
| announcement @small 320px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| header @small 320px | matches provisional reference (NOT approved) | PASS | 0.00% pixels differ |
| hero @small 320px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| mobile-nav-closed @small 320px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| mobile-nav-open @small 320px | matches provisional reference (NOT approved) | PASS | 0.00% pixels differ |
| announcement @mobile 375px | matches approved baseline | PASS | 0.00% pixels differ |
| header @mobile 375px | matches provisional reference (NOT approved) | PASS | 0.00% pixels differ |
| hero @mobile 375px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| hero-animation-initial @mobile 375px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| hero-reduced-motion @mobile 375px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| mobile-nav-closed @mobile 375px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| mobile-nav-open @mobile 375px | matches provisional reference (NOT approved) | PASS | 0.00% pixels differ |
| announcement @tablet 768px | matches approved baseline | FAIL | 0.57% pixels differ; see .verification/2026-11-14T21-15-51/compare/announcement-tablet-baseline-diff.png |
| header @tablet 768px | matches provisional reference (NOT approved) | PASS | 0.00% pixels differ |
| hero @tablet 768px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| mobile-nav-closed @tablet 768px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| mobile-nav-open @tablet 768px | matches provisional reference (NOT approved) | PASS | 0.00% pixels differ |
| announcement @laptop 1024px | matches approved baseline | FAIL | 4.87% pixels differ; see .verification/2026-11-14T21-15-51/compare/announcement-laptop-baseline-diff.png |
| header @laptop 1024px | matches provisional reference (NOT approved) | FAIL | 2.40% pixels differ; see .verification/2026-11-14T21-15-51/compare/header-laptop-baseline-diff.png |
| hero @laptop 1024px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| announcement @large 1280px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| header @large 1280px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| hero @large 1280px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| announcement @hd 1366px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| header @hd 1366px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| hero @hd 1366px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| announcement @desktop 1440px | reference comparison sheet | INFO | review .verification/2026-11-14T21-15-51/compare/announcement-desktop-reference.png |
| announcement @desktop 1440px | matches approved baseline | FAIL | 4.15% pixels differ; see .verification/2026-11-14T21-15-51/compare/announcement-desktop-baseline-diff.png |
| header @desktop 1440px | reference comparison sheet | INFO | review .verification/2026-11-14T21-15-51/compare/header-desktop-reference.png |
| header @desktop 1440px | matches provisional reference (NOT approved) | FAIL | 5.11% pixels differ; see .verification/2026-11-14T21-15-51/compare/header-desktop-baseline-diff.png |
| hero @desktop 1440px | reference comparison sheet | INFO | review .verification/2026-11-14T21-15-51/compare/hero-desktop-reference.png |
| hero @desktop 1440px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| hero-animation-initial @desktop 1440px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
| hero-reduced-motion @desktop 1440px | matches approved baseline | INFO | no approved baseline or provisional reference yet |
