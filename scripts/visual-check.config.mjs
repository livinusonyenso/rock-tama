// Configuration for scripts/visual-check.mjs (D-040).
// Add a `sections` entry whenever a homepage section is implemented.

// Shared selectors for the mobile navigation checks.
const MENU_BUTTON_SELECTOR = 'button[aria-controls="mobile-nav"]';
const MENU_BUTTON = `document.querySelector('${MENU_BUTTON_SELECTOR}')`;
const DRAWER = 'document.getElementById("mobile-nav")';
const MOBILE = ["small", "mobile", "tablet"];

/** @type {import("./visual-check.mjs").VisualCheckConfig} */
const config = {
  // Production server started by the script (avoids the dev server on :3000).
  port: 3100,
  // Chrome DevTools Protocol port for the headless browser.
  cdpPort: 9333,

  // The approved design mock. All `reference` rectangles below are in its pixels.
  reference: {
    path: "docs/reference/homepage-reference.png",
    width: 1086,
  },

  viewports: [
    { name: "small", width: 320, height: 640 },
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "laptop", width: 1024, height: 768 },
    { name: "desktop", width: 1440, height: 900, compareWithReference: true },
  ],

  pages: [{ name: "home", path: "/" }],

  sections: [
    {
      name: "announcement",
      page: "home",
      selector: 'aside[aria-label="Store information"]',
      reference: { x: 0, y: 0, width: 1086, height: 32 },
    },
    {
      name: "header",
      page: "home",
      selector: "body > header",
      reference: { x: 0, y: 32, width: 1086, height: 64 },
    },

    // ---- Mobile navigation (M2.6): interactive states, each from a fresh page load ----
    {
      name: "mobile-nav-closed",
      page: "home",
      selector: "body > header",
      viewports: MOBILE,
      expect: [
        { name: "menu button visible", js: `getComputedStyle(${MENU_BUTTON}).display !== "none"` },
        { name: "search/account hidden in header", js: `[...document.querySelectorAll("body > header li")].filter(li => !li.closest("#mobile-nav") && /Search|Account/.test(li.textContent)).every(li => getComputedStyle(li).display === "none")` },
        { name: "drawer closed", js: `!${DRAWER}.open && ${MENU_BUTTON}.getAttribute("aria-expanded") === "false"` },
      ],
    },
    {
      name: "mobile-nav-open",
      page: "home",
      selector: "#mobile-nav",
      viewports: MOBILE,
      actions: [{ click: MENU_BUTTON_SELECTOR }],
      expect: [
        { name: "drawer open as modal (top layer, background inert)", js: `${DRAWER}.open && ${DRAWER}.matches(":modal")` },
        { name: "aria-expanded true", js: `${MENU_BUTTON}.getAttribute("aria-expanded") === "true"` },
        { name: "focus moved into drawer", js: `${DRAWER}.contains(document.activeElement)` },
        { name: "background scroll locked", js: `getComputedStyle(document.documentElement).overflow === "hidden"` },
        { name: "drawer within viewport (not clipped)", js: `(() => { const r = ${DRAWER}.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= 0 && r.bottom <= innerHeight + 0.5; })()` },
        { name: "pending items not focusable, no fake links", js: `[...${DRAWER}.querySelectorAll("[data-pending]")].every(el => el.tabIndex < 0 && !el.closest("a")) && !${DRAWER}.querySelector('a[href="#"], a[href=""]')` },
        { name: "current page marked", js: `${DRAWER}.querySelector('a[aria-current="page"]')?.getAttribute("href") === "/"` },
      ],
    },
    {
      name: "mobile-nav-tab-contained",
      page: "home",
      viewports: ["mobile"],
      actions: [{ click: MENU_BUTTON_SELECTOR }, { press: "Tab", times: 7 }],
      expect: [{ name: "focus stays inside drawer after 7× Tab", js: `${DRAWER}.contains(document.activeElement)` }],
    },
    {
      name: "mobile-nav-escape",
      page: "home",
      viewports: ["mobile"],
      actions: [{ click: MENU_BUTTON_SELECTOR }, { press: "Escape" }],
      expect: [
        { name: "Escape closes drawer", js: `!${DRAWER}.open && ${MENU_BUTTON}.getAttribute("aria-expanded") === "false"` },
        { name: "focus returned to menu button", js: `document.activeElement === ${MENU_BUTTON}` },
        { name: "scroll restored", js: `getComputedStyle(document.documentElement).overflow !== "hidden"` },
      ],
    },
    {
      name: "mobile-nav-backdrop",
      page: "home",
      viewports: ["small", "mobile"],
      actions: [{ click: MENU_BUTTON_SELECTOR }, { clickAt: { x: 12, y: 400 } }],
      expect: [{ name: "backdrop tap closes drawer", js: `!${DRAWER}.open` }],
    },
    {
      name: "mobile-nav-link",
      page: "home",
      viewports: ["mobile"],
      actions: [{ click: MENU_BUTTON_SELECTOR }, { click: '#mobile-nav a[href="/"]' }],
      expect: [{ name: "choosing a link closes drawer", js: `!${DRAWER}.open` }],
    },
    {
      name: "mobile-nav-reduced-motion",
      page: "home",
      viewports: ["mobile"],
      media: [{ name: "prefers-reduced-motion", value: "reduce" }],
      actions: [{ click: MENU_BUTTON_SELECTOR }],
      expect: [{
          name: "no drawer transition with reduced motion",
          js: `matchMedia("(prefers-reduced-motion: reduce)").matches && getComputedStyle(${DRAWER}).transitionProperty === "none"`,
        },
        {
          name: "drawer animates without reduced motion (control)",
          js: `(() => { const d = ${DRAWER}; const cls = d.className; return /transition-transform/.test(cls) && /motion-reduce:transition-none/.test(cls); })()`,
        },],
    },
    {
      name: "desktop-no-menu-button",
      page: "home",
      viewports: ["laptop", "desktop"],
      expect: [
        { name: "menu button not rendered", js: `getComputedStyle(${MENU_BUTTON}.parentElement).display === "none"` },
        { name: "desktop nav visible", js: `getComputedStyle(document.querySelector('header nav[aria-label="Main"]')).display !== "none"` },
      ],
    },
  ],

  // Baseline regression: a pixel "differs" when any RGB channel differs by more than
  // `pixelTolerance`; the check fails when more than `maxDiffRatio` of pixels differ.
  regression: { pixelTolerance: 16, maxDiffRatio: 0.005 },

  // Console messages matching these patterns are not treated as errors.
  ignoreConsole: [],
};

export default config;
