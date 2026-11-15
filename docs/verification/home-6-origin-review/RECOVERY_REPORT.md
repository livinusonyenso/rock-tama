# §6 verification recovery — 2026-11-16

**Browser verification recovered using a styled Webpack diagnostic build. Default Turbopack build still fails in this execution environment. Visual approval remains pending.** Original implementation commit `0f8618e` is retained; subsequent fixes are recorded below. No push/deployment, dependency upgrade, security change or permanent build configuration change.

## Environment diagnosis

| Candidate | Evidence / conclusion |
|---|---|
| Sandbox / subprocess permissions | A minimal Node `net.createServer().listen(0,'127.0.0.1')` fails with **EPERM** inside sandbox, passes with `require_escalated`. Turbopack's loader-worker path still fails on the bind step even when its parent command is escalated. **Strongly supported environmental cause** |
| Port conflict | Listener inventory showed no listeners on verification ports 3100/9333/4010. Failure is EPERM, not EADDRINUSE, and an ephemeral port bind is affected. **No evidence of port conflict**. Existing other development listeners were not stopped |
| Next.js/Turbopack problem | Installed Next **16.4.6** supports `--webpack` (`next build --help`). Both `npm run build` and direct `npx next build` reproduce worker EPERM. **Probable interaction between Turbopack loader-worker process creation and this sandbox's permissions**, not a confirmed general Next defect |
| Application-level build problem | TypeScript/lint pass. Supported Webpack diagnostic builds compile/prerender all routes successfully. Actual section bugs found in Chrome were separate and fixed narrowly. No evidence that Origin JSX or business logic caused the worker-port failure |

Host execution: Node v26.11.0, Darwin arm64. Actual error saved in `turbopack-failure.log`: `[project]/app/globals.css.css [app-client] (css)` → `evaluate_webpack_loader` → creating new process → binding to a port → `Operation not permitted (os error 1)`.

An independently reported upstream reproduction describes the same escalated-parent/denied-Turbopack-child behaviour: https://github.com/openai/codex/issues/50945 . This is corroboration, not proof that our default build passes outside this environment. Supported CLI alternative: https://nextjs.org/docs/app/api-reference/cli/next ; installed CLI help was also inspected.

## Webpack diagnostic caveat and recovery

Plain `npx next build --webpack` initially failed fetching Google Fonts because sandbox DNS was restricted; escalated retry compiled successfully. However this repository wires Tailwind through **turbopack.rules only**. Plain Webpack retained `@theme`/`@tailwind utilities` and emitted no `.grid`/`.bg-ivory-50` utilities. Its unstyled screenshots and automated passes were **rejected as visual evidence**.

To build a valid diagnostic artifact, a temporary Webpack pre-loader rule applied the already-installed **@tailwindcss/turbopack 4.3.3** loader to `globals.css`. No new package was installed. Equivalent temporary hook:

```ts
webpack(config) {
  config.module.rules.unshift({
    test: /globals\.css$/,
    enforce: 'pre',
    use: ['@tailwindcss/turbopack'],
  });
  return config;
}
```

A temporary script saved the exact config, inserted this hook, invoked `next build --webpack`, and restored the original bytes in `finally`. `git diff -- next.config.ts package.json package-lock.json` is empty. The successful artifact contains compiled utilities and passes an explicit browser style assertion. See `webpack-build.log`. Approved announcement/header comparisons remain 0.00%, supporting style parity for those existing regions.

**This proves only the styled Webpack diagnostic build. It does not prove a default Turbopack build.** The default build must still be checked in a normal terminal/environment that permits its worker ports. The original build scripts/config remain unchanged. Browser-check configuration was extended to validate settled Origin captures and record geometry under git-ignored `.verification/origin-measurements/`, curated here after review.

## Verification-discovered fixes (separate from 0f8618e)

1. **Origin reveal at document end.** Before fixing, the last desktop indicator row could remain hidden: its top never reached the shared observer's inset region before maximum scroll. Add `Reveal.viewportInset` (0 or 10, default **10 unchanged**); only Origin passes 0. Existing §5 reveal timing is preserved. Browser scroll/End tests now reveal all five groups, with unchanged layout boxes and 0/60/120ms indicator stagger. No animation-duration/easing changes.
2. **Origin heading at enlarged text.** At 200% root text the compact h2 measured clientWidth 244px versus scrollWidth 302px. Add `wrap-anywhere` only to the compact heading variant (currently Origin). It now reflows without overflow; default headings and global typography remain unchanged. Normal-size desktop geometry is unchanged.
3. **Verification accuracy.** Origin assertions cause the harness to reload the page before capture; added explicit section-end scroll and a visible-opacity assertion so static comparisons cannot show hidden reveals. At 1024 the map ends before the indicator list, so scroll the section, not just the map. Added actual-style and contrast/geometry assertions. Keyboard test now enters keyboard modality before measuring the focus ring and preserves that observation across navigation. These are test corrections, not application navigation rewrites.

The original pre-fix full run is saved as `before-fix-full-report.md` (617 passed, 7 failed); the diagnostic before image is `before-fix-desktop-reference.png`. Do not use those as final acceptance screenshots.

## Current evidence

- `report.md`: final Origin capture run, **105 passed / 0 failed / 0 incomplete**, all seven widths.
- `origin-desktop-reference.png`: original 1086px source crop y918–1105, scaled to 1440, implementation and overlay; **for owner review only**.
- `sections/origin-{small,mobile,tablet,laptop,large,hd,desktop}.png`: 320/375/768/1024/1280/1366/1440 respectively. All inspected visually. Mobile reads image → label/h2/copy → three indicators → map; tablet has image above story/map; desktop has two main columns. At 1024 indicators wrap to two rows and the section grows naturally.
- `measurements-<width>.json`: browser geometry and contrast. Story text contrast minimum **5.34:1** for eyebrow; body **13.59:1**; heading/indicator text **16.64:1** on ivory. Placeholder label token contrast is separately calculated as **4.57:1** (#5c5c57 on #dad4cc). Decorative icons/map exempt from text contrast requirements. Decorative SVGs are aria-hidden; section labelled by h2; indicators in a list; no extra h1.
- Final existing functional journeys, using the same diagnostic artifact with `--no-build`: **dev-file 361/361**, **resend-mock 40/40**, **unconfigured 31/31**. Reports: `functional-dev-file.md`, `functional-resend-mock.md`, `functional-unconfigured.md`. These include reduced-motion/no-JS, scroll/End and desktop keyboard/mobile navigation, working enquiry storage, email-provider failure and rate limiting. The global font-stress case is classified as visual and its negative results remain in the visual report; no failing checks were suppressed. The enlarged-text reports show Origin's own text no longer overflows. They also expose a separate **existing header** issue described below.
- Map generator rerun: exact source checksum, two dissolved coastline rings (mainland + Madagascar), coordinate inside Nigeria. SVG pin tip is projected **(27.08306,33.93958)** from approximate Nanka town 6.06042°N/7.08306°E. Independent published location and licence are in `ASSET_SPECIFICATIONS.md`. This is not an exact spring coordinate.

### Measured geometry

| Viewport | Section height | Landscape box | Map box |
|---|---:|---:|---:|
| 320 | 721.09 | 288×162 | 128×134.91 |
| 375 | 752.03 | 343×192.94 | 128×134.91 |
| 768 | 495.19 | 720×240 | 144×151.78 |
| 1024 | 340.44 | 441.59×147.19 | 128×134.91 |
| 1280 | 263.94 | 559.36×186.45 | 176×185.50 |
| 1366 | 240.62 | 598.91×199.62 | 176×185.50 |
| 1440 | 251.98 | 632.95×210.98 | 176×185.50 |

At 1440, section ≈252 versus reference ≈248 (+4); image x32 versus ≈33 (−1), width633 versus ≈617 (+16), height211 versus≈208 (+3). Story starts x704.95 versus≈688 (+17); map x1232 versus≈1218 (+14), width176 versus≈186 (−10). Approximate reference edges are not exact design tokens. Heading and paragraph top alignment are close, but the serif letter shapes/weight and eyebrow size/tracking differ from the mock. Indicators sit higher because the approved safe paragraph has two lines instead of the mock's four scientific lines; the full location label includes Nigeria and wraps to three lines on desktop. Pin/leaf/layers icons are consistent Lucide outlines rather than the reference's filled/mixed artwork. Placeholder is flat rather than the reference's subtle shaded artwork. Licensed coastline/projection differs deliberately from the stylised mock map; marker accuracy takes precedence over copying the mock pin pixel.

No content clipping, normal-size page overflow or image distortion was found at the seven widths. 320 CSS-pixel layout provides the reflow geometry equivalent to a 1280px viewport at 400% zoom; actual browser-UI zoom and assistive-technology usability are not a full formal audit. Official photography/crop is still unavailable and is not visually approved by placeholder tests.

## Remaining differences / acceptance limits

Final visual regression: **393 passed / 3 failed / 0 incomplete**, `visual-regression-report.md`:

- Global **200% root-font** stress reveals existing header overflow: +216px in mobile mode and +950px at desktop. Origin's own h2/paragraph/indicators pass the same text-overflow assertions after the fix. Header source was not changed. Tracked separately as V-013; broader page accessibility is not declared complete.
- Drawer @320 differs **4.01%** from its approved pre-Origin image because Our Story is now a live anchor, replacing its pending label. At 375/768 it remains within tolerance. No baseline update. `drawer-320-baseline-diff.png` is available for review.

Default Turbopack outside this restricted execution path remains unverified. §5 and §6 screenshots stay provisional/unapproved. Scientific claims remain unverified and production blocking. No ISO certification has been introduced. §7 briefing may be reviewed but implementation is not authorised.

## Finish default-build verification outside this environment

In a normal terminal at the repository root, with ordinary font-network access and no concurrent build:

```sh
npm run lint
npx tsc --noEmit
npm run build
npm run verify:visual -- --no-build --section origin --save home-6-origin-terminal
npm run verify:visual -- --no-build
npm run verify:functional
```

Keep `--approve` absent. The last command runs the normal default build plus all three delivery suites. If a default build fails there too, retain the complete terminal log before making any application/config changes. Do not disable the claims guard or broaden machine security permissions. For this diagnostic artifact the equivalent three functional invocations actually run were:

```sh
node scripts/visual-check.mjs --kind functional --no-build
node scripts/visual-check.mjs --kind functional --delivery resend-mock --no-build
node scripts/visual-check.mjs --kind functional --delivery unconfigured --no-build
```

Existing tracked header font-stress and drawer-baseline differences still require explicit disposition; do not silently turn them into approved screenshots.
