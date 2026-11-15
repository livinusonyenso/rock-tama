// Configuration for scripts/visual-check.mjs (D-040).
// Add a `sections` entry whenever a homepage section is implemented.

// Shared selectors for the mobile navigation checks.
const MENU_BUTTON_SELECTOR = 'button[aria-controls="mobile-nav"]';
const MENU_BUTTON = `document.querySelector('${MENU_BUTTON_SELECTOR}')`;
const DRAWER = 'document.getElementById("mobile-nav")';
const MOBILE = ["small", "mobile", "tablet"];
const HERO = 'document.querySelector(\'section[aria-labelledby="hero-heading"]\')';
const HERO_ANIMATED = `[...${HERO}.querySelectorAll('[class*="animate-enter"]')]`;
const ENTER_ANIMS = `document.getAnimations().filter(a => a.animationName === "enter")`;

// ---- Functional journey helpers (F0/F1) ----
const SUBMIT = 'form button[type="submit"]';
const RESULT = "document.querySelector('[data-enquiry-reference]') || document.querySelector('form [role=\"alert\"]')";
const REFERENCE = "document.querySelector('[data-enquiry-reference]')?.textContent";
/** Actions that fill the enquiry form with valid data; `name` makes each submission identifiable. */
const fillEnquiry = (name, overrides = {}) => [
  { type: { selector: "#name", text: name } },
  { type: { selector: "#email", text: overrides.email ?? "buyer@example.com" } },
  { type: { selector: "#phone", text: "+234 803 123 4567" } },
  // product: null = keep the product already selected (e.g. on /wholesale/<product>)
  ...(overrides.product === null ? [] : [{ select: { selector: "#product", value: overrides.product ?? "750ml-glass-bottle" } }]),
  { type: { selector: "#quantity", text: "120" } },
  { select: { selector: "#unit", value: "cartons" } },
  { type: { selector: "#location", text: "Lekki, Lagos, Nigeria" } },
  { type: { selector: "#message", text: "Weekly delivery to our hotel." } },
  { check: 'input[name="consent"]' },
];
const submitAndWait = [{ click: SUBMIT }, { waitFor: RESULT }];
/** Reads the development enquiry store (one JSON object per line). */
const storedEnquiries = async (root) => {
  const { readFile } = await import("node:fs/promises");
  try {
    return (await readFile(`${root}/.data/enquiries.jsonl`, "utf8")).trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  } catch {
    return [];
  }
};
const uniqueName = (label) => `${label} ${Date.now()}`;

/** @type {import("./visual-check.mjs").VisualCheckConfig} */
const config = {
  // Production server started by the script (avoids the dev server on :3000).
  port: 3100,
  // Chrome DevTools Protocol port for the headless browser.
  cdpPort: 9333,
  // Local mock of the Resend API used by `--delivery resend-mock`.
  mockResendPort: 4010,

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
    { name: "large", width: 1280, height: 800 },
    { name: "hd", width: 1366, height: 768 }, // common laptop width; fluid header-row inset mid-range
    { name: "desktop", width: 1440, height: 900, compareWithReference: true },
  ],

  pages: [
    { name: "home", path: "/" },
    { name: "wholesale", path: "/wholesale" },
    { name: "shop", path: "/shop" },
    { name: "product", path: "/shop/750ml-glass-bottle" },
  ],

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

    {
      name: "hero",
      page: "home",
      selector: 'section[aria-labelledby="hero-heading"]',
      reference: { x: 0, y: 96, width: 1086, height: 396 },
    },

    {
      name: "trust",
      page: "home",
      selector: 'section[aria-label="Purity highlights"]',
      reference: { x: 0, y: 492, width: 1086, height: 88 },
      expect: [
        { name: "6 highlights in a list", js: "document.querySelectorAll('section[aria-label=\"Purity highlights\"] ul > li').length === 6" },
        { name: "every highlight references a registered claim", js: "[...document.querySelectorAll('section[aria-label=\"Purity highlights\"] li')].every(li => Boolean(li.dataset.claim))" },
        { name: "icons hidden from assistive technology", js: "[...document.querySelectorAll('section[aria-label=\"Purity highlights\"] svg')].every(svg => svg.getAttribute('aria-hidden') === 'true')" },
      ],
    },

    // ---- Hero entrance animation (M3.3): deterministic, no timing-based sleeps ----
    {
      name: "hero-animation-initial",
      page: "home",
      selector: 'section[aria-labelledby="hero-heading"]',
      viewports: ["mobile", "desktop"],
      actions: [{ pauseAnimationsAt: 0 }],
      expect: [
        { name: "6+ entrance animations present", js: `${ENTER_ANIMS}.length >= 6` },
        { name: "animated elements start invisible", js: `${HERO_ANIMATED}.every(el => Number(getComputedStyle(el).opacity) < 0.05)` },
        {
          name: "first starts ≤100ms, all done ≤1000ms",
          js: `(() => { const t = ${ENTER_ANIMS}.map(a => a.effect.getComputedTiming()); return Math.min(...t.map(x => x.delay)) <= 100 && Math.max(...t.map(x => x.endTime)) <= 1000; })()`,
        },
        {
          name: "no layout shift (layout boxes identical at start and end)",
          js: `(() => { const box = el => [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight].join(","); const els = ${HERO_ANIMATED}; const start = els.map(box); ${ENTER_ANIMS}.forEach(a => a.finish()); const end = els.map(box); return start.every((b, i) => b === end[i]); })()`,
        },
        {
          name: "CTAs hit-testable at t=0",
          js: `(() => { ${ENTER_ANIMS}.forEach(a => { a.pause(); a.currentTime = 0; }); return [...${HERO}.querySelectorAll('a, [data-pending]')].filter(el => el.closest('[class*="animate-enter"]')?.matches('div')).every(el => { const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return el.contains(hit); }); })()`,
        },
      ],
    },
    {
      name: "hero-reduced-motion",
      page: "home",
      selector: 'section[aria-labelledby="hero-heading"]',
      viewports: ["mobile", "desktop"],
      media: [{ name: "prefers-reduced-motion", value: "reduce" }],
      expect: [
        { name: "no entrance animations", js: `${ENTER_ANIMS}.length === 0` },
        { name: "all hero content fully visible", js: `${HERO_ANIMATED}.every(el => getComputedStyle(el).opacity === "1")` },
      ],
    },

    // ---- /shop (F2) ----
    { name: "shop-page", page: "shop", selector: "main", viewports: ["mobile", "tablet", "desktop"] },
    { name: "product-page", page: "product", selector: "main", viewports: ["mobile", "tablet", "desktop"] },

    // ---- /wholesale (F1) ----
    { name: "wholesale-page", page: "wholesale", selector: "main", viewports: ["mobile", "tablet", "desktop"] },

    // ---- Functional journeys (F1): run with `npm run verify:functional` ----
    ...functionalJourneys(),

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

/** Functional journeys for the wholesale enquiry flow (D-066, D-072). One viewport is enough for behaviour. */
function functionalJourneys() {
  const success = uniqueName("Journey Hotel");
  const noJs = uniqueName("NoJS Hotel");
  const honeypot = uniqueName("Honeypot Bot");
  const viaResend = uniqueName("Resend Hotel");
  const failing = uniqueName("FAIL_DELIVERY Hotel");
  const noJsSelect = uniqueName("NoJS Select Hotel");
  const productJourney = uniqueName("Product Page Hotel");
  const base = { kind: "functional", viewports: ["mobile"] };
  // Each journey gets its own client address so the enquiry rate limit (5 per 10 min per client)
  // can't make journeys depend on each other; the rate-limit journey sets its own.
  return withOwnClient([
    // -- Navigation reaches the working page (dev-file mode) --
    {
      ...base,
      name: "cta-request-wholesale",
      page: "home",
      actions: [{ click: 'section[aria-labelledby="hero-heading"] a[href="/wholesale"]' }, { waitFor: "location.pathname === '/wholesale' && document.querySelector('form')" }],
      expect: [
        { name: "hero Request Wholesale opens the wholesale landing (products first, then form)", js: "location.pathname === '/wholesale' && document.querySelector('h1')?.textContent === 'Wholesale and Distribution' && Boolean(document.querySelector('#products')) && Boolean(document.querySelector('#enquiry form button[type=submit]'))" },
        { name: "nav Wholesale is a live link marked current", js: "document.querySelector('header nav a[href=\"/wholesale\"]')?.getAttribute('aria-current') === 'page'" },
      ],
    },
    {
      ...base,
      name: "wholesale-labels",
      page: "wholesale",
      expect: [
        { name: "every form control has a label", js: "[...document.querySelectorAll('form input:not([type=hidden]):not([tabindex=\"-1\"]), form select, form textarea')].every(el => el.labels?.length > 0)" },
        { name: "honeypot hidden from people and assistive tech", js: "getComputedStyle(document.querySelector('input[name=website_url]').closest('[aria-hidden]')).display === 'none'" },
      ],
    },
    // -- Wholesale landing: structure, product selection (owner brief, D-076) --
    {
      ...base,
      name: "wholesale-landing-structure",
      page: "wholesale",
      expect: [
        {
          name: "sections in order: hero → products → who we supply → how it works → enquiry",
          js: "(() => { const ids = [...document.querySelectorAll('main > section')].map(s => s.getAttribute('aria-labelledby')); return JSON.stringify(ids) === JSON.stringify(['wholesale-heading','products-heading','supply-heading','process-heading','enquiry-heading']); })()",
        },
        { name: "hero CTAs: Explore Products → #products, Request Quote → #enquiry", js: "[...document.querySelectorAll('section[aria-labelledby=wholesale-heading] a')].map(a => a.getAttribute('href')).join() === '#products,#enquiry'" },
        { name: "3 catalogue products, each with a Select product link to its pre-built page", js: "(() => { const links = [...document.querySelectorAll('#products a[data-select-product]')]; return links.length === 3 && links.every(a => a.getAttribute('href') === `/wholesale/${a.dataset.selectProduct}#enquiry`); })()" },
        { name: "product names come from the catalogue", js: "[...document.querySelectorAll('#products h3')].map(h => h.textContent).join('|') === '750 ml Glass Bottle|1.5 L Bottle|Carton Packs'" },
        { name: "no invented prices or delivery promises on the page", js: "!/₦|NGN|\\$\\d|per (bottle|carton)|minimum order|in stock|within \\d+ (hours|days)/i.test(document.querySelector('main').innerText)" },
        { name: "3 process steps", js: "document.querySelectorAll('section[aria-labelledby=process-heading] ol > li').length === 3" },
      ],
    },
    {
      ...base,
      name: "wholesale-explore-products",
      page: "wholesale",
      actions: [{ click: 'section[aria-labelledby=wholesale-heading] a[href="#products"]' }, { waitFor: "Math.abs(document.getElementById('products').getBoundingClientRect().top) < 4" }],
      expect: [{ name: "Explore Products scrolls to the products", js: "Math.abs(document.getElementById('products').getBoundingClientRect().top) < 4" }],
    },
    {
      ...base,
      name: "wholesale-select-product-js",
      page: "wholesale",
      actions: [
        { type: { selector: "#name", text: "Typed Before Selecting" } },
        { click: '#products a[data-select-product="1-5l-bottle"]' },
        { waitFor: "Math.abs(document.getElementById('enquiry').getBoundingClientRect().top) < 4" },
      ],
      expect: [
        { name: "product field set to the selected product", js: "document.getElementById('product').value === '1-5l-bottle'" },
        { name: "already-typed input kept", js: "document.getElementById('name').value === 'Typed Before Selecting'" },
        { name: "URL updated to the product's quote URL", js: "location.pathname === '/wholesale/1-5l-bottle' && location.hash === '#enquiry'" },
        { name: "scrolled to the enquiry section", js: "Math.abs(document.getElementById('enquiry').getBoundingClientRect().top) < 4" },
        { name: "focus moved to the product field", js: "document.activeElement?.id === 'product'" },
        { name: "selection announced to screen readers", js: "document.getElementById('product-selection-status').textContent.includes('1.5 L Bottle selected')" },
      ],
    },
    {
      ...base,
      name: "wholesale-select-reduced-motion",
      page: "wholesale",
      media: [{ name: "prefers-reduced-motion", value: "reduce" }],
      actions: [{ evaluate: "window.__scrollStart = performance.now(); true" }, { click: '#products a[data-select-product="carton-packs"]' }],
      expect: [
        { name: "with reduced motion the jump is instant (in place right after the click)", js: "Math.abs(document.getElementById('enquiry').getBoundingClientRect().top) < 4" },
        { name: "product set", js: "document.getElementById('product').value === 'carton-packs'" },
      ],
    },
    {
      ...base,
      name: "wholesale-select-product-no-js",
      page: "wholesale",
      javascript: false,
      actions: [
        { click: '#products a[data-select-product="carton-packs"]' },
        { waitFor: "location.pathname === '/wholesale/carton-packs' && document.getElementById('product')?.value === 'carton-packs'" },
        ...fillEnquiry(noJsSelect, { product: null }),
        { click: SUBMIT },
        { waitFor: RESULT },
      ],
      expect: [
        { name: "without JS, Select product opens the pre-built page with the product selected", js: "true" },
        { name: "and the enquiry submits successfully", js: "Boolean(document.querySelector('[data-enquiry-reference]'))" },
        {
          name: "stored with the selected product",
          server: async ({ root }) => (await storedEnquiries(root)).find((r) => r.name === noJsSelect)?.product === "carton-packs" || "not stored with carton-packs",
        },
      ],
    },
    {
      ...base,
      name: "wholesale-selected-kept-on-error",
      page: "wholesale",
      path: "/wholesale/750ml-glass-bottle",
      actions: submitAndWait,
      expect: [
        { name: "validation errors shown", js: "document.querySelectorAll('form [aria-invalid=true]').length >= 5" },
        { name: "chosen product preserved through validation", js: "document.getElementById('product').value === '750ml-glass-bottle'" },
      ],
    },
    {
      ...base,
      name: "wholesale-unknown-product",
      page: "wholesale",
      expect: [
        {
          name: "unknown /wholesale/<product> returns HTTP 404 (noindex)",
          server: async ({ baseUrl }) => {
            const response = await fetch(`${baseUrl}/wholesale/not-a-product`);
            const html = await response.text();
            return (response.status === 404 && html.includes('content="noindex"')) || `status ${response.status}`;
          },
        },
        {
          name: "each known product page returns 200 with the product selected in server HTML",
          server: async ({ baseUrl }) => {
            for (const slug of ["750ml-glass-bottle", "1-5l-bottle", "carton-packs"]) {
              const response = await fetch(`${baseUrl}/wholesale/${slug}`);
              const html = await response.text();
              if (response.status !== 200 || !html.includes(`<option value="${slug}" selected=""`)) return `${slug}: ${response.status}`;
            }
            return true;
          },
        },
      ],
    },
    // -- Shop (F2) --
    {
      ...base,
      name: "hero-shop-now",
      page: "home",
      actions: [{ click: 'section[aria-labelledby="hero-heading"] a[href="/shop"]' }, { waitFor: "location.pathname === '/shop' && document.querySelector('main h1')" }],
      expect: [{ name: "hero Shop Now opens the working /shop listing", js: "location.pathname === '/shop' && document.querySelectorAll('main ul > li article').length === 3" }],
    },
    {
      ...base,
      name: "shop-listing",
      page: "shop",
      expect: [
        { name: "lists exactly the 3 confirmed standard products", js: "[...document.querySelectorAll('main article h2')].map(h => h.textContent).join('|') === '750 ml Glass Bottle|1.5 L Bottle|Carton Packs'" },
        { name: "unconfirmed products (sachet, customised) are not shown", js: "!/Sachet|Customised/i.test(document.querySelector('main').innerText)" },
        { name: "every product shows 'Price on request' (no invented prices)", js: "document.querySelectorAll('main article').length === 3 && [...document.querySelectorAll('main article')].every(a => a.innerText.includes('Price on request')) && !/₦|NGN/.test(document.querySelector('main').innerText)" },
        { name: "View product links go to the product pages", js: "[...document.querySelectorAll('main article a')].map(a => a.getAttribute('href')).join() === '/shop/750ml-glass-bottle,/shop/1-5l-bottle,/shop/carton-packs'" },
        { name: "nav Shop marked current", js: "document.querySelector('header nav [data-current]')?.textContent.trim().startsWith('Shop')" },
      ],
    },
    {
      ...base,
      name: "product-enquiry-journey",
      page: "product",
      actions: [
        { click: 'main article a[href="/wholesale/750ml-glass-bottle#enquiry"]' },
        { waitFor: "location.pathname === '/wholesale/750ml-glass-bottle' && document.getElementById('product')?.value === '750ml-glass-bottle'" },
        ...fillEnquiry(productJourney, { product: null }),
        ...submitAndWait,
      ],
      expect: [
        { name: "product page → enquiry form with the product preselected → success", js: "Boolean(document.querySelector('[data-enquiry-reference]'))" },
        { name: "enquiry stored with the product", server: async ({ root }) => (await storedEnquiries(root)).find((r) => r.name === productJourney)?.product === "750ml-glass-bottle" || "not stored with the product" },
      ],
    },
    {
      ...base,
      name: "product-page-content",
      page: "product",
      expect: [
        { name: "h1 is the product name", js: "document.querySelector('main h1')?.textContent === '750 ml Glass Bottle'" },
        { name: "price shown as 'Price on request' with an honest note (no checkout)", js: "document.querySelector('main dl').innerText.includes('Price on request') && document.querySelector('main').innerText.includes(\"Online checkout isn't available yet\") && !document.querySelector('main button')" },
        { name: "breadcrumb links back to /shop", js: "document.querySelector('nav[aria-label=Breadcrumb] a')?.getAttribute('href') === '/shop'" },
        { name: "other products link to their pages", js: "[...document.querySelectorAll('section[aria-labelledby=other-products-heading] a')].map(a => a.getAttribute('href')).join() === '/shop/1-5l-bottle,/shop/carton-packs'" },
      ],
    },
    {
      ...base,
      name: "shop-404s",
      page: "shop",
      expect: [
        {
          name: "unknown and unconfirmed product URLs return HTTP 404",
          server: async ({ baseUrl }) => {
            for (const path of ["/shop/not-a-product", "/shop/sachet-water", "/shop/custom-event-water", "/wholesale/sachet-water"]) {
              const status = (await fetch(`${baseUrl}${path}`)).status;
              if (status !== 404) return `${path}: ${status}`;
            }
            return true;
          },
        },
        {
          name: "each product page returns 200",
          server: async ({ baseUrl }) => {
            for (const slug of ["750ml-glass-bottle", "1-5l-bottle", "carton-packs"]) {
              const status = (await fetch(`${baseUrl}/shop/${slug}`)).status;
              if (status !== 200) return `${slug}: ${status}`;
            }
            return true;
          },
        },
      ],
    },
    // -- Desktop Shop dropdown (D-051) --
    {
      ...base,
      name: "shop-menu-open",
      page: "home",
      viewports: ["desktop"],
      actions: [{ click: "header nav button[aria-controls]" }],
      expect: [
        { name: "disclosure button (not role=menu) toggles aria-expanded", js: "document.querySelector('header nav button[aria-controls]').getAttribute('aria-expanded') === 'true' && !document.querySelector('[role=menu]')" },
        { name: "lists the 4 available Shop links", js: "(() => { const list = document.getElementById(document.querySelector('header nav button[aria-controls]').getAttribute('aria-controls')); return !list.hidden && [...list.querySelectorAll('a')].map(a => a.getAttribute('href')).join() === '/shop,/shop/750ml-glass-bottle,/shop/1-5l-bottle,/shop/carton-packs'; })()" },
        { name: "panel within the viewport", js: "(() => { const r = document.getElementById(document.querySelector('header nav button[aria-controls]').getAttribute('aria-controls')).getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })()" },
      ],
    },
    {
      ...base,
      name: "shop-menu-escape",
      page: "home",
      viewports: ["desktop"],
      actions: [{ click: "header nav button[aria-controls]" }, { press: "Tab" }, { press: "Escape" }],
      expect: [
        { name: "Escape closes the menu", js: "document.querySelector('header nav button[aria-controls]').getAttribute('aria-expanded') === 'false'" },
        { name: "focus returns to the Shop button", js: "document.activeElement === document.querySelector('header nav button[aria-controls]')" },
      ],
    },
    {
      ...base,
      name: "shop-menu-outside-click",
      page: "home",
      viewports: ["desktop"],
      actions: [{ click: "header nav button[aria-controls]" }, { clickAt: { x: 700, y: 500 } }],
      expect: [{ name: "click outside closes the menu", js: "document.querySelector('header nav button[aria-controls]').getAttribute('aria-expanded') === 'false'" }],
    },
    {
      ...base,
      name: "shop-menu-tab-away",
      page: "home",
      viewports: ["desktop"],
      actions: [{ click: "header nav button[aria-controls]" }, { press: "Tab", times: 5 }],
      expect: [{ name: "tabbing past the last link closes the menu", js: "document.querySelector('header nav button[aria-controls]').getAttribute('aria-expanded') === 'false'" }],
    },
    {
      ...base,
      name: "shop-menu-navigate",
      page: "home",
      viewports: ["desktop"],
      actions: [{ click: "header nav button[aria-controls]" }, { click: 'header nav a[href="/shop/carton-packs"]' }, { waitFor: "location.pathname === '/shop/carton-packs'" }],
      expect: [
        { name: "choosing a product opens its page", js: "document.querySelector('main h1')?.textContent === 'Carton Packs'" },
        { name: "menu closed after navigation", js: "document.querySelector('header nav button[aria-controls]').getAttribute('aria-expanded') === 'false'" },
      ],
    },
    {
      ...base,
      name: "shop-menu-no-js",
      page: "home",
      viewports: ["desktop"],
      javascript: false,
      expect: [{ name: "without JS, Shop is a working link to /shop", js: "document.querySelector('header nav a[href=\"/shop\"]')?.textContent.trim().startsWith('Shop') === true" }],
    },
    // -- Mobile Shop list --
    {
      ...base,
      name: "mobile-shop-list",
      page: "home",
      actions: [{ click: 'button[aria-controls="mobile-nav"]' }, { click: '#mobile-nav a[href="/shop/1-5l-bottle"]' }, { waitFor: "location.pathname === '/shop/1-5l-bottle'" }],
      expect: [
        { name: "drawer lists Shop's 4 links in a labelled group", js: "[...document.querySelectorAll('#mobile-nav ul[aria-labelledby] a')].length === 4" },
        { name: "tapping a product opens its page and closes the drawer", js: "document.querySelector('main h1')?.textContent === '1.5 L Bottle' && !document.getElementById('mobile-nav').open" },
      ],
    },
    // -- Validation --
    {
      ...base,
      name: "wholesale-validation-empty",
      page: "wholesale",
      actions: submitAndWait,
      expect: [
        { name: "shows a summary alert", js: "document.querySelector('form [role=alert]')?.textContent.includes('correct')" },
        { name: "required fields flagged (aria-invalid)", js: "document.querySelectorAll('form [aria-invalid=true]').length >= 7" },
        { name: "errors linked via aria-describedby", js: "[...document.querySelectorAll('form [aria-invalid=true]')].every(el => (el.getAttribute('aria-describedby') || '').split(' ').some(id => document.getElementById(id)?.textContent.trim()))" },
        { name: "focus moved to first invalid field", js: "document.activeElement?.id === 'name'" },
        { name: "no success shown", js: "!document.querySelector('[data-enquiry-reference]')" },
      ],
    },
    {
      ...base,
      name: "wholesale-validation-keeps-input",
      page: "wholesale",
      actions: [...fillEnquiry("Keep Me Hotel", { email: "not-an-email" }), ...submitAndWait],
      expect: [
        { name: "invalid email reported", js: "document.getElementById('email-error')?.textContent.includes('valid email')" },
        { name: "typed values kept after server validation", js: "document.getElementById('name').value === 'Keep Me Hotel' && document.getElementById('location').value.includes('Lagos') && document.getElementById('quantity').value === '120'" },
        { name: "focus moved to the invalid email field", js: "document.activeElement?.id === 'email'" },
      ],
    },
    // -- Successful delivery (dev-file adapter) --
    {
      ...base,
      name: "wholesale-success-dev",
      page: "wholesale",
      actions: [...fillEnquiry(success), ...submitAndWait],
      expect: [
        { name: "success shown with a reference", js: "/^RT-\\d{8}-[0-9A-F]{6}$/.test(document.querySelector('[data-enquiry-reference]')?.textContent ?? '')" },
        { name: "success announced (role=status) and focused", js: "document.activeElement?.getAttribute('role') === 'status'" },
        {
          name: "enquiry actually stored with the shown reference and all fields",
          server: async ({ evaluate, root }) => {
            const reference = await evaluate(REFERENCE);
            const record = (await storedEnquiries(root)).find((r) => r.reference === reference);
            if (!record) return `no stored record for ${reference}`;
            const ok = record.name === success && record.email === "buyer@example.com" && record.product === "750ml-glass-bottle" && record.quantity === 120 && record.unit === "cartons" && record.location.includes("Lagos") && record.consent === "yes";
            return ok || record;
          },
        },
      ],
    },
    // -- Progressive enhancement: works with JavaScript disabled --
    {
      ...base,
      name: "wholesale-no-javascript",
      page: "wholesale",
      javascript: false,
      actions: [...fillEnquiry(noJs), { click: SUBMIT }, { waitFor: RESULT }],
      expect: [
        { name: "success rendered by the server without JS", js: "Boolean(document.querySelector('[data-enquiry-reference]'))" },
        {
          name: "no-JS enquiry stored",
          server: async ({ root }) => (await storedEnquiries(root)).some((r) => r.name === noJs) || "not stored",
        },
      ],
    },
    // -- Prefill from product pages --
    { ...base, name: "wholesale-prefill", page: "wholesale", path: "/wholesale?product=1-5l-bottle", actions: [{ waitFor: "document.getElementById('product')?.value === '1-5l-bottle'", timeout: 5000 }], expect: [{ name: "?product= preselects the product", js: "document.getElementById('product').value === '1-5l-bottle'" }] },
    { ...base, name: "wholesale-prefill-unknown", page: "wholesale", path: "/wholesale?product=not-a-product", expect: [{ name: "unknown ?product= is ignored", js: "document.getElementById('product').value === ''" }] },
    // -- Spam protection --
    {
      ...base,
      name: "wholesale-honeypot",
      page: "wholesale",
      actions: [...fillEnquiry(honeypot), { evaluate: "document.querySelector('input[name=website_url]').value = 'http://spam.example'" }, ...submitAndWait],
      expect: [
        { name: "bot submission rejected (no success)", js: "!document.querySelector('[data-enquiry-reference]') && Boolean(document.querySelector('form [role=alert]'))" },
        { name: "bot submission not delivered", server: async ({ root }) => !(await storedEnquiries(root)).some((r) => r.name === honeypot) || "was stored" },
      ],
    },
    // -- Production adapter against a local mock of the Resend API --
    {
      ...base,
      name: "wholesale-resend-success",
      page: "wholesale",
      deliveries: ["resend-mock"],
      actions: [...fillEnquiry(viaResend), ...submitAndWait],
      expect: [
        { name: "success shown", js: "Boolean(document.querySelector('[data-enquiry-reference]'))" },
        {
          name: "Resend API called correctly (auth, to, reply_to, subject with reference)",
          server: async ({ evaluate, mock }) => {
            const reference = await evaluate(REFERENCE);
            const req = mock.requests.find((r) => r.body?.subject?.includes(reference));
            if (!req) return `no request with ${reference}`;
            const ok = req.method === "POST" && req.url === "/emails" && req.authorization === "Bearer test-key" && req.body.to?.[0] === "enquiries@example.com" && req.body.reply_to === "buyer@example.com" && req.body.text.includes(viaResend) && req.body.from.includes("ROCK-TAMA");
            return ok || req;
          },
        },
      ],
    },
    {
      ...base,
      name: "wholesale-resend-failure",
      page: "wholesale",
      deliveries: ["resend-mock"],
      actions: [...fillEnquiry(failing), ...submitAndWait],
      expect: [
        { name: "provider failure shows an honest error, not success", js: "!document.querySelector('[data-enquiry-reference]') && document.querySelector('form [role=alert]')?.textContent.includes('could not be sent')" },
        { name: "typed values kept for retry", js: "document.getElementById('name').value.includes('FAIL_DELIVERY')" },
        { name: "provider was actually called", server: async ({ mock }) => mock.requests.some((r) => r.body?.text?.includes(failing)) || "not called" },
      ],
    },
    {
      ...base,
      name: "wholesale-rate-limit",
      page: "wholesale",
      deliveries: ["resend-mock"],
      headers: { "x-forwarded-for": "203.0.113.77" },
      actions: Array.from({ length: 6 }, (_, i) => [{ navigate: "/wholesale" }, ...fillEnquiry(`RateLimit ${i}`), ...submitAndWait]).flat(),
      expect: [{ name: "6th submission within 10 minutes is refused", js: "document.querySelector('form [role=alert]')?.textContent.includes('Too many enquiries')" }],
    },
    // -- Hosted platform without delivery configuration --
    {
      ...base,
      name: "wholesale-unconfigured",
      page: "wholesale",
      deliveries: ["unconfigured"],
      actions: [...fillEnquiry(uniqueName("Unconfigured Hotel")), ...submitAndWait],
      expect: [{ name: "unconfigured delivery shows an honest error, not success", js: "!document.querySelector('[data-enquiry-reference]') && document.querySelector('form [role=alert]')?.textContent.includes('could not be sent')" }],
    },
  ]);
}

/** Assigns a unique documentation-range IP (RFC 5737) per journey unless the journey sets headers. */
function withOwnClient(journeys) {
  return journeys.map((journey, index) => (journey.headers ? journey : { ...journey, headers: { "x-forwarded-for": `198.51.100.${index + 1}` } }));
}
