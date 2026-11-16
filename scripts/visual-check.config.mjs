// Configuration for scripts/visual-check.mjs (D-040).
// Add a `sections` entry whenever a homepage section is implemented.

// Shared selectors for the mobile navigation checks.
const MENU_BUTTON_SELECTOR = 'button[aria-controls="mobile-nav"]';
const MENU_BUTTON = `document.querySelector('${MENU_BUTTON_SELECTOR}')`;
const DRAWER = 'document.getElementById("mobile-nav")';
const MOBILE = ["small", "mobile", "tablet"];
const HERO = 'document.querySelector(\'section[aria-labelledby="hero-heading"]\')';
const HERO_ANIMATED = `[...${HERO}.querySelectorAll('[class*="animate-enter"]')]`;
const CAROUSEL = 'document.querySelector("[aria-roledescription=carousel]")';
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
      expect: [
        { name: "decorative background uses one responsive cover image", js: "(() => { const images = document.querySelectorAll('[data-hero-background] img'); return images.length===1 && images[0].alt==='' && images[0].sizes==='100vw' && !!images[0].srcset && getComputedStyle(images[0]).objectFit==='cover' && !!images[0].closest('[aria-hidden=true]'); })()" },
        { name: "background is static and cannot intercept controls", js: "getComputedStyle(document.querySelector('[data-hero-background]')).pointerEvents==='none' && getComputedStyle(document.querySelector('[data-hero-background] img')).animationName==='none'" },
        { name: "hero CTAs and three-slide carousel preserved", js: "[...document.querySelectorAll('[data-hero-actions] a')].map(a=>a.getAttribute('href')).join(',')==='/shop,/wholesale' && document.querySelectorAll('[aria-roledescription=slide]').length===3" },
        { name: "hero text contrast over brightest possible background pixel ≥4.5:1", js: `(() => {
          const lum=c=>{const a=c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722};
          const gradient=getComputedStyle(document.querySelector('.hero-background-overlay')).backgroundImage;
          const stops=[...gradient.matchAll(/rgba[(]([^)]+)[)]/g)].map(m=>m[1].split(',').map(Number));
          if(!stops.length || stops.some(s=>s[3]<.84))return false;
          const maxBg=Math.max(...stops.map(s=>lum(s.slice(0,3).map(v=>v*s[3]+255*(1-s[3])))));
          return [...document.querySelectorAll('section[aria-labelledby=hero-heading] h1,section[aria-labelledby=hero-heading] p,[aria-roledescription=carousel] a')].every(e=>{const fg=lum(getComputedStyle(e).color.slice(4,-1).split(',').map(Number));return (fg+.05)/(maxBg+.05)>=4.5});
        })()` },
        { name: "hero layout and responsive crop measurements", server: async ({evaluate,root}) => {
          const m = await evaluate(`(() => { const h=document.querySelector('section[aria-labelledby=hero-heading]'); const b=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}; return {viewport:innerWidth,hero:b(h),heading:b(h.querySelector('h1')),actions:b(h.querySelector('[data-hero-actions]')),carousel:b(h.querySelector('[aria-roledescription=carousel]')),crop:getComputedStyle(h.querySelector('[data-hero-background] img')).objectPosition,overlay:getComputedStyle(h.querySelector('.hero-background-overlay')).backgroundImage}; })()`);
          const {mkdir,writeFile}=await import('node:fs/promises'); await mkdir(`${root}/docs/verification/hero-brand-integration`,{recursive:true}); await writeFile(`${root}/docs/verification/hero-brand-integration/measurements-${m.viewport}.json`,JSON.stringify(m,null,2)+'\n'); return true;
        } },
      ],
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

    {
      name: "products",
      page: "home",
      selector: "#products",
      reference: { x: 0, y: 580, width: 1086, height: 338 },
    },

    {
      name: "origin", page: "home", selector: "#origin",
      reference: { x: 0, y: 918, width: 1086, height: 187 },
      // Assertions cause a fresh page load: reveal the actual section before static captures.
      actions: [
        { evaluate: "document.querySelector('#origin').scrollIntoView({block:'end',behavior:'instant'}); true" },
        { waitFor: "document.querySelectorAll('#origin [data-reveal=shown]').length === 5" },
      ],
      expect: [
        { name: "all origin groups visible in comparison capture", js: "[...document.querySelectorAll('#origin [data-reveal]')].length === 5 && [...document.querySelectorAll('#origin [data-reveal]')].every(x => getComputedStyle(x).opacity === '1')" },
        { name: "origin layout measurements and text contrast", server: async ({ evaluate, root }) => {
          const data = await evaluate(`(() => {
            const box = selector => {const e=document.querySelector(selector);const r=e.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,width:r.width,height:r.height};};
            const lum = color => {const a=color.match(/[\\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4});return a[0]*0.2126+a[1]*0.7152+a[2]*0.0722;};
            const bg=lum(getComputedStyle(document.querySelector('#origin')).backgroundColor);
            const text=[...document.querySelectorAll('#origin h2,#origin p')].map(e=>{const fg=lum(getComputedStyle(e).color);return {text:e.textContent,ratio:(Math.max(bg,fg)+0.05)/(Math.min(bg,fg)+0.05)};});
            return {viewport:innerWidth,section:box('#origin'),image:box('#origin .media-frame-responsive'),heading:box('#origin h2'),paragraph:box('#origin p.mt-2'),indicators:box('#origin ul'),map:box('#origin [data-africa-map]'),textContrast:text};
          })()`);
          const { mkdirSync, writeFileSync } = await import('node:fs');
          const dir = `${root}/.verification/origin-measurements`;
          mkdirSync(dir, { recursive: true });
          writeFileSync(`${dir}/measurements-${data.viewport}.json`, JSON.stringify(data, null, 2));
          return data.textContrast.every(item => item.ratio >= 4.5);
        } },
        { name: "Tailwind utilities active (not an unstyled diagnostic build)", js: "getComputedStyle(document.querySelector('#origin > div')).display === 'grid' && getComputedStyle(document.querySelector('#origin h2')).fontSize === '30px'" },
        { name: "origin heading, factual description and three indicators", js: "document.querySelector('#origin h2')?.textContent === 'From Nanka, Anambra State.' && document.querySelectorAll('#origin li').length === 3 && document.querySelector('#origin p.mt-2')?.textContent.includes('This is where our story begins.')" },
        { name: "required claims registered and unverified", js: "[...document.querySelectorAll('#origin li[data-claim]')].map(x => x.dataset.claim).join(',') === 'naturallyProtectedSource,preservedNaturalPurity' && [...document.querySelectorAll('#origin li[data-claim]')].every(x => x.dataset.claimStatus === 'unverified')" },
        { name: "landscape reserves the responsive aspect ratio", js: "(() => { const r=document.querySelector('#origin .media-frame-responsive').getBoundingClientRect(); return Math.abs(r.width/r.height-(innerWidth<768?16/9:3))<0.04; })()" },
        { name: "map and icons decorative; no invented scientific copy", js: "[...document.querySelectorAll('#origin svg')].every(s => s.getAttribute('aria-hidden')==='true') && !/mineral|filtered|smooth taste|ancient/i.test(document.querySelector('#origin').innerText)" },
        { name: "pin anchored to projected approximate Nanka coordinate", js: "document.querySelector('[data-origin-pin]').getAttribute('transform') === 'translate(27.08306 33.93958)'" },
      ],
    },

    {
      name: "quality", page: "home", selector: "#quality",
      reference: { x: 0, y: 1105, width: 1086, height: 99 },
      actions: [{ evaluate: "document.querySelector('#quality').scrollIntoView({block:'center',behavior:'instant'}); true" }, { waitFor: "[...document.querySelectorAll('#quality [data-reveal]')].every(e=>e.dataset.reveal==='shown')" }],
      expect: [
        { name: "four quality indicators, every scientific label registered", js: "document.querySelectorAll('#quality li[data-claim]').length===4 && document.querySelector('#quality [data-claim=qualityPurityTrust]')!==null" },
        { name: "unsupported certification absent from visual and accessible DOM", js: "!document.querySelector('[data-certification]') && !/ISO|22000|international quality standards/i.test(document.querySelector('#quality').textContent)" },
        { name: "quality text and icons visible without overflow", js: "[...document.querySelectorAll('#quality h2,#quality p')].every(e=>e.scrollWidth<=e.clientWidth+1) && [...document.querySelectorAll('#quality [data-reveal]')].every(e=>getComputedStyle(e).opacity==='1')" },
      ],
    },
    {
      name: "supply", page: "home", selector: "#wholesale",
      reference: { x: 0, y: 1204, width: 1086, height: 82 },
      actions: [{evaluate:"document.querySelector('#wholesale').scrollIntoView({block:'center',behavior:'instant'}); true"},{waitFor:"document.querySelector('#wholesale [data-reveal]').dataset.reveal==='shown'"}],
      expect:[{name:"four existing business segments and working wholesale destination",js:"document.querySelectorAll('#wholesale li').length===4 && document.querySelector('#wholesale a').getAttribute('href')==='/wholesale' && !/export supply|delivery within/i.test(document.querySelector('#wholesale').textContent)"}],
    },
    {
      name: "footer", page: "home", selector: "body > footer",
      reference: { x: 0, y: 1286, width: 1086, height: 162 },
      expect: [
        {name:"footer has three labelled navigation groups and no fake links",js:"document.querySelectorAll('footer nav[aria-labelledby]').length===3 && !document.querySelector('footer a[href=\"#\"],footer a[href=\"\"]')"},
        {name:"newsletter honestly unavailable; no guessed social links",js:"document.querySelector('#footer-email').disabled && document.querySelector('footer button[aria-label=Subscribe]').disabled && !document.querySelector('footer form,footer ul[aria-label=\"Social media\"]')"},
        {name:"footer brand, copyright and source location present",js:"document.querySelector('footer').textContent.includes('ROCK-TAMA') && document.querySelector('footer').textContent.includes('Nanka, Anambra State, Nigeria') && /© 20[0-9]{2}/.test(document.querySelector('footer').textContent)"},
      ],
    },

    {
      name: "storefront-images", page: "home", viewports: ["small","mobile","tablet","laptop","large","hd","desktop"],
      actions: [{evaluate:"document.querySelector('#origin').scrollIntoView({block:'center',behavior:'instant'}); true"}],
      expect: [
        { name: "product grid keeps reference four columns only when wide enough", js: "getComputedStyle(document.querySelector('#products ul')).gridTemplateColumns.split(' ').length === (innerWidth>=1400?4:innerWidth>=768?2:1)" },
        { name: "product buttons remain inside their cards", js: "[...document.querySelectorAll('#products article a')].every(a=>{const r=a.getBoundingClientRect(),c=a.closest('article').getBoundingClientRect();return r.left>=c.left && r.right<=c.right+1 && r.bottom<=c.bottom+1;})" },
        { name: "all five supplied live assets are referenced; no placeholders in product/origin slots", js: "['750ml-glass-bottle.webp','1-5l-bottle.webp','carton-packs.webp','distributor-supply.webp','origin-landscape.webp'].every(path => [...document.querySelectorAll('main img')].some(img => decodeURIComponent(img.getAttribute('src')).includes(path))) && document.querySelectorAll('#products img').length===4 && document.querySelectorAll('#origin img').length===1" },
        { name: "real images use alt text, responsive sources and safe fit", js: "[...document.querySelectorAll('main img')].every(img=>(img.alt.length>0 || img.closest('[aria-hidden=true]')) && !!img.sizes && !!img.srcset && ['contain','cover'].includes(getComputedStyle(img).objectFit))" },
        { name: "origin remains lazy and uses its authored focal point", js: "document.querySelector('#origin img').loading==='lazy' && getComputedStyle(document.querySelector('#origin img')).objectPosition==='50% 60%'" },
        { name: "unconfirmed artwork not promoted into the live catalogue", js: "![...document.querySelectorAll('main img')].some(img=>/sachet|wedding|corporate|traditional-marriage/.test(img.src))" },
      ],
    },

    {
      name: "brand-assets", page: "home", selector: "body > header",
      expect: [
        {name:"header and footer use supplied logos with meaningful alt and no filters",js:"[document.querySelector('header img'),document.querySelector('footer img')].every(i=>i?.alt==='ROCK-TAMA' && getComputedStyle(i).filter==='none' && Math.abs(i.width/i.height-Number(i.getAttribute('width'))/Number(i.getAttribute('height')))<0.06)"},
        {name:"footer dark lettering has ivory contrast backing",js:"getComputedStyle(document.querySelector('footer img').parentElement).backgroundColor==='rgb(249, 244, 237)'"},
      ],
    },
    ...['750ml-glass-bottle','1-5l-bottle','carton-packs'].map((slug,index)=>({
      name: `hero-product-link-${index+1}`, kind: "functional", page: "home", viewports:["mobile","desktop"],
      actions:[{click:`[aria-roledescription=carousel] [role=group] button:nth-child(${index+1})`},{click:`[aria-roledescription=carousel] a[href="/shop/${slug}"]`},{waitFor:`location.pathname === '/shop/${slug}'`}],
      expect:[{name:"selected product opens a visible product page",js:"[...document.querySelectorAll('main')].some(m=>m.checkVisibility() && !!m.querySelector('h1') && !!m.querySelector('a[href^=\"/wholesale/\"]'))"}],
    })),
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
          js: `(() => { ${ENTER_ANIMS}.forEach(a => { a.pause(); a.currentTime = 0; }); return [...${HERO}.querySelectorAll('[data-hero-actions] a, [data-hero-actions] [data-pending]')].every(el => { el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return el.contains(hit); }); })()`,
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
      // Next keeps the previous route in the DOM (hidden) after client navigation, so scope to the visible <main>.
      expect: [{ name: "hero Shop Now opens the working /shop listing (one visible main, 3 product cards)", js: "(() => { const visible = [...document.querySelectorAll('main')].filter(m => m.checkVisibility()); return location.pathname === '/shop' && visible.length === 1 && visible[0].querySelectorAll('ul > li article').length === 3; })()" }],
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
    // -- Homepage §5 Our Products (D-087) --
    {
      ...base,
      name: "products-section",
      page: "home",
      viewports: ["desktop", "mobile"],
      expect: [
        { name: "4 cards in reference order", js: "[...document.querySelectorAll('#products li article h3')].map(h => h.textContent).join('|') === '750 ml Glass Bottle|1.5 L Bottle|Carton Packs|Distributor Supply'" },
        { name: "CTAs: 3 product pages + /wholesale (route registry)", js: "[...document.querySelectorAll('#products article a')].map(a => a.getAttribute('href') + ' ' + a.textContent.trim()).join('|') === '/shop/750ml-glass-bottle Shop 750 ml|/shop/1-5l-bottle Shop 1.5 L|/shop/carton-packs Shop Cartons|/wholesale Request Supply'" },
        { name: "no prices and no unconfirmed products", js: "!/₦|NGN|Price on request|Sachet|Customised/i.test(document.getElementById('products').innerText)" },
        { name: "Distributor Supply title in italics (reference)", js: "getComputedStyle([...document.querySelectorAll('#products h3')].at(-1)).fontStyle === 'italic'" },
        { name: "section heading + eyebrow present", js: "document.getElementById('products-heading')?.textContent === 'The ROCK TAMA Range'" },
        { name: "card hover feedback is a shadow/lift transition (no layout properties)", js: "getComputedStyle(document.querySelector('#products article')).transitionProperty.split(',').map(p => p.trim()).every(p => ['box-shadow', 'translate'].includes(p))" },
      ],
    },
    {
      ...base,
      name: "products-keyboard",
      page: "home",
      viewports: ["desktop"],
      actions: [
        { evaluate: "const h = document.getElementById('products-heading'); h.setAttribute('tabindex', '-1'); h.focus(); true" },
        ...Array.from({ length: 4 }, () => [{ press: "Tab" }, { evaluate: "window.__focusTrail = [...(window.__focusTrail || []), document.activeElement.getAttribute('href') + ' ' + getComputedStyle(document.activeElement).outlineStyle]; true" }]).flat(),
      ],
      expect: [
        {
          name: "Tab reaches the 4 CTAs in order, each with a visible focus outline",
          js: "JSON.stringify(window.__focusTrail) === JSON.stringify(['/shop/750ml-glass-bottle solid', '/shop/1-5l-bottle solid', '/shop/carton-packs solid', '/wholesale solid'])",
        },
      ],
    },
    {
      ...base,
      name: "products-card-link",
      page: "home",
      actions: [{ click: '#products a[href="/shop/1-5l-bottle"]' }, { waitFor: "location.pathname === '/shop/1-5l-bottle'" }],
      expect: [{ name: "Shop 1.5 L opens the working product page", js: "document.querySelector('main h1')?.textContent === '1.5 L Bottle'" }],
    },
    {
      ...base,
      name: "products-distributor-link",
      page: "home",
      actions: [{ click: '#products a[href="/wholesale"]' }, { waitFor: "location.pathname === '/wholesale'" }],
      expect: [{ name: "Request Supply opens the working wholesale page", js: "document.querySelector('h1')?.textContent === 'Wholesale and Distribution' && Boolean(document.querySelector('#enquiry form'))" }],
    },
    {
      ...base,
      name: "products-reveal",
      page: "home",
      expect: [
        { name: "below-the-fold cards start hidden (after JS) …", js: "[...document.querySelectorAll('#products li > [data-reveal]')].length === 4 && [...document.querySelectorAll('#products li > [data-reveal]')].every(el => el.dataset.reveal === 'hidden')" },
      ],
    },
    {
      ...base,
      name: "products-reveal-on-scroll",
      page: "home",
      actions: [
        { evaluate: "document.querySelector('#products li:last-child').scrollIntoView({ block: 'end', behavior: 'instant' }); true" },
        { waitFor: "[...document.querySelectorAll('#products li > [data-reveal]')].every(el => el.dataset.reveal === 'shown')" },
      ],
      expect: [
        { name: "… and are revealed when scrolled into view (opacity 1, staggered)", js: "[...document.querySelectorAll('#products li > [data-reveal]')].every(el => getComputedStyle(el).opacity === '1') && getComputedStyle(document.querySelector('#products li:nth-child(4) > [data-reveal]')).transitionDelay.includes('0.24s')" },
      ],
    },
    {
      ...base,
      name: "products-reveal-jump-past",
      page: "home",
      actions: [
        { evaluate: "window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); true" },
        { waitFor: "[...document.querySelectorAll('#products li > [data-reveal]')].every(el => el.dataset.reveal === 'shown')" },
      ],
      expect: [{ name: "cards jumped past without entering the viewport are still revealed (never stuck hidden)", js: "[...document.querySelectorAll('#products li > [data-reveal]')].every(el => el.dataset.reveal === 'shown')" }],
    },
    {
      ...base,
      name: "products-reduced-motion",
      page: "home",
      media: [{ name: "prefers-reduced-motion", value: "reduce" }],
      expect: [{ name: "reduced motion: nothing hidden, no reveal", js: "!document.querySelector('#products [data-reveal]') && [...document.querySelectorAll('#products article')].every(a => getComputedStyle(a.parentElement).opacity === '1')" }],
    },
    {
      ...base,
      name: "products-no-js",
      page: "home",
      javascript: false,
      expect: [{ name: "without JS: all 4 cards visible with working links", js: "!document.querySelector('#products [data-reveal]') && document.querySelectorAll('#products article a[href]').length === 4" }],
    },
    // -- §6 Our Origin: motion, reading order, accessibility and actual navigation --
    {
      ...base, name: "origin-initial", page: "home", viewports: ["mobile", "desktop"],
      expect: [{ name: "five below-fold groups hidden initially; map static", js: "document.querySelectorAll('#origin [data-reveal=hidden]').length === 5 && !document.querySelector('[data-africa-map]').closest('[data-reveal]')" }],
    },
    {
      ...base, name: "origin-reveal", page: "home", viewports: ["mobile", "desktop"],
      actions: [
        { evaluate: "window.__originBoxes=[...document.querySelectorAll('#origin [data-reveal]')].map(x=>[x.offsetLeft,x.offsetTop,x.offsetWidth,x.offsetHeight].join(',')); document.querySelector('[data-africa-map]').scrollIntoView({block:'end',behavior:'instant'}); true" },
        { waitFor: "document.querySelectorAll('#origin [data-reveal=shown]').length===5" },
      ],
      expect: [
        { name: "all groups visible with approved stagger and no layout shifts", js: "[...document.querySelectorAll('#origin [data-reveal]')].every((x,i)=>getComputedStyle(x).opacity==='1' && [x.offsetLeft,x.offsetTop,x.offsetWidth,x.offsetHeight].join(',')===window.__originBoxes[i]) && getComputedStyle(document.querySelector('#origin li:last-child > div')).transitionDelay.includes('0.12s')" },
        { name: "mobile reading order and map remain within section", js: "(() => {const s=document.querySelector('#origin').getBoundingClientRect();const m=document.querySelector('[data-africa-map]').getBoundingClientRect();const l=document.querySelector('#origin ul').getBoundingClientRect();return m.right<=s.right && m.bottom<=s.bottom && (innerWidth>=768 || m.top>=l.bottom);})()" },
      ],
    },
    {
      ...base, name: "origin-jump-past", page: "home", viewports: ["mobile", "desktop"],
      actions: [{evaluate:"window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}); true"},{waitFor:"document.querySelectorAll('#origin [data-reveal=shown]').length===5"}],
      expect: [{name:"no origin groups stranded hidden after End/anchor jump",js:"!document.querySelector('#origin [data-reveal=hidden]')"}],
    },
    {
      ...base, name: "origin-reduced-motion", page: "home", viewports: ["mobile", "desktop"], media: [{name:"prefers-reduced-motion",value:"reduce"}],
      expect: [{name:"origin immediately visible with reduced motion",js:"!document.querySelector('#origin [data-reveal]') && [...document.querySelectorAll('#origin li > div')].every(x=>getComputedStyle(x).opacity==='1')"}],
    },
    {
      ...base, name: "origin-no-js", page: "home", viewports: ["mobile", "desktop"], javascript: false,
      expect: [{name:"origin server-rendered and visible without JS; story link real",js:"!document.querySelector('#origin [data-reveal]') && document.querySelectorAll('#origin li').length===3 && !!document.querySelector('header a[href=\"/#origin\"]')"}],
    },
    {
      ...base, name: "origin-desktop-navigation", page: "shop", viewports: ["desktop"],
      actions: [{press:"Tab"},{evaluate:"const a=document.querySelector('header nav a[href=\"/#origin\"]'); a.focus(); sessionStorage.setItem('originFocus',getComputedStyle(a).outlineStyle); true"},{press:"Enter"},{waitFor:"location.pathname==='/' && location.hash==='#origin' && [...document.querySelectorAll('main')].some(m=>m.checkVisibility() && m.querySelector('#origin'))"}],
      expect: [{name:"keyboard Our Story reaches built origin from shop; focus ring present",js:"sessionStorage.getItem('originFocus')==='solid' && [...document.querySelectorAll('main')].filter(m=>m.checkVisibility()).length===1 && document.querySelector('#origin').getBoundingClientRect().bottom>0"}],
    },
    {
      ...base, name: "origin-mobile-navigation", page: "shop", viewports: ["mobile"],
      actions: [{click:MENU_BUTTON_SELECTOR},{click:'#mobile-nav a[href="/#origin"]'},{waitFor:"location.pathname==='/' && location.hash==='#origin' && !document.getElementById('mobile-nav').open"}],
      expect: [{name:"mobile Our Story reaches origin, closes drawer and releases scroll",js:"!document.getElementById('mobile-nav').open && getComputedStyle(document.documentElement).overflow!=='hidden' && [...document.querySelectorAll('main')].some(m=>m.checkVisibility() && m.querySelector('#origin'))"}],
    },
    {
      ...base, kind: "visual", name: "origin-enlarged-text", page: "home", viewports: ["mobile","desktop"],
      actions: [{evaluate:"document.documentElement.style.fontSize='200%'; document.querySelector('#origin').scrollIntoView({behavior:'instant'}); true"}],
      expect: [{name:"remaining sections reflow at 200% text",js:"[...document.querySelectorAll('#quality h2,#quality p,#quality li,#wholesale h2,#wholesale p,#wholesale li,footer p,footer li')].every(e=>e.scrollWidth<=e.clientWidth+1)"},{name:"record enlarged-text diagnostics",server: async ({evaluate,root}) => {
        const data=await evaluate(`(() => ({viewport:innerWidth,groups:[...document.querySelectorAll('#origin [data-reveal]')].map(e=>({state:e.dataset.reveal,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})),overflow:[...document.querySelectorAll('#origin h2,#origin p,#origin li,#quality h2,#quality p,#quality li,#wholesale h2,#wholesale p,#wholesale li,#wholesale a,footer p,footer li')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({tag:e.tagName,text:e.textContent,width:e.clientWidth,scroll:e.scrollWidth})),origin:document.querySelector('#origin').getBoundingClientRect().toJSON()}))()`);
        const {mkdirSync,writeFileSync}=await import('node:fs');const dir=`${root}/.verification/origin-measurements`;mkdirSync(dir,{recursive:true});writeFileSync(`${dir}/enlarged-${data.viewport}.json`,JSON.stringify(data,null,2));return true;
      }},{name:"200% text: origin text not clipped horizontally",js:"[...document.querySelectorAll('#origin h2,#origin p,#origin li')].every(x=>x.scrollWidth<=x.clientWidth+1)"}],
    },
    {
      ...base,name:"supply-cta",page:"home",viewports:["mobile","desktop"],
      actions:[{click:'#wholesale a[href="/wholesale"]'},{waitFor:"location.pathname==='/wholesale' && document.querySelector('#enquiry form')"}],
      expect:[{name:"supply CTA opens real quote flow",js:"[...document.querySelectorAll('main')].some(m=>m.checkVisibility() && m.querySelector('#enquiry form'))"}],
    },
    {
      ...base,name:"footer-product",page:"home",
      actions:[{click:'footer a[href="/shop/750ml-glass-bottle"]'},{waitFor:"location.pathname==='/shop/750ml-glass-bottle'"}],
      expect:[{name:"footer product link opens product page",js:"[...document.querySelectorAll('main')].some(m=>m.checkVisibility() && m.querySelector('h1')?.textContent==='750 ml Glass Bottle')"}],
    },
    {
      ...base,name:"quality-navigation",page:"shop",viewports:["desktop"],
      actions:[{click:'header nav a[href="/#quality"]'},{waitFor:"location.hash==='#quality' && document.querySelector('#quality')"}],
      expect:[{name:"Quality header link reaches actual section",js:"location.pathname==='/' && [...document.querySelectorAll('main')].some(m=>m.checkVisibility() && m.querySelector('#quality'))"}],
    },
    {
      ...base,name:"remaining-reduced-motion",page:"home",viewports:["mobile","desktop"],media:[{name:"prefers-reduced-motion",value:"reduce"}],
      expect:[{name:"quality and banner never hidden with reduced motion",js:"!document.querySelector('#quality [data-reveal],#wholesale [data-reveal]') && !document.querySelector('[data-certification]')"}],
    },
    {
      ...base,name:"remaining-no-js",page:"home",viewports:["mobile","desktop"],javascript:false,
      expect:[{name:"quality, supply, footer and working links server-rendered without JS",js:"!document.querySelector('#quality [data-reveal],#wholesale [data-reveal]') && document.querySelectorAll('#quality li').length===4 && document.querySelector('#wholesale a').getAttribute('href')==='/wholesale' && document.querySelectorAll('footer nav').length===3"}],
    },
    // -- Hero Product Carousel (D-073) --
    {
      ...base,
      name: "carousel-initial",
      page: "home",
      viewports: ["desktop"],
      expect: [
        { name: "region announced as a carousel", js: `${CAROUSEL}?.getAttribute("aria-roledescription") === "carousel" && Boolean(${CAROUSEL}.getAttribute("aria-label"))` },
        { name: "first slide is the 750 ml Glass Bottle (reference)", js: `${CAROUSEL}.dataset.carouselIndex === "0" && ${CAROUSEL}.querySelector('[data-slide]:not([inert])')?.dataset.slide === "750ml-glass-bottle"` },
        { name: "3 slides labelled 'N of 3', hidden ones inert + aria-hidden", js: `(() => { const s = [...${CAROUSEL}.querySelectorAll('[aria-roledescription=slide]')]; return s.length === 3 && s.every((el, i) => el.getAttribute('aria-label').startsWith(i + 1 + ' of 3')) && s.slice(1).every(el => el.inert && el.getAttribute('aria-hidden') === 'true'); })()` },
        { name: "product label buttons 750 ml | 1.5 L | Carton Packs, first pressed", js: `[...${CAROUSEL}.querySelectorAll('[role=group] button')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed')).join('|') === '750 ml:true|1.5 L:false|Carton Packs:false'` },
        { name: "Pause control labelled for its action", js: `${CAROUSEL}.querySelector('[data-carousel-toggle]').getAttribute('aria-label') === 'Stop automatic slide show'` },
        { name: "rotating (not hovered/focused), live region off", js: `${CAROUSEL}.dataset.carouselRotating === "true" && ${CAROUSEL}.querySelector('[aria-live]').getAttribute('aria-live') === 'off'` },
        { name: "View link goes to the 750 ml product page", js: `${CAROUSEL}.querySelector('a[href^="/shop/"]')?.getAttribute('href') === '/shop/750ml-glass-bottle'` },
        { name: "600ms slide-and-fade transition", js: `getComputedStyle(${CAROUSEL}.querySelector('[data-slide]')).transitionDuration.split(',').every(d => d.trim() === '0.6s')` },
      ],
    },
    {
      ...base,
      name: "carousel-auto-rotates",
      page: "home",
      viewports: ["desktop"],
      actions: [{ moveTo: { x: 5, y: 880 } }, { waitFor: `${CAROUSEL}.dataset.carouselIndex === "1"`, timeout: 8000 }],
      expect: [
        { name: "advanced to slide 2 (1.5 L) after the 6s interval", js: `${CAROUSEL}.querySelector('[data-slide]:not([inert])')?.dataset.slide === "1-5l-bottle"` },
        { name: "label buttons and View link follow the active slide", js: `${CAROUSEL}.querySelector('button[aria-pressed=true]').textContent === '1.5 L' && ${CAROUSEL}.querySelector('a[href^="/shop/"]').getAttribute('href') === '/shop/1-5l-bottle'` },
      ],
    },
    {
      ...base,
      name: "carousel-pauses",
      page: "home",
      viewports: ["desktop"],
      actions: [{ moveTo: { x: 1010, y: 450 } }],
      expect: [
        { name: "pauses while hovered", js: `${CAROUSEL}.dataset.carouselRotating === undefined` },
      ],
    },
    {
      ...base,
      name: "carousel-hidden-tab",
      page: "home",
      viewports: ["desktop"],
      actions: [
        { moveTo: { x: 5, y: 880 } },
        { evaluate: "Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); true" },
      ],
      expect: [{ name: "not rotating while the tab is hidden", js: `${CAROUSEL}.dataset.carouselRotating === undefined` }],
    },
    {
      ...base,
      name: "carousel-focus-pause",
      page: "home",
      viewports: ["desktop"],
      actions: [{ moveTo: { x: 5, y: 880 } }, { evaluate: `${CAROUSEL}.querySelector('a[href^="/shop/"]').focus(); true` }],
      expect: [{ name: "pauses while focus is inside (not on the toggle)", js: `${CAROUSEL}.dataset.carouselRotating === undefined` }],
    },
    {
      ...base,
      name: "carousel-manual-select",
      page: "home",
      viewports: ["desktop"],
      actions: [{ click: `[aria-roledescription=carousel] [role=group] button:nth-child(3)` }, { moveTo: { x: 5, y: 880 } }, { evaluate: "document.activeElement.blur(); true" }],
      expect: [
        { name: "shows Carton Packs (slide 3 of 3)", js: `${CAROUSEL}.querySelector('[data-slide]:not([inert])')?.getAttribute('aria-label') === '3 of 3: Carton Packs'` },
        { name: "manual choice stops auto-rotation until Play (even after leaving)", js: `${CAROUSEL}.dataset.carouselRotating === undefined && ${CAROUSEL}.querySelector('[data-carousel-toggle]').getAttribute('aria-label') === 'Start automatic slide show'` },
        { name: "live region polite when not auto-rotating", js: `${CAROUSEL}.querySelector('[aria-live]').getAttribute('aria-live') === 'polite'` },
        { name: "View link goes to the carton product page", js: `${CAROUSEL}.querySelector('a[href^="/shop/"]').getAttribute('href') === '/shop/carton-packs'` },
        { name: "hero height unchanged by the landscape carton slide", js: `document.querySelector('section[aria-labelledby=hero-heading]').getBoundingClientRect().height === 525` },
      ],
    },
    {
      ...base,
      name: "carousel-play-resumes",
      page: "home",
      viewports: ["desktop"],
      actions: [
        { click: `[aria-roledescription=carousel] [role=group] button:nth-child(2)` },
        { click: "[data-carousel-toggle]" },
        { moveTo: { x: 5, y: 880 } },
      ],
      expect: [{ name: "Play resumes rotation (focus on the toggle doesn't pause)", js: `${CAROUSEL}.dataset.carouselRotating === "true" && ${CAROUSEL}.querySelector('[data-carousel-toggle]').getAttribute('aria-label') === 'Stop automatic slide show'` }],
    },
    {
      ...base,
      name: "carousel-view-link",
      page: "home",
      viewports: ["desktop"],
      actions: [{ click: `[aria-roledescription=carousel] [role=group] button:nth-child(2)` }, { click: '[aria-roledescription=carousel] a[href="/shop/1-5l-bottle"]' }, { waitFor: "location.pathname === '/shop/1-5l-bottle'" }],
      expect: [{ name: "View link opens the product page", js: "document.querySelector('main h1')?.textContent === '1.5 L Bottle'" }],
    },
    {
      ...base,
      name: "carousel-reduced-motion",
      page: "home",
      viewports: ["desktop"],
      media: [{ name: "prefers-reduced-motion", value: "reduce" }],
      actions: [{ moveTo: { x: 5, y: 880 } }],
      expect: [
        { name: "no auto-rotation by default", js: `${CAROUSEL}.dataset.carouselRotating === undefined && ${CAROUSEL}.querySelector('[data-carousel-toggle]').getAttribute('aria-label') === 'Start automatic slide show'` },
        { name: "instant change (no transition)", js: `getComputedStyle(${CAROUSEL}.querySelector('[data-slide]')).transitionProperty === 'none'` },
      ],
    },
    {
      ...base,
      name: "carousel-no-js",
      page: "home",
      viewports: ["desktop", "mobile"],
      javascript: false,
      expect: [
        { name: "without JS: first slide only, labels are links to product pages", js: `(() => { const c = ${CAROUSEL}; const links = [...c.querySelectorAll('[role=group] a')].map(a => a.getAttribute('href')).join(); return c.querySelectorAll('[data-slide] [aria-hidden=true], [data-slide] img').length >= 1 && links === '/shop/750ml-glass-bottle,/shop/1-5l-bottle,/shop/carton-packs' && !c.querySelector('button'); })()` },
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
