# Shop route CSS recovery

The owner reported the bottle filling the viewport. Live Turbopack HTML confirmed that the shop section, stage and gallery frames had **no class attributes**. The served module stylesheet contained unscoped selectors. The wildcard `*.css` Tailwind rule with `as: "*.css"` processed CSS Modules as ordinary CSS, losing their exported class mappings. Absolutely positioned next/image fill imagery then escaped its intended stage.

Fix: restrict the existing Tailwind loader to `globals.css`, the sole Tailwind entry point. Leave CSS Modules to Next.js. No product artwork, page structure, basket behaviour or dependencies changed.

Verified against the actual running Turbopack development server on port3000: **78 passing checks**, six widths (320/375/768/1024/1280/1440), thumbnail selection, zoom/Escape/focus and pack options. Inspected desktop screenshot. A new regression assertion checks grid display, relatively positioned stage, object-contain, image/stage bounds and desktop gallery width. The prior recovery run incorrectly passed20 structural/viewport checks even while scoped styles were absent; those checks did not establish image containment. Its report is retained in ../shop-route-recovery for transparency.

Lint and TypeScript pass. Styled diagnostic Webpack production build passes; temporary diagnostic loader restored exactly. No claim that the default Turbopack production build passed. An additional deployment-config check fails an existing outdated expectation of2 warnings versus3 after launch placeholders were added; this is unrelated to CSS and has not been changed here.

Screenshots remain provisional. No push or deployment.
