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
  { select: { selector: "#product", value: overrides.product ?? "750ml-glass-bottle" } },
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
  const base = { kind: "functional", viewports: ["mobile"] };
  return [
    // -- Navigation reaches the working page (dev-file mode) --
    {
      ...base,
      name: "cta-request-wholesale",
      page: "home",
      actions: [{ click: 'section[aria-labelledby="hero-heading"] a[href="/wholesale"]' }, { waitFor: "location.pathname === '/wholesale' && document.querySelector('form')" }],
      expect: [
        { name: "hero Request Wholesale navigates to a working /wholesale form", js: "location.pathname === '/wholesale' && Boolean(document.querySelector('form button[type=submit]'))" },
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
  ];
}
