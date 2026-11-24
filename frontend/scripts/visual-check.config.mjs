import {checkoutPrefillJourneys} from "./checkout-prefill.config.mjs";
import {distributorDashboardJourneys} from "./distributor-dashboard.config.mjs";
import {distributorAccountJourneys} from "./distributor-account.config.mjs";
import {distributorAuthJourneys} from "./distributor-auth.config.mjs";
import {checkoutJourneys} from "./checkout-check.config.mjs";
import {adminJourneys} from "./admin-check.config.mjs";
// Configuration for scripts/visual-check.mjs (D-040).
// Add a `sections` entry whenever a homepage section is implemented.

// Shared selectors for the mobile navigation checks.
const MENU_BUTTON_SELECTOR = 'button[aria-controls="mobile-nav"]';
const MENU_BUTTON = `document.querySelector('${MENU_BUTTON_SELECTOR}')`;
const DRAWER = 'document.getElementById("mobile-nav")';
const MOBILE_SHOP_SELECTOR = "#mobile-shop-label";
const MOBILE_SHOP = `document.querySelector('${MOBILE_SHOP_SELECTOR}').parentElement`;
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
    { name: "contact", path: "/contact" },
    { name: "ourStory", path: "/our-story" },
    { name: "quality", path: "/quality" },
    { name: "admin-login", path: "/auth/admin" },
    { name: "accountLogin", path: "/account/login" },
    { name: "accountRegister", path: "/account/register" },
    { name: "checkout", path: "/checkout" },
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
        { name: "carousel toolbar hidden until keyboard focus", js: "getComputedStyle(document.querySelector('.hero-carousel-controls')).clipPath==='inset(50%)'" },
        { name: "keyboard controls reveal without resizing hero", js: "(() => { const h=document.querySelector('.hero-carousel'),c=document.querySelector('.hero-carousel-controls'),b=c.querySelector('button');const before=h.offsetHeight;b.focus();const ok=getComputedStyle(c).clipPath==='none' && h.offsetHeight===before;b.blur();return ok;})()" },
        { name: "background is static and cannot intercept controls", js: "getComputedStyle(document.querySelector('[data-hero-background]')).pointerEvents==='none' && getComputedStyle(document.querySelector('[data-hero-background] img')).animationName==='none'" },
        { name: "hero CTAs and five-slide carousel", js: "[...document.querySelectorAll('[data-active=true] [data-hero-actions] a')].map(a=>a.getAttribute('href')).join(',')==='/shop,/wholesale' && document.querySelectorAll('[aria-roledescription=slide]').length===5" },
        { name: "hero text contrast over brightest possible background pixel ≥4.5:1", js: `(() => {
          const lum=c=>{const a=c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722};
          const overlay=getComputedStyle(document.querySelector('.hero-background-overlay')); const gradient=overlay.backgroundImage==='none'?overlay.backgroundColor:overlay.backgroundImage;
          const stops=[...gradient.matchAll(/rgba[(]([^)]+)[)]/g)].map(m=>m[1].split(',').map(Number)).slice(0,innerWidth>=768?2:1);
          if(!stops.length || stops.some(s=>s[3]<.84))return false; if(innerWidth>=768 && document.querySelector('.hero-carousel-copy').getBoundingClientRect().right>innerWidth*.58)return false;
          const maxBg=Math.max(...stops.map(s=>lum(s.slice(0,3).map(v=>v*s[3]+255*(1-s[3])))));
          return [...document.querySelectorAll('section[aria-labelledby=hero-heading] h1,section[aria-labelledby=hero-heading] p,section[aria-labelledby=hero-heading] h2')].every(e=>{const fg=lum(getComputedStyle(e).color.slice(4,-1).split(',').map(Number));return (fg+.05)/(maxBg+.05)>=4.5});
        })()` },
        { name: "hero layout and responsive crop measurements", server: async ({evaluate,root}) => {
          const m = await evaluate(`(() => { const h=document.querySelector('section[aria-labelledby=hero-heading]'); const b=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}; return {viewport:innerWidth,hero:b(h),heading:b(h.querySelector('h1')),actions:b(h.querySelector('[data-hero-actions]')),carousel:b(h.querySelector('[aria-roledescription=carousel]')),crop:getComputedStyle(h.querySelector('[data-hero-background] img')).objectPosition,overlay:getComputedStyle(h.querySelector('.hero-background-overlay')).backgroundImage}; })()`);
          const {mkdir,writeFile}=await import('node:fs/promises'); await mkdir(`${root}/.verification/hero-measurements`,{recursive:true}); await writeFile(`${root}/.verification/hero-measurements/measurements-${m.viewport}.json`,JSON.stringify(m,null,2)+'\n'); return true;
        } },
      ],
    },

    {
      name: "trust",
      page: "home",
      selector: 'section[aria-label="Purity highlights"]',
      expect: [
        { name: "7 highlights exposed to assistive technology", js: "document.querySelectorAll('section[aria-label=\"Purity highlights\"] ul:not([aria-hidden]) > li').length === 7 && document.querySelectorAll('section[aria-label=\"Purity highlights\"] ul[aria-hidden=true] > li').length === 7" },
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
        {name:"footer has three labelled navigation groups and no fake links",js:"document.querySelectorAll('footer nav[aria-labelledby]').length===3 && !document.querySelector('footer nav a[href=\"#\"],footer a[href=\"\"]')"},
        {name:"newsletter honestly unavailable",js:"document.querySelector('#footer-email').disabled && document.querySelector('footer button[aria-label=Subscribe]').disabled && !document.querySelector('footer form')"},
        // D-111: owner chose "#" placeholders for the four reference platforms until official URLs exist (launch-blocked).
        {name:"social links: Instagram, Facebook, LinkedIn, YouTube with names, decorative icons, 44px targets",js:"(() => { const a=[...document.querySelectorAll('footer ul[aria-label=\"Social media\"] a')]; return a.map(e=>e.getAttribute('aria-label')).join('|')==='ROCK-TAMA on Instagram|ROCK-TAMA on Facebook|ROCK-TAMA on LinkedIn|ROCK-TAMA on YouTube' && a.every(e=>e.querySelector('svg[aria-hidden=true]') && e.getBoundingClientRect().width>=44 && e.getBoundingClientRect().height>=44); })()"},
        {name:"footer brand, copyright and source location present",js:"document.querySelector('footer').textContent.includes('ROCK-TAMA') && document.querySelector('footer').textContent.includes('Nanka, Anambra State, Nigeria') && /© 20[0-9]{2}/.test(document.querySelector('footer').textContent)"},
      ],
    },

    {
      name: "testimonials", page: "home", selector: "#testimonials",
      actions: [{ evaluate: "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); true" }, { waitFor: "[...document.querySelectorAll('#testimonials [data-reveal]')].every(e=>e.dataset.reveal!=='hidden')" }, { moveTo: { x: 2, y: 2 } }],
      expect: [
        { name: "six testimonials with quote and attribution, each a labelled slide", js: "document.querySelectorAll('#testimonials ul:not([aria-hidden]) figure blockquote').length===6 && [...document.querySelectorAll('#testimonials ul:not([aria-hidden]) li')].every((li,i)=>li.getAttribute('aria-label').startsWith((i+1)+' of 6: ')) && [...document.querySelectorAll('#testimonials figcaption')].every(c=>c.textContent.trim().length>0)" },
        { name: "sample content is visibly labelled (D-111)", js: "!!document.querySelector('#testimonials [data-sample-notice]')?.checkVisibility() && /Sample testimonials/.test(document.querySelector('#testimonials').textContent)" },
        { name: "quotes make no product, quality or certification claims", js: "!/pure|lab|tested|TDS|certif|NAFDAC|ISO|mineral|filtered/i.test([...document.querySelectorAll('#testimonials blockquote')].map(b=>b.textContent).join(' '))" },
        { name: "testimonial text visible without overflow", js: "[...document.querySelectorAll('#testimonials h2,#testimonials blockquote p,#testimonials figcaption')].every(e=>e.scrollWidth<=e.clientWidth+1) && [...document.querySelectorAll('#testimonials [data-reveal]')].every(e=>getComputedStyle(e).opacity==='1')" },
        { name: "cards per view: 1 on phones, 2 on tablet, 3 on desktop", js: "(() => { const t=document.querySelector('#testimonials [tabindex=\"0\"]'); const w=t.querySelector('li').getBoundingClientRect().width; const per=Math.round((t.clientWidth+24)/(w+24)); return per===(innerWidth>=1024?3:innerWidth>=768?2:1); })()" },
        { name: "no visible controls (owner, D-113; the pause button appears only on keyboard focus); scroll track is keyboard focusable", js: "[...document.querySelectorAll('#testimonials button')].every(b=>{const c=getComputedStyle(b);return c.position==='absolute'&&(c.clipPath.startsWith('inset')||c.clip.startsWith('rect(0'))}) && document.querySelector('#testimonials [aria-roledescription=carousel] [tabindex]').tabIndex===0" },
      ],
    },
    {
      name: "home-contact", page: "home", selector: "#contact",
      actions: [{ evaluate: "document.querySelector('#contact').scrollIntoView({block:'start',behavior:'instant'}); true" }, { waitFor: "[...document.querySelectorAll('#contact [data-reveal]')].every(e=>e.dataset.reveal!=='hidden')" }],
      expect: [
        { name: "homepage Contact Us: h2 then WhatsApp, call, email and address cards as h3 (D-117)", js: "document.querySelector('#contact h2')?.textContent==='Get in Touch' && [...document.querySelectorAll('#contact [data-channel]')].map(e=>e.dataset.channel).join()==='whatsapp,phone,email,address' && document.querySelectorAll('#contact [data-channel] h3').length===4" },
        { name: "WhatsApp, call, email and directions are live links; no duplicate wholesale box", js: "document.querySelector('#contact [data-channel=whatsapp] a')?.href.startsWith('https://wa.me/2349034018849?') && document.querySelector('#contact [data-channel=phone] a')?.getAttribute('href')==='tel:+2349034018849' && document.querySelector('#contact [data-channel=email] a')?.getAttribute('href').startsWith('mailto:rocktamanaturalspringwater@gmail.com?') && document.querySelector('#contact [data-channel=address] a')?.href.startsWith('https://www.google.com/maps/search/?api=1&query=Nanka') && !document.querySelector('#contact [data-channel] [data-pending]') && !document.querySelector('#contact aside')" },
        { name: "sits after the supply banner, before the footer", js: "document.querySelector('main').lastElementChild.id==='contact' && !!(document.querySelector('#wholesale').compareDocumentPosition(document.querySelector('#contact')) & Node.DOCUMENT_POSITION_FOLLOWING)" },
        { name: "contact text visible without overflow", js: "[...document.querySelectorAll('#contact h2,#contact h3,#contact p')].every(e=>e.scrollWidth<=e.clientWidth+1) && [...document.querySelectorAll('#contact [data-reveal]')].every(e=>getComputedStyle(e).opacity==='1')" },
      ],
    },
    {
      name: "contact", page: "contact", selector: "main",
      expect: [
        { name: "Contact Us page: one h1, WhatsApp, call, email and address channels in order", js: "document.querySelectorAll('h1').length===1 && document.querySelector('main h1').textContent==='Get in Touch' && [...document.querySelectorAll('main [data-channel]')].map(e=>e.dataset.channel).join()==='whatsapp,phone,email,address' && document.querySelector('main [data-channel=address]').textContent.includes('Nanka, Anambra State, Nigeria')" },
        { name: "WhatsApp opens wa.me, Call the dialler, Email a mailto with subject, Directions Google Maps", js: "document.querySelector('main [data-channel=whatsapp] a')?.href.startsWith('https://wa.me/2349034018849?') && document.querySelector('main [data-channel=phone] a')?.getAttribute('href')==='tel:+2349034018849' && document.querySelector('main [data-channel=email] a')?.getAttribute('href').startsWith('mailto:rocktamanaturalspringwater@gmail.com?subject=') && document.querySelector('main [data-channel=address] a')?.href==='https://www.google.com/maps/search/?api=1&query=Nanka%2C%20Anambra%20State%2C%20Nigeria' && !document.querySelector('main [data-channel] [data-pending]')" },
        { name: "wholesale pointer links to the working enquiry page", js: "document.querySelector('main aside a')?.getAttribute('href')==='/wholesale'" },
        { name: "header Contact is a live link marked current", js: "(() => { const a=[...document.querySelectorAll('header a')].find(e=>e.getAttribute('href')==='/contact'); return !!a && (innerWidth<1024 || a.getAttribute('aria-current')==='page'); })()" },
        { name: "contact text visible without overflow", js: "[...document.querySelectorAll('main h1,main h2,main p')].every(e=>e.scrollWidth<=e.clientWidth+1)" },
      ],
    },

    {
      name: "storefront-images", page: "home", viewports: ["small","mobile","tablet","laptop","large","hd","desktop"],
      actions: [{evaluate:"document.querySelector('#origin').scrollIntoView({block:'center',behavior:'instant'}); true"}],
      expect: [
        { name: "product grid keeps reference four columns only when wide enough", js: "getComputedStyle(document.querySelector('#products ul')).gridTemplateColumns.split(' ').length === (innerWidth>=1400?4:innerWidth>=768?2:1)" },
        { name: "product buttons remain inside their cards", js: "[...document.querySelectorAll('#products article a')].every(a=>{const r=a.getBoundingClientRect(),c=a.closest('article').getBoundingClientRect();return r.left>=c.left && r.right<=c.right+1 && r.bottom<=c.bottom+1;})" },
        { name: "all five supplied live assets are referenced; no placeholders in product/origin slots", js: "['750ml-glass-bottle.webp','1-5l-bottle.webp','carton-packs.webp','distributor-supply.webp','origin-landscape.webp'].every(path => [...document.querySelectorAll('main img')].some(img => decodeURIComponent(img.getAttribute('src')).includes(path))) && document.querySelectorAll('#products img').length===16 && document.querySelectorAll('#origin img').length===1" },
        { name: "real images use alt text, responsive sources and safe fit", js: "[...document.querySelectorAll('main img')].every(img=>(img.alt.length>0 || img.closest('[aria-hidden=true]')) && !!img.sizes && !!img.srcset && ['contain','cover'].includes(getComputedStyle(img).objectFit))" },
        { name: "origin remains lazy and uses its authored focal point", js: "document.querySelector('#origin img').loading==='lazy' && getComputedStyle(document.querySelector('#origin img')).objectPosition==='50% 60%'" },
        { name: "unconfirmed artwork not promoted into the live catalogue", js: "![...document.querySelectorAll('#products img')].some(img=>/sachet|wedding|corporate|traditional-marriage/.test(img.src))" },
      ],
    },

    {
      name: "brand-assets", page: "home", selector: "body > header",
      expect: [
        {name:"header and footer logos keep their aspect ratios and alt text",js:"[document.querySelector('header img'),document.querySelector('footer img')].every(i=>i?.alt==='ROCK-TAMA' && Math.abs(i.width/i.height-Number(i.getAttribute('width'))/Number(i.getAttribute('height')))<0.06)"},
        {name:"footer logo uses a light mark on phones and ivory backing at wider sizes",js:"(() => { const logo=document.querySelector('footer img'); const filter=getComputedStyle(logo).filter; const backing=getComputedStyle(logo.parentElement).backgroundColor; return innerWidth<768 ? filter==='brightness(0) invert(1)' && backing==='rgba(0, 0, 0, 0)' : filter==='none' && backing==='rgb(249, 244, 237)'; })()"},
      ],
    },
    ...rangeMediaJourneys(),
    // ---- Hero entrance animation (M3.3): deterministic, no timing-based sleeps ----
    {
      name: "hero-animation-initial",
      page: "home",
      selector: 'section[aria-labelledby="hero-heading"]',
      viewports: ["mobile", "desktop"],
      actions: [{ pauseAnimationsAt: 0 }],
      expect: [
        { name: "brand and bottle entrance animations present", js: `${ENTER_ANIMS}.length >= 2` },
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
          js: `(() => { ${ENTER_ANIMS}.forEach(a => { a.pause(); a.currentTime = 0; }); return [...${HERO}.querySelectorAll('[data-active=true] [data-hero-actions] a')].every(el => { el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return el.contains(hit); }); })()`,
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

    {
      name:"wholesale-hero-background",page:"wholesale",selector:'section[aria-labelledby="wholesale-heading"]',viewports:["small","mobile","tablet","laptop","large","desktop"],
      expect:[
        {name:"one decorative responsive warehouse background",js:"(()=>{const h=document.querySelector('section[aria-labelledby=wholesale-heading]'),i=h.querySelector('img');return h.querySelectorAll('img').length===1 && i.alt==='' && !!i.closest('[aria-hidden=true]') && i.sizes==='100vw' && getComputedStyle(i).objectFit==='cover' && decodeURIComponent(i.src).includes('/images/wholesale/warehouse-hero.webp')})()"},
        {name:"warehouse overlay gives all hero text at least4.5:1 contrast",server:async({evaluate,root})=>{
          const result=await evaluate(`(()=>{const h=document.querySelector('section[aria-labelledby=wholesale-heading]'),i=h.querySelector('img'),o=getComputedStyle(i.nextElementSibling);const rgb=s=>s.match(/[0-9.]+/g).map(Number);const raw=o.backgroundImage==='none'?o.backgroundColor:o.backgroundImage;const stops=[...raw.matchAll(/rgba[(]([^)]+)[)](?: ([0-9.]+)%)?/g)].map((m,j)=>({rgba:rgb(m[1]),p:m[2]?Number(m[2]):j?100:0}));const lum=a=>{const b=a.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return b[0]*.2126+b[1]*.7152+b[2]*.0722};const text=[...h.querySelectorAll('h1,p')].map(e=>{const r=document.createRange();r.selectNodeContents(e);const x=(r.getBoundingClientRect().right-h.getBoundingClientRect().left)/h.clientWidth*100;let alpha=stops.at(-1)?.rgba[3];for(let j=1;j<stops.length;j++){if(x<=stops[j].p){const a=stops[j-1],b=stops[j];alpha=a.rgba[3]+(b.rgba[3]-a.rgba[3])*(x-a.p)/(b.p-a.p);break}}const bg=stops[0]?.rgba.slice(0,3).map(v=>v*alpha+255*(1-alpha));const ratio=bg?(lum(rgb(getComputedStyle(e).color).slice(0,3))+.05)/(lum(bg)+.05):0;return {text:e.textContent.trim(),ratio}});return {width:innerWidth,overlay:raw,text}})()`);
          const {mkdir,writeFile}=await import('node:fs/promises');const dir=`${root}/docs/verification/wholesale-overlay-refinement`;await mkdir(dir,{recursive:true});await writeFile(`${dir}/contrast-${result.width}.json`,JSON.stringify(result,null,2)+'\n');return result.text.every(x=>x.ratio>=4.5);
        }},
        {name:"original wholesale heading and anchor actions retained",js:"document.querySelector('#wholesale-heading').textContent==='Wholesale and Distribution' && [...document.querySelectorAll('section[aria-labelledby=wholesale-heading] a')].map(a=>a.getAttribute('href')).join(',')==='#products,#enquiry'"},
        {name:"background is stationary and cannot block actions",js:"(()=>{const i=document.querySelector('section[aria-labelledby=wholesale-heading] img');return getComputedStyle(i).animationName==='none' && getComputedStyle(i.parentElement).pointerEvents==='none'})()"},
      ],
    },
    ...shopReferenceJourneys(),
    ...checkoutJourneys(),
    ...checkoutPrefillJourneys(),
    ...adminJourneys(),
    ...distributorAccountJourneys(),
    ...distributorDashboardJourneys(),
    ...distributorAuthJourneys(),
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
        { name: "Shop products start collapsed", js: `!${MOBILE_SHOP}.open && !${MOBILE_SHOP}.querySelector("a").checkVisibility()` },
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
  // Expected outcomes of wrong passwords and rate limits in the auth journeys (D-134): Chrome logs every 401/429
  // fetch response as a resource error. Only the login endpoint, only these two statuses.
  ignoreConsole: [/^Failed to load resource: the server responded with a status of (401|429) \([A-Za-z ]+\) \(https?:\/\/[^/]+\/api\/v1\/auth\/login\)$/],
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
      expect: [{ name: "hero Shop Now opens the working /shop listing (one visible main and related product cards)", js: "(() => { const visible = [...document.querySelectorAll('main')].filter(m => m.checkVisibility()); return location.pathname === '/shop' && visible.length === 1 && visible[0].querySelectorAll('[data-shop-products] article').length === 4; })()" }],
    },
    {
      ...base,
      name: "shop-listing",
      page: "shop",
      expect: [
        { name: "lists exactly the 3 confirmed standard products", js: "[...document.querySelectorAll('[data-shop-products] article h3')].slice(0,3).map(h => h.textContent).join('|') === '750 ml Glass Bottle|1.5 L Bottle|Carton Packs'" },
        { name: "unconfirmed products (sachet, customised) are not shown", js: "!/Sachet|Customised/i.test(document.querySelector('main').innerText)" },
        { name: "price shown and paid online (D-123)", js: "document.querySelector('[data-shop-price]').textContent.includes('650.00') && document.querySelector('main').innerText.includes('Paid securely online at checkout')" },
        { name: "View product links go to the product pages", js: "[...document.querySelectorAll('[data-shop-products] article a')].map(a => a.getAttribute('href')).join() === '/shop/750ml-glass-bottle,/shop/1-5l-bottle,/shop/carton-packs,/wholesale'" },
        { name: "nav Shop marked current", js: "document.querySelector('header nav [data-current]')?.textContent.trim().startsWith('Shop')" },
      ],
    },
    // D-125: every Shop menu URL renders the same storefront, with its product preselected.
    {
      ...base,
      name: "product-page-content",
      page: "product",
      expect: [
        { name: "/shop/750ml-glass-bottle = the All Products storefront with the 750 ml bottle preselected", js: "(()=>{const m=[...document.querySelectorAll('main')].find(e=>e.checkVisibility());return !!m && m.querySelector('nav[aria-label=Breadcrumb] [aria-current=page]')?.textContent==='750 ml Glass Bottle' && m.querySelector('[data-pack=\"750-single\"] [data-pack-view]')?.getAttribute('aria-pressed')==='true' && !!m.querySelector('#shop-heading');})() && document.querySelectorAll('[data-shop-products] article').length===4 && !!document.querySelector('[data-buy-now]')" },
        { name: "product keeps its own page title", js: "document.title.startsWith('750 ml Glass Bottle')" },
        { name: "breadcrumb links back to /shop", js: "[...document.querySelectorAll('nav[aria-label=Breadcrumb] a')].some(a=>a.getAttribute('href') === '/shop')" },
      ],
    },
    {
      ...base,
      name: "product-urls-same-ui",
      page: "shop",
      actions: [{ navigate: "/shop/carton-packs" }, { waitFor: "(()=>{const m=[...document.querySelectorAll('main')].find(e=>e.checkVisibility());return !!m && m.querySelector('nav[aria-label=Breadcrumb] [aria-current=page]')?.textContent==='Carton Packs' && m.querySelector('[data-pack=\"1500-carton\"] [data-pack-view]')?.getAttribute('aria-pressed')==='true' && !!m.querySelector('#shop-heading');})()" }, { evaluate: "sessionStorage.setItem('cartonPrice',document.querySelector('[data-shop-price]').textContent); true" }, { navigate: "/shop/1-5l-bottle" }, { waitFor: "(()=>{const m=[...document.querySelectorAll('main')].find(e=>e.checkVisibility());return !!m && m.querySelector('nav[aria-label=Breadcrumb] [aria-current=page]')?.textContent==='1.5 L Bottle' && m.querySelector('[data-pack=\"1500-carton\"] [data-pack-view]')?.getAttribute('aria-pressed')==='true' && !!m.querySelector('#shop-heading');})()" }],
      expect: [{ name: "carton and 1.5 L URLs open the same storefront: 1.5 L size, carton preselected (₦14,500.00)", js: "(sessionStorage.getItem('cartonPrice')||'').includes('14,500.00') && document.querySelector('[data-shop-price]').textContent.includes('14,500.00') && [...document.querySelectorAll('button[aria-pressed=true]')].some(b=>b.textContent==='1.5 L') && [...document.querySelectorAll('[data-pack]')].map(e=>e.dataset.pack).join()==='1500-carton'" }],
    },
    {
      ...base,
      name: "product-switch-resets",
      page: "product",
      viewports: ["desktop"],
      actions: [{ click: "header nav button[aria-controls]" }, { click: 'header nav a[href="/shop/carton-packs"]' }, { waitFor: "location.pathname==='/shop/carton-packs' && (()=>{const m=[...document.querySelectorAll('main')].find(e=>e.checkVisibility());return !!m && m.querySelector('nav[aria-label=Breadcrumb] [aria-current=page]')?.textContent==='Carton Packs' && m.querySelector('[data-pack=\"1500-carton\"] [data-pack-view]')?.getAttribute('aria-pressed')==='true' && !!m.querySelector('#shop-heading');})()" }],
      expect: [{ name: "switching product in the Shop menu resets the selection to the new product", js: "document.querySelector('[data-shop-price]').textContent.includes('14,500.00')" }],
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
        { name: "choosing a product opens the shop storefront with it preselected (D-125)", js: "(()=>{const m=[...document.querySelectorAll('main')].find(e=>e.checkVisibility());return !!m && m.querySelector('nav[aria-label=Breadcrumb] [aria-current=page]')?.textContent==='Carton Packs' && m.querySelector('[data-pack=\"1500-carton\"] [data-pack-view]')?.getAttribute('aria-pressed')==='true' && !!m.querySelector('#shop-heading');})()" },
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
    // -- Mobile Shop disclosure --
    {
      ...base,
      name: "mobile-shop-list",
      page: "home",
      viewports: MOBILE,
      actions: [
        { click: MENU_BUTTON_SELECTOR },
        { waitFor: `!${MOBILE_SHOP}.open` },
        { click: MOBILE_SHOP_SELECTOR },
        { waitFor: `${MOBILE_SHOP}.open && [...${MOBILE_SHOP}.querySelectorAll("a")].every(a => a.checkVisibility())` },
        { click: MOBILE_SHOP_SELECTOR },
        { waitFor: `!${MOBILE_SHOP}.open` },
        { click: MOBILE_SHOP_SELECTOR },
        { click: '#mobile-nav a[href="/shop/1-5l-bottle"]' },
        { waitFor: `location.pathname === '/shop/1-5l-bottle' && document.querySelector('#shop-heading') && !${MOBILE_SHOP}.open` },
      ],
      expect: [
        { name: "drawer lists Shop's 4 links in a labelled group", js: "[...document.querySelectorAll('#mobile-nav ul[aria-labelledby] a')].length === 4" },
        { name: "tapping a product opens the storefront with its 1.5 L pack preselected and closes the drawer", js: "(()=>{const m=[...document.querySelectorAll('main')].find(e=>e.checkVisibility());return !!m && m.querySelector('nav[aria-label=Breadcrumb] [aria-current=page]')?.textContent==='1.5 L Bottle' && m.querySelector('[data-pack=\"1500-carton\"] [data-pack-view]')?.getAttribute('aria-pressed')==='true' && !!m.querySelector('#shop-heading');})() && !document.getElementById('mobile-nav').open" },
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
        ...Array.from({ length: 16 }, () => [{ press: "Tab" }, { evaluate: "window.__focusTrail = [...(window.__focusTrail || []), (document.activeElement.getAttribute('href') || document.activeElement.getAttribute('aria-label')) + ' ' + getComputedStyle(document.activeElement).outlineStyle]; true" }]).flat(),
      ],
      expect: [
        {
          name: "Tab reaches image controls and all 4 CTAs with visible focus outlines",
          js: "window.__focusTrail.length===16 && window.__focusTrail.every(s=>s.endsWith(' solid')) && JSON.stringify(window.__focusTrail.filter(s=>s.startsWith('/'))) === JSON.stringify(['/shop/750ml-glass-bottle solid', '/shop/1-5l-bottle solid', '/shop/carton-packs solid', '/wholesale solid'])",
        },
      ],
    },
    {
      ...base,
      name: "products-card-link",
      page: "home",
      actions: [{ click: '#products a[href="/shop/1-5l-bottle"]' }, { waitFor: "location.pathname === '/shop/1-5l-bottle'" }],
      expect: [{ name: "Shop 1.5 L opens the storefront with a 1.5 L pack preselected", js: "(()=>{const m=[...document.querySelectorAll('main')].find(e=>e.checkVisibility());return !!m && m.querySelector('nav[aria-label=Breadcrumb] [aria-current=page]')?.textContent==='1.5 L Bottle' && m.querySelector('[data-pack=\"1500-carton\"] [data-pack-view]')?.getAttribute('aria-pressed')==='true' && !!m.querySelector('#shop-heading');})()" }],
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
    // -- D-111 Contact Us, testimonials --
    {
      ...base, name: "contact-header-link", page: "home", viewports: ["desktop"],
      actions: [{ click: 'header nav a[href="/contact"]' }, { waitFor: "location.pathname === '/contact'" }],
      expect: [{ name: "header Contact opens the Contact Us page", js: "(() => { const m=[...document.querySelectorAll('main')].filter(e=>e.checkVisibility()); return m.length===1 && m[0].querySelector('h1')?.textContent==='Get in Touch'; })()" }],
    },
    {
      ...base, name: "contact-footer-link", page: "home",
      actions: [{ click: 'footer a[href="/contact"]' }, { waitFor: "location.pathname === '/contact'" }],
      expect: [{ name: "footer Contact Us opens the Contact Us page", js: "[...document.querySelectorAll('main')].filter(e=>e.checkVisibility()).some(m=>m.querySelector('h1')?.textContent==='Get in Touch')" }],
    },
    {
      ...base, name: "contact-mobile-menu", page: "home",
      actions: [{ click: MENU_BUTTON_SELECTOR }, { click: '#mobile-nav a[href="/contact"]' }, { waitFor: "location.pathname === '/contact' && !document.getElementById('mobile-nav').open" }],
      expect: [{ name: "mobile menu Contact opens the page and closes the drawer", js: "!document.getElementById('mobile-nav').open && [...document.querySelectorAll('main')].filter(e=>e.checkVisibility()).some(m=>m.querySelector('h1')?.textContent==='Get in Touch')" }],
    },
    {
      ...base, name: "contact-wholesale-link", page: "contact",
      actions: [{ click: 'main aside a[href="/wholesale"]' }, { waitFor: "location.pathname === '/wholesale'" }],
      expect: [{ name: "Request Wholesale from Contact opens the enquiry page", js: "[...document.querySelectorAll('main')].filter(e=>e.checkVisibility()).some(m=>!!m.querySelector('form'))" }],
    },
    {...base,"name": "testimonials-no-js", "page": "home", "actions": [], "expect": [{"name": "testimonials-no-js", "js": "document.querySelectorAll('#testimonials ul:not([aria-hidden]) blockquote').length===6 && !document.querySelector('#testimonials button') && document.querySelector('#testimonials [tabindex]').scrollWidth>document.querySelector('#testimonials [tabindex]').clientWidth && getComputedStyle(document.querySelector('[data-testimonial-copy]')).display==='none'"}], "javascript": false},
    {...base,"name": "testimonials-reduced-motion", "page": "home", "actions": [{"evaluate": "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); true"}], "expect": [{"name": "testimonials-reduced-motion", "js": "!document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselRotating && getComputedStyle(document.querySelector('[data-testimonial-track]')).animationName==='none' && getComputedStyle(document.querySelector('[data-testimonial-copy]')).display==='none'"}], "media": [{"name": "prefers-reduced-motion", "value": "reduce"}]},
    // Scrolling down the homepage from Origin (right above the testimonials) with a wheel/trackpad passed over the
    // cards and froze the marquee for good. Only sideways scrolling or arrow keys may stop it.
    ...[["desktop","laptop"],["mobile","tablet"]].map((viewports)=>({...base,"name": `testimonials-after-origin-${viewports[0]}`, "page": "home", viewports,
      "actions": [
        {"evaluate": "document.querySelector('#origin').scrollIntoView({block:'start',behavior:'instant'}); true"}, {"wait": 800},
        {"evaluate": "(()=>{const v=document.querySelector('#testimonials [tabindex]');for(let i=0;i<6;i++)v.dispatchEvent(new WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true}));v.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}));return true})()"},
        {"moveTo": {"x": 2, "y": 2}}, {"wait": 300},
        {"evaluate": "window.__marqueeX=new DOMMatrix(getComputedStyle(document.querySelector('[data-testimonial-track]')).transform).m41; true"},
        {"wait": 600}],
      "expect": [{"name": "from Origin, vertical page scrolling and Tab over the testimonials keep them moving", "js": "document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselRotating==='true' && !document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselStopped && new DOMMatrix(getComputedStyle(document.querySelector('[data-testimonial-track]')).transform).m41>window.__marqueeX+2"}]})),
    {...base,"name": "testimonials-sideways-stops", "page": "home", "viewports": ["desktop"],
      "actions": [{"evaluate": "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); document.querySelector('#testimonials [tabindex]').dispatchEvent(new WheelEvent('wheel',{deltaX:120,deltaY:10,bubbles:true})); true"}, {"wait": 200}],
      "expect": [{"name": "a sideways scroll over the cards still stops the movement (visitor takes control)", "js": "document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselStopped==='true'"}]},
    {...base,"name": "testimonials-arrow-key-stops", "page": "home", "viewports": ["desktop"],
      "actions": [{"evaluate": "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); document.querySelector('#testimonials [tabindex]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); true"}, {"wait": 200}],
      "expect": [{"name": "the arrow keys still stop the movement", "js": "document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselStopped==='true'"}]},
    {...base,"name": "testimonials-autoplay", "page": "home", "actions": [{"evaluate": "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); true"}, {"moveTo": {"x": 2, "y": 2}}, {"evaluate": "window.__marqueeX=new DOMMatrix(getComputedStyle(document.querySelector('[data-testimonial-track]')).transform).m41; true"}, {"wait": 500}], "expect": [{"name": "testimonials-autoplay", "js": "new DOMMatrix(getComputedStyle(document.querySelector('[data-testimonial-track]')).transform).m41>window.__marqueeX+2 && getComputedStyle(document.querySelector('[data-testimonial-track]')).animationTimingFunction==='linear' && document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselRotating==='true'"}], "viewports": ["small", "mobile", "tablet", "laptop", "large", "desktop"]},
    {...base,"name": "testimonials-hover-pause", "page": "home", "actions": [{"evaluate": "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); true"}, {"evaluate": "document.querySelector('#testimonials [aria-roledescription=carousel]').dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse'})); true"}, {"wait": 100}, {"evaluate": "window.__marqueeX=getComputedStyle(document.querySelector('[data-testimonial-track]')).transform; true"}, {"wait": 400}], "expect": [{"name": "testimonials-hover-pause", "js": "getComputedStyle(document.querySelector('[data-testimonial-track]')).transform===window.__marqueeX && getComputedStyle(document.querySelector('[data-testimonial-track]')).animationPlayState==='paused' && !document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselRotating"}], "viewports": ["desktop"]},
    {...base,"name": "testimonials-loop", "page": "home", "actions": [{"evaluate": "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); true"}], "expect": [{"name": "testimonials-loop", "js": "(()=>{const t=document.querySelector('[data-testimonial-track]'),groups=t.children,a=t.getAnimations()[0]; if(!a)return false;const width=groups[0].getBoundingClientRect().width;const saved=a.currentTime,duration=a.effect.getTiming().duration;a.currentTime=duration-.1;const before=groups[0].getBoundingClientRect().left;a.currentTime=duration+.1;const after=groups[1].getBoundingClientRect().left;a.currentTime=saved;if(Math.abs(after-before)>1)return false;return Math.abs(width-groups[1].getBoundingClientRect().width)<.1 && Math.abs(t.getBoundingClientRect().width-width*2)<.1 && groups[0].textContent===groups[1].textContent && groups[1].inert && groups[1].getAttribute('aria-hidden')==='true' && a.effect.getTiming().iterations===Infinity && a.effect.getTiming().easing==='linear';})()"}]},
    {...base,"name": "testimonials-swipe-stops", "page": "home", "actions": [{"evaluate": "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); true"}, {"evaluate": "document.querySelector('#testimonials [tabindex]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch'})); true"}, {"wait": 100}], "expect": [{"name": "testimonials-swipe-stops", "js": "document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselStopped==='true' && getComputedStyle(document.querySelector('[data-testimonial-track]')).animationPlayState==='paused'"}]},
    {...base,"name": "testimonials-keyboard-stops", "page": "home", "actions": [{"evaluate": "document.querySelector('#testimonials').scrollIntoView({block:'start',behavior:'instant'}); true"}, {"evaluate": "document.querySelector('#testimonials [tabindex]').focus(); true"}, {"press": "ArrowRight"}, {"evaluate": "document.querySelector('#testimonials [tabindex]').blur(); true"}, {"moveTo": {"x": 2, "y": 2}}], "expect": [{"name": "testimonials-keyboard-stops", "js": "document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselStopped==='true' && !document.querySelector('#testimonials [aria-roledescription=carousel]').dataset.carouselRotating"}], "viewports": ["desktop"]},
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
      expect: [{name:"origin server-rendered and visible without JS; story link real",js:"!document.querySelector('#origin [data-reveal]') && document.querySelectorAll('#origin li').length===3 && !!document.querySelector('header a[href=\"/our-story\"]')"}],
    },
    {
      ...base, name: "origin-desktop-navigation", page: "shop", viewports: ["desktop"],
      actions: [{press:"Tab"},{evaluate:"const a=document.querySelector('header nav a[href=\"/our-story\"]'); a.focus(); sessionStorage.setItem('originFocus',getComputedStyle(a).outlineStyle); true"},{press:"Enter"},{waitFor:"location.pathname==='/our-story' && [...document.querySelectorAll('main')].some(m=>m.checkVisibility() && m.querySelector('#origin'))"}],
      expect: [{name:"keyboard Our Story opens the Our Story page (D-140), not a homepage scroll; focus ring present",js:"sessionStorage.getItem('originFocus')==='solid' && location.hash==='' && [...document.querySelectorAll('main')].filter(m=>m.checkVisibility()).length===1 && [...document.querySelectorAll('main')].find(m=>m.checkVisibility()).querySelectorAll('section').length===1"}],
    },
    {
      ...base, name: "origin-mobile-navigation", page: "shop", viewports: ["mobile"],
      actions: [{click:MENU_BUTTON_SELECTOR},{click:'#mobile-nav a[href="/our-story"]'},{waitFor:"location.pathname==='/our-story' && !document.getElementById('mobile-nav').open"}],
      expect: [{name:"mobile Our Story opens the Our Story page, closes drawer and releases scroll",js:"!document.getElementById('mobile-nav').open && getComputedStyle(document.documentElement).overflow!=='hidden' && [...document.querySelectorAll('main')].some(m=>m.checkVisibility() && m.querySelector('#origin'))"}],
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
      expect:[{name:"footer product link opens the storefront with the 750 ml bottle preselected",js:"(()=>{const m=[...document.querySelectorAll('main')].find(e=>e.checkVisibility());return !!m && m.querySelector('nav[aria-label=Breadcrumb] [aria-current=page]')?.textContent==='750 ml Glass Bottle' && m.querySelector('[data-pack=\"750-single\"] [data-pack-view]')?.getAttribute('aria-pressed')==='true' && !!m.querySelector('#shop-heading');})()"}],
    },
    // D-140: every header and drawer link opens a page; none scrolls the homepage to an anchor.
    {
      ...base,name:"nav-routes-only",page:"home",viewports:["mobile","desktop"],
      expect:[{name:"no header, drawer or footer link points at a homepage anchor (the footer social \"#\" placeholders, D-111, are not anchors); Our Story and Quality have their own pages",js:"(()=>{const links=[...document.querySelectorAll('header a[href],#mobile-nav a[href],footer a[href]')].map(a=>a.getAttribute('href'));return links.length>0 && !links.some(h=>/^\\/?#./.test(h)) && links.includes('/our-story') && links.includes('/quality')})()"}],
    },
    ...[["ourStory","origin"],["quality","quality"]].map(([page,id])=>({
      ...base,name:`${page}-page`,page,viewports:["small","mobile","tablet","desktop"],
      actions:[{evaluate:"window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}); true"},{wait:600}],
      expect:[
        {name:"the page renders only its own section, with a page heading",js:`(()=>{const m=document.querySelector('main');return m.querySelectorAll('section').length===1 && !!m.querySelector('section#${id}') && m.querySelector('h1')?.textContent.length>0 && !m.querySelector('#products,#testimonials,#contact,#hero')})()`},
        {name:"section content visible (reveal finished) and no horizontal overflow",js:`[...document.querySelectorAll('#${id} [data-reveal]')].every(e=>e.dataset.reveal==='shown') && document.documentElement.scrollWidth<=innerWidth+1`},
        {name:"the nav marks this page as current",js:"[...document.querySelectorAll('header nav a[aria-current=page]')].some(a=>a.getAttribute('href')===location.pathname)"}],
    })),
    {
      ...base,name:"quality-navigation",page:"shop",viewports:["desktop"],
      actions:[{click:'header nav a[href="/quality"]'},{waitFor:"location.pathname==='/quality' && [...document.querySelectorAll('main')].some(m=>m.checkVisibility() && m.querySelector('#quality'))"}],
      expect:[{name:"Quality header link opens the Quality page (D-140), not a homepage scroll",js:"location.hash==='' && [...document.querySelectorAll('main')].find(m=>m.checkVisibility()).querySelectorAll('section').length===1"}],
    },
    {
      ...base,name:"remaining-reduced-motion",page:"home",viewports:["mobile","desktop"],media:[{name:"prefers-reduced-motion",value:"reduce"}],
      expect:[{name:"quality and banner never hidden with reduced motion",js:"!document.querySelector('#quality [data-reveal],#wholesale [data-reveal]') && !document.querySelector('[data-certification]')"}],
    },
    {
      ...base,name:"remaining-no-js",page:"home",viewports:["mobile","desktop"],javascript:false,
      expect:[{name:"quality, supply, footer and working links server-rendered without JS",js:"!document.querySelector('#quality [data-reveal],#wholesale [data-reveal]') && document.querySelectorAll('#quality li').length===4 && document.querySelector('#wholesale a').getAttribute('href')==='/wholesale' && document.querySelectorAll('footer nav').length===3"}],
    },
    ...heroCarouselJourneys(base),
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


function heroCarouselJourneys(base) {
  const c = 'document.querySelector("[aria-roledescription=carousel]")';
  const dot = i => `[aria-label="Choose a slide"] button:nth-child(${i+1})`;
  const dimensions = `JSON.stringify([document.querySelector('section[aria-labelledby=hero-heading]'),document.querySelector('.hero-bottle-stage')].map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]}))`;
  const customName = uniqueName('Memorial label enquiry');
  return [
    { ...base,name:"custom-label-delivery",page:"home",path:"/custom-labels?occasion=memorial",viewports:["mobile"],
      actions:[{waitFor:"document.querySelector('#message')?.value.startsWith('Memorial')"},...fillEnquiry(customName).filter(a=>a.type?.selector!=="#message"),...submitAndWait],
      expect:[{name:"custom enquiry reports actual stored delivery",server:async({root})=>(await storedEnquiries(root)).some(r=>r.name===customName && r.message.startsWith('Memorial water label enquiry.'))}],
    },

    { ...base,name:"carousel-initial",page:"home",viewports:["small","mobile","tablet","laptop","large","desktop"],expect:[
      {name:"five slides and distinct separate bottle files",js:`${c}.querySelectorAll('[data-slide]').length===5 && new Set([...${c}.querySelectorAll('[data-frame] img')].map(i=>decodeURIComponent(i.src).split('&')[0])).size===5`},
      {name:"only current slide and image accessible",js:`${c}.querySelectorAll('[data-slide]:not([inert])').length===1 && ${c}.querySelectorAll('[data-frame]:not([inert])').length===1 && ${c}.querySelectorAll('[data-slide][aria-hidden=true]').length===4`},
      {name:"450ms bottle transition and contain fit",js:`getComputedStyle(document.querySelector('.hero-bottle-frame')).transitionDuration.split(',').every(d=>d.trim()==='0.45s') && [...${c}.querySelectorAll('[data-frame] img')].every(i=>getComputedStyle(i).objectFit==='contain')`},
      {name:"background fetched once and never animates",js:"performance.getEntriesByType('resource').filter(e=>decodeURIComponent(e.name).includes('/images/hero/waterfall-bg.webp')).length===1 && getComputedStyle(document.querySelector('[data-hero-background] img')).animationName==='none'"},
      {name:"every active action fits within copy column",js:`[...${c}.querySelectorAll('[data-active=true] a')].every(a=>{const r=a.getBoundingClientRect(),p=document.querySelector('.hero-carousel-copy').getBoundingClientRect();return r.left>=p.left-1 && r.right<=p.right+1})`},
    ]},
    ...["Premium Natural Spring Water","Everyday Hydration","Wedding Water Labels","Memorial Water Labels","Royal & Coronation Events"].map((title,i)=>({
      ...base,name:`carousel-slide-${i+1}`,page:"home",selector:"section[aria-labelledby=hero-heading]",viewports:["mobile","desktop"],actions:[{evaluate:`window.heroBefore=${dimensions}; true`},{click:dot(i)},{waitFor:`${c}.dataset.carouselIndex==='${i}'`},{wait:650}],expect:[
        {name:"correct synchronized title, CTA and decoded bottle",js:`${c}.querySelector('[data-active=true] h2').textContent===${JSON.stringify(title)} && document.querySelector('[data-frame="${i}"] img').naturalWidth>0 && getComputedStyle(document.querySelector('[data-frame="${i}"]')).opacity==='1'`},
        {name:"copy swaps instantly without fade or movement",js:`(()=>{const e=${c}.querySelector('[data-active=true]'),s=getComputedStyle(e);return s.visibility==='visible' && s.opacity==='1' && s.translate==='none' && s.transitionDuration==='0s' && s.animationName==='none'})()`},
        {name:"all slide switches preserve hero and bottle geometry",js:`${dimensions}===window.heroBefore`},
        {name:"selected dot announced",js:`document.querySelector('${dot(i)}').getAttribute('aria-pressed')==='true'`},
        {name:"manual choice stops rotation",js:`!${c}.dataset.carouselRotating`},
    ]})),
    ...['/shop','/shop','/custom-labels?occasion=wedding','/custom-labels?occasion=memorial','/custom-labels?occasion=coronation'].map((href,i)=>({
      ...base,name:`carousel-cta-${i+1}`,page:"home",viewports:["mobile","desktop"],actions:[{click:dot(i)},{waitFor:`${c}.dataset.carouselIndex==='${i}'`},{click:'[data-active=true] [data-hero-actions] a:first-child'},{waitFor:`location.pathname===${JSON.stringify(href.split('?')[0])}`}],expect:[
        {name:"CTA reaches working destination",js:i<2?"[...document.querySelectorAll('main')].some(m=>m.checkVisibility() && !!m.querySelector('h1') && m.querySelectorAll('[data-shop-products] article').length===4)":`location.search===${JSON.stringify('?'+href.split('?')[1])} && document.querySelector('#message').value.toLowerCase().includes(${JSON.stringify(href.split('=')[1])})`},
    ]})),
    { ...base,name:"carousel-arrows",page:"home",viewports:["mobile","desktop"],actions:[{click:'button[aria-label="Previous slide"]'},{waitFor:`${c}.dataset.carouselIndex==='4'`},{click:'button[aria-label="Next slide"]'},{waitFor:`${c}.dataset.carouselIndex==='0'`}],expect:[{name:"arrows wrap in both directions",js:`${c}.dataset.carouselIndex==='0'`}]},
    { ...base,name:"carousel-auto-rotates",page:"home",viewports:["desktop"],actions:[{moveTo:{x:5,y:880}},{waitFor:`${c}.dataset.carouselIndex==='1'`,timeout:9000}],expect:[{name:"automatic advance after four seconds",js:`${c}.dataset.carouselRotating==='true'`}]},
    { ...base,name:"carousel-pauses",page:"home",viewports:["desktop"],actions:[{moveTo:{x:500,y:300}}],expect:[{name:"hover pauses rotation",js:`!${c}.dataset.carouselRotating`}]},
    { ...base,name:"carousel-focus-pause",page:"home",viewports:["desktop"],actions:[{waitFor:`${c}.dataset.carouselRotating==='true'`},{evaluate:"document.querySelector('[data-active=true] a').focus(); true"}],expect:[{name:"focus pauses rotation",js:`!${c}.dataset.carouselRotating && document.hasFocus() && ${c}.contains(document.activeElement)`}]},
    { ...base,name:"carousel-play-resumes",page:"home",viewports:["desktop"],actions:[{click:'[data-carousel-toggle]'},{click:'[data-carousel-toggle]'},{evaluate:"document.activeElement.blur();true"},{moveTo:{x:5,y:880}}],expect:[{name:"Play resumes after pointer and focus leave",js:`${c}.dataset.carouselRotating==='true'`}]},
    { ...base,name:"carousel-swipe",page:"home",viewports:["mobile"],actions:[{swipe:{selector:'.hero-bottle-stage',direction:'left'}},{waitFor:`${c}.dataset.carouselIndex==='1'`},{swipe:{selector:'.hero-bottle-stage',direction:'right'}},{waitFor:`${c}.dataset.carouselIndex==='0'`}],expect:[{name:"horizontal swipe advances and vertical scrolling retained",js:"getComputedStyle(document.querySelector('.hero-bottle-stage')).touchAction==='pan-y'"}]},
    { ...base,name:"carousel-reduced-motion",page:"home",viewports:["mobile","desktop"],media:[{name:"prefers-reduced-motion",value:"reduce"}],actions:[{click:dot(4)},{waitFor:`${c}.dataset.carouselIndex==='4'`}],expect:[{name:"manual selection works without motion or autoplay",js:`!${c}.dataset.carouselRotating && getComputedStyle(document.querySelector('.hero-bottle-frame')).transitionProperty==='none' && document.querySelector('[data-carousel-toggle]').disabled`}]},
    { ...base,name:"carousel-no-js",page:"home",viewports:["mobile","desktop"],javascript:false,expect:[{name:"first-slide content, bottle and working shop link survive without JS",js:"!!document.querySelector('[data-active=true] a[href=\"/shop\"]') && !document.querySelector('[data-carousel-toggle]') && !!document.querySelector('[data-frame=\"0\"] img')"}]},
  ].map(journey => ({ ...journey, actions: journey.actions?.flatMap(action =>
    action.click && /Choose a slide|Previous slide|Next slide|data-carousel-toggle/.test(action.click)
      ? [{evaluate: `document.querySelector(${JSON.stringify(action.click)}).focus({preventScroll:true}); true`}, action]
      : [action]) }));
}

function rangeMediaJourneys() {
  const root = 'document.querySelectorAll("#products [data-media-carousel]")';
  const focusNext = `(()=>{for(const c of ${root})c.querySelector('button[aria-label^="Next"]').focus();return true})()`;
  const reveal = [
    {evaluate:"document.querySelector('#products-heading').scrollIntoView({block:'center',behavior:'instant'});true"},
    ...[0,1,2,3].flatMap(i=>[
      {evaluate:`document.querySelectorAll('#products ul > li')[${i}].scrollIntoView({block:'center',behavior:'instant'});true`},
      {waitFor:`document.querySelectorAll('#products ul > li')[${i}].querySelector('[data-reveal]')?.dataset.reveal!=='hidden'`},
    ]),
    {evaluate:"document.querySelector('#products').scrollIntoView({block:'center',behavior:'instant'});true"},
    {waitFor:"document.querySelectorAll('#products .media-carousel-controls').length===4 && [...document.querySelectorAll('#products [data-reveal]')].every(e=>getComputedStyle(e).opacity==='1')"},
  ];
  const resetImages = [
    {evaluate:`(async()=>{for(const c of ${root}){c.querySelector('button[aria-label^="Pause"]')?.click();while(Number(c.dataset.mediaIndex)>0){const target=Number(c.dataset.mediaIndex)-1;c.querySelector('button[aria-label^="Previous"]').click();const deadline=performance.now()+5000;while(Number(c.dataset.mediaIndex)!==target){if(performance.now()>deadline)throw new Error('Image reset timed out');await new Promise(r=>setTimeout(r,20))}}}return true})()`},
    {waitFor:`[...${root}].every(c=>c.dataset.mediaIndex==='0')`},
  ];
  return [
    {name:"range-media",page:"home",selector:"#products",viewports:["small","mobile","tablet","laptop","large","desktop"],actions:reveal,expect:[
      {name:"four multi-image galleries; alternate packaging clearly proposed",js:`${root}.length===4 && [...${root}].map(c=>c.querySelectorAll('[data-media-slide]').length).join(',')==='2,2,8,4' && document.querySelector('#products li:first-child article').textContent.includes('Alternative bottle: proposed packaging')`},
      {name:"no card title or CTA overflow",js:"[...document.querySelectorAll('#products article a,#products h3')].every(e=>{const r=e.getBoundingClientRect(),c=e.closest('article').getBoundingClientRect();return r.left>=c.left-1 && r.right<=c.right+1 && r.bottom<=c.bottom+1})"},
      {name:"new photos use contain with preserved sources",js:"['closed-carton.webp','warehouse-pallet.webp'].every(n=>[...document.querySelectorAll('#products img')].some(i=>decodeURIComponent(i.src).includes(n) && getComputedStyle(i).objectFit===(n==='warehouse-pallet.webp'?'cover':'contain')))"},
      {name:"printed claims registered as evidence-dependent",js:"[...document.querySelectorAll('#products [data-claims]')].some(e=>e.dataset.claims.includes('cartonPackConfiguration') && e.dataset.claims.includes('lowTds')) && !!document.querySelector('#products [data-claims*=palletPackConfiguration]')"},
      {name:"visible controls not added to normal cards",js:`[...${root}].every(c=>getComputedStyle(c.querySelector('.media-carousel-controls')).clipPath==='inset(50%)')`},
    ]},
    ...[0,1,2,3].map(i=>({name:`range-media-select-${i}`,kind:"functional",page:"home",viewports:["mobile","desktop"],actions:[...reveal,...resetImages,
      {evaluate:`window.rangeBoxes=[...document.querySelectorAll('#products article,#products h3,#products article a')].map(e=>[e.offsetLeft,e.offsetTop,e.offsetWidth,e.offsetHeight]); const c=${root}[${i}];c.querySelector('button[aria-label^="Next"]').focus();c.querySelector('button[aria-label^="Next"]').click();true`},
      {waitFor:`${root}[${i}].dataset.mediaIndex==='1'`},{wait:500}],expect:[
      {name:"alternate image decoded and only one exposed",js:`(()=>{const c=${root}[${i}],p=c.querySelector('[data-media-slide="1"]');return c.querySelectorAll('[data-media-slide]:not([inert])').length===1 && p.querySelector('img').naturalWidth>0 && getComputedStyle(p).opacity==='1'})()`},
      {name:"no shifting card, title or button boxes",js:"JSON.stringify([...document.querySelectorAll('#products article,#products h3,#products article a')].map(e=>[e.offsetLeft,e.offsetTop,e.offsetWidth,e.offsetHeight]))===JSON.stringify(window.rangeBoxes)"},
      {name:"manual choice pauses rotation",js:`!${root}[${i}].dataset.mediaRotating`},
    ]})),
    {name:"range-media-all-alternates",kind:"functional",page:"home",selector:"#products",viewports:["mobile","desktop"],actions:[...reveal,...resetImages,{evaluate:`[...${root}].forEach(c=>c.querySelector('button[aria-label^="Next"]').click());true`},{waitFor:`[...${root}].every(c=>c.dataset.mediaIndex==='1')`},{wait:500}],expect:[{name:"all four alternate images decoded and visible",js:`[...${root}].every(c=>{const p=c.querySelector('[data-media-slide="1"]');return p.querySelector('img').naturalWidth>0 && getComputedStyle(p).opacity==='1'})`}]},
    {name:"range-media-every-variant",kind:"functional",page:"home",viewports:["desktop"],actions:[...reveal,...resetImages,{evaluate:`(async()=>{const boxes=()=>JSON.stringify([...document.querySelectorAll('#products article,#products h3,#products article a')].map(e=>[e.offsetLeft,e.offsetTop,e.offsetWidth,e.offsetHeight]));const before=boxes();const text=[...document.querySelectorAll('#products h3,#products p,#products article a')].map(e=>e.textContent).join('|');let visited=0;for(const c of ${root}){const count=c.querySelectorAll('[data-media-slide]').length;for(let i=0;i<count;i++){if(i>0){c.querySelector('button[aria-label^="Next"]').click();const deadline=performance.now()+5000;while(Number(c.dataset.mediaIndex)!==i){if(performance.now()>deadline)throw new Error('Variant did not activate');await new Promise(r=>setTimeout(r,20))}}const p=c.querySelector('[data-media-slide="'+i+'"]'),img=p.querySelector('img');img.loading='eager';await img.decode();if(p.inert || img.naturalWidth===0 || boxes()!==before)throw new Error('Variant failed decode/accessibility/layout');visited++}}window.rangeVisited=visited;return text===[...document.querySelectorAll('#products h3,#products p,#products article a')].map(e=>e.textContent).join('|')})()`}],expect:[{name:"all sixteen supplied/reused images decode without layout or text changes",js:"window.rangeVisited===16"}]},
    {name:"range-media-auto",kind:"functional",page:"home",viewports:["desktop"],actions:[...reveal,{moveTo:{x:5,y:5}},{waitFor:`[...${root}].some(c=>c.dataset.mediaIndex==='1')`,timeout:7000}],expect:[{name:"visible images rotate automatically",js:`[...${root}].some(c=>c.dataset.mediaRotating==='true')`}]},
    {name:"range-media-offscreen",kind:"functional",page:"home",viewports:["desktop"],actions:[...reveal,{evaluate:"window.scrollTo({top:0,behavior:'instant'});true"},{waitFor:`[...${root}].every(c=>!c.dataset.mediaRotating)`}],expect:[{name:"offscreen image timers stop",js:`[...${root}].every(c=>!c.dataset.mediaRotating)`}]},
    {name:"range-media-reduced",kind:"functional",page:"home",viewports:["mobile","desktop"],media:[{name:"prefers-reduced-motion",value:"reduce"}],actions:[...reveal,{evaluate:focusNext}],expect:[{name:"reduced motion stops auto and image transitions",js:`[...${root}].every(c=>!c.dataset.mediaRotating && getComputedStyle(c.querySelector('[data-media-slide]')).transitionProperty==='none')`}]},
    {name:"range-media-swipe",kind:"functional",page:"home",viewports:["mobile"],actions:[...reveal,...resetImages,{swipe:{selector:'#products li:nth-child(2) [data-media-carousel]',direction:'left'}},{waitFor:`${root}[1].dataset.mediaIndex==='1'`}],expect:[{name:"touch swipe changes image, page retains vertical scrolling",js:`getComputedStyle(${root}[1]).touchAction==='pan-y'`}]},
    {name:"range-media-no-js",kind:"functional",page:"home",viewports:["mobile"],javascript:false,actions:[{evaluate:"document.querySelector('#products').scrollIntoView();true"}],expect:[{name:"first images and product links survive without JS",js:"document.querySelectorAll('#products article a').length===4 && document.querySelectorAll('#products [data-media-slide=\"0\"]:not([inert])').length===4 && !document.querySelector('#products .media-carousel-controls')"}]},
  ];
}

function shopReferenceJourneys(){
 const ready={waitFor:"document.querySelector('button[aria-label=\"Show Bottle\"]')?.disabled===false"};
 const reset={evaluate:"localStorage.removeItem('rocktama.basket.v1');window.dispatchEvent(new Event('rocktama:basket'));true"};
 const base={kind:"functional",page:"shop",viewports:["mobile","desktop"]};
 return [
 {name:"shop-reference",page:"shop",selector:"main",viewports:["small","mobile","tablet","laptop","large","desktop"],expect:[
 {name:"reference structure has gallery, buying panel, specifications and four related cards",js:"document.querySelectorAll('[data-gallery-frame]').length===5 && document.querySelectorAll('[data-shop-products] article').length===4 && !!document.querySelector('#shop-specifications-heading') && document.querySelectorAll('h1#shop-heading').length===1"},
 {name:"scoped gallery CSS contains the bottle within its stage and desktop columns",js:"(()=>{const section=document.querySelector('section[aria-labelledby=shop-heading]');const frame=document.querySelector('[data-gallery-frame=\"0\"]');const stage=frame.parentElement;const image=frame.querySelector('img:last-child');const r=image.getBoundingClientRect(),b=stage.getBoundingClientRect();return getComputedStyle(section).display==='grid' && getComputedStyle(stage).position==='relative' && getComputedStyle(image).objectFit==='contain' && b.height>200 && r.width<=b.width+1 && r.height<=b.height+1 && (innerWidth<1024 || b.width<innerWidth*.6)})()"},
 {name:"no unsupported reviews, payments, delivery guarantee or scientific metrics",js:"!/1,248|Subscribe & Save|SSL Secured|Apple Pay|ISO 22000|≈ 7.2|1–3 business/.test(document.querySelector('main').innerText)"},
 {name:"all actionable controls and images fit within viewport",js:"[...document.querySelectorAll('main button,main input,main select,main a')].filter(e=>e.checkVisibility()&&!e.closest('[aria-label=\"Product images\"]')).every(e=>{const r=e.getBoundingClientRect();return r.left>=-1 && r.right<=innerWidth+1})"},
 ]},
 {...base,name:"shop-gallery",actions:[ready,{click:'button[aria-label="Show Cap detail"]'},{wait:200},{click:'button[aria-label="Enlarge product image"]'},{waitFor:"document.querySelector('dialog[data-product-zoom]').open"},{press:"Escape"}],expect:[{name:"thumbnail chooses detail; zoom closes and returns focus",js:"document.querySelector('button[aria-label=\"Show Cap detail\"]').getAttribute('aria-pressed')==='true' && !document.querySelector('dialog').open && document.activeElement.getAttribute('aria-label')==='Enlarge product image'"}]},
 // D-119: each pack has its own quantity; selections combine packs and sizes.
 {...base,name:"shop-pack-image",actions:[ready,{click:'[data-pack="750-pack12"] [data-pack-view]'}],expect:[{name:"viewing Pack of 12 shows the twelve-bottle pack image and its price",js:"document.querySelector('[data-gallery-frame=\"0\"] img:last-child')?.getAttribute('src')?.includes('carton-packs.webp') && document.querySelectorAll('[data-gallery-frame]').length===1 && document.querySelector('[data-shop-price]').textContent.includes('7,500.00')"}]},
 // D-118: Pack of 24 (price on request) and the corrected 12 × 1.5 L carton gallery.
 // D-123: only priced packs are sold; Pack of 24 and the 1.5 L single stay hidden until they have a price.
 {...base,name:"shop-unpriced-hidden",actions:[ready,{click:'[aria-label="Bottle size"] button:nth-child(2)'},{waitFor:"document.querySelector('[data-shop-price]').textContent.includes('14,500.00')"}],expect:[
  {name:"no unpriced pack is offered: 1.5 L shows only the carton; no 'Price on request' anywhere in the buying panel",js:"[...document.querySelectorAll('[data-pack]')].map(e=>e.dataset.pack).join()==='1500-carton' && !document.querySelector('[data-pack=\"750-pack24\"],[data-pack=\"1500-single\"]') && !/Price on request/.test(document.querySelector('section[aria-labelledby=shop-heading]').innerText)"},
  {name:"custom labels are the on-request route",js:"document.querySelector('[data-custom-labels] a')?.getAttribute('href')==='/custom-labels'"},
 ]},
 {...base,name:"shop-carton-gallery",actions:[ready,{click:'[aria-label="Bottle size"] button:nth-child(2)'},{click:'[data-pack="1500-carton"] [data-pack-view]'},{waitFor:"document.querySelector('[data-shop-price]').textContent.includes('14,500.00')"},{click:'button[aria-label="Show Carton, side"]'},{waitFor:"document.querySelector('button[aria-label=\"Show Carton, side\"]').getAttribute('aria-pressed')==='true'"}],expect:[
  {name:"carton shows five 12 × 1.5 L views, alternative design last, no 24 × 750 ml tray",js:"(()=>{const s=[...document.querySelectorAll('[data-gallery-frame] img:last-child')].map(i=>i.getAttribute('src'));const t=[...document.querySelectorAll('[aria-label=\"Product images\"] button')].map(b=>b.getAttribute('aria-label'));return s.length===5 && !s.some(x=>/carton-open/.test(x)) && t.at(-1)==='Show Alternative design' && s.at(-1).includes('closed-carton.webp');})()"},
  {name:"choosing the side thumbnail shows the side view (only that frame visible)",js:"(()=>{const f=[...document.querySelectorAll('[data-gallery-frame]')].filter(e=>getComputedStyle(e).visibility==='visible');return f.length===1 && f[0].querySelector('img:last-child').getAttribute('src').includes('carton-closed-side.webp');})()"},
 ]},
 {...base,name:"shop-options",actions:[ready,{click:'[data-pack="750-pack12"] [data-pack-view]'},{waitFor:"document.querySelector('[data-shop-price]').textContent.includes('7,500.00')"},{click:'[aria-label="Bottle size"] button:nth-child(2)'},{waitFor:"document.querySelector('[data-shop-price]').textContent.includes('14,500.00')"}],expect:[{name:"size filters packs (750: single, 12; 1.5 L: carton) and opens the first pack of that size",js:"[...document.querySelectorAll('[data-pack]')].map(e=>e.dataset.pack).join()==='1500-carton' && document.querySelector('[aria-label=\"Bottle size\"] button:nth-child(2)').getAttribute('aria-pressed')==='true' && document.querySelector('[data-pack=\"1500-carton\"] [data-pack-view]').getAttribute('aria-pressed')==='true'"}]},
 {...base,name:"shop-nothing-selected",actions:[ready],expect:[{name:"with no quantities set, Add to cart and Buy now are disabled with a hint",js:"document.querySelector('[data-add-basket]').disabled && document.querySelector('[data-buy-now]').disabled && document.querySelector('[data-selection-summary]').textContent.includes('No packs selected') && [...document.querySelectorAll('[data-pack] input')].every(i=>i.value==='0') && [...document.querySelectorAll('[data-pack]')].map(e=>e.dataset.pack).join()==='750-single,750-pack12'"}]},
 {...base,name:"shop-invalid-quantity",actions:[ready,{click:'[data-pack="750-pack12"] button[aria-label^="Increase"]'},{type:{selector:"#qty-750-single",text:"1.5"}}],expect:[{name:"an invalid quantity blocks Add to cart and Buy now",js:"document.querySelector('[data-add-basket]').disabled && !!document.querySelector('[role=alert]') && document.querySelector('[data-buy-now]').disabled && document.querySelector('#qty-750-single').getAttribute('aria-invalid')==='true'"}]},
 {...base,name:"shop-multi-select",actions:[ready,reset,{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-pack="750-pack12"] button[aria-label^="Increase"]'},{click:'[data-pack="750-pack12"] button[aria-label^="Increase"]'},{click:'[aria-label="Bottle size"] button:nth-child(2)'},{click:'[data-pack="1500-carton"] button[aria-label^="Increase"]'},{type:{selector:"#qty-1500-carton",text:"4"}},{waitFor:"document.querySelectorAll('[data-selection-line]').length===3"},{evaluate:"document.querySelector('[data-selection-summary]').scrollIntoView({block:'end',behavior:'instant'});true"}],expect:[
  {name:"one selection combines three packs across both sizes, each with its own quantity",js:"[...document.querySelectorAll('[data-selection-line]')].map(e=>e.dataset.selectionLine+':'+e.textContent.trim().split(' ')[0]).join()==='750-single:3,750-pack12:2,1500-carton:4'"},
  {name:"line totals and total: 3 × ₦650 + 2 × ₦7,500 + 4 × ₦14,500 = ₦74,950",js:"(()=>{const t=document.querySelector('[data-selection-total]').textContent;return t.includes('74,950.00') && !/on request/.test(t) && document.querySelector('[data-selection-line=\"750-single\"]').textContent.includes('1,950.00');})()"},
  {name:"quantities set under 750 ml are kept after switching to 1.5 L",js:"document.querySelector('[data-selection-line=\"750-pack12\"]')!==null && !document.querySelector('[data-pack=\"750-pack12\"]')"},
  {name:"Buy now is enabled for the combined selection",js:"!document.querySelector('[data-buy-now]').disabled"},
 ]},
 {...base,name:"shop-multi-add",actions:[ready,reset,{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-pack="750-pack12"] button[aria-label^="Increase"]'},{click:'[data-pack="750-pack12"] button[aria-label^="Increase"]'},{click:'[aria-label="Bottle size"] button:nth-child(2)'},{click:'[data-pack="1500-carton"] button[aria-label^="Increase"]'},{click:'[data-add-basket]'},{waitFor:"document.querySelector('[data-cart-count]').textContent==='4'"}],expect:[
  {name:"Add to cart adds every selected pack at once and resets the steppers",js:"(()=>{const b=JSON.parse(localStorage.getItem('rocktama.basket.v1'));return b.map(l=>l.variantId+':'+l.quantity).join()==='750-single:1,750-pack12:2,1500-carton:1' && [...document.querySelectorAll('[data-pack] input')].every(i=>i.value==='0') && document.querySelector('[role=status]').textContent.includes('Added 3 selections');})()"},
 ]},
 // D-121: Buy now and the cart icon both open the one cart/checkout page; /cart redirects there.
 {...base,name:"shop-buy-now",actions:[ready,reset,{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-pack="750-pack12"] button[aria-label^="Increase"]'},{click:'[aria-label="Bottle size"] button:nth-child(2)'},{click:'[data-pack="1500-carton"] button[aria-label^="Increase"]'},{click:'[data-buy-now]'},{waitFor:"location.pathname==='/checkout' && !![...document.querySelectorAll('main')].find(m=>m.checkVisibility())?.querySelector('#checkout-heading')"},{waitFor:"document.querySelectorAll('main aside li').length===3"}],expect:[
  {name:"Buy now adds the whole selection and opens checkout with every pack",js:"(()=>{const t=[...document.querySelectorAll('main')].find(m=>m.checkVisibility()).querySelector('aside').textContent;return ['750 ml','12 × 750 ml','12 × 1.5 L'].every(x=>t.includes(x)) && JSON.parse(localStorage.getItem('rocktama.basket.v1')).map(l=>l.variantId+':'+l.quantity).join()==='750-single:2,750-pack12:1,1500-carton:1' && document.querySelector('[data-cart-count]').textContent==='4';})()"},
 ]},
 {...base,name:"shop-add-then-icon",actions:[ready,reset,{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-add-basket]'},{waitFor:"document.querySelector('[data-cart-count]').textContent==='2'"}],expect:[
  {name:"Add to cart stays on the product page with a link to the cart/checkout page",js:"location.pathname==='/shop' && document.querySelector('[role=status] a')?.getAttribute('href')==='/checkout' && /View cart & checkout/.test(document.querySelector('[role=status]').textContent)"},
  {name:"the header cart icon links to the cart/checkout page (route registry)",js:"[...document.querySelectorAll('header a')].some(a=>a.getAttribute('href')==='/checkout' && a.querySelector('[data-cart-count]'))"},
 ]},
 {...base,name:"shop-cart-icon",actions:[ready,reset,{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{click:'[data-add-basket]'},{waitFor:"document.querySelector('[data-cart-count]').textContent==='2'"},{click:'header a[href="/checkout"]'},{waitFor:"location.pathname==='/checkout' && !![...document.querySelectorAll('main')].find(m=>m.checkVisibility())?.querySelector('#checkout-heading')"},{waitFor:"[...document.querySelectorAll('main')].find(m=>m.checkVisibility()).querySelector('aside')?.textContent.includes('1,300.00')"},{click:'button[aria-label^="Remove"]'},{waitFor:"[...document.querySelectorAll('main')].find(m=>m.checkVisibility())?.textContent.includes('basket is empty')"}],expect:[{name:"cart icon opens checkout with the basket; removing the item empties it and updates the header",js:"document.querySelector('[data-cart-count]').textContent==='0' && localStorage.getItem('rocktama.basket.v1')==='[]'"}]},
 {...base,name:"cart-redirect",actions:[{navigate:"/cart"},{waitFor:"location.pathname==='/checkout'"}],expect:[{name:"old /cart address permanently redirects to /checkout (308)",js:"fetch('/cart',{redirect:'manual'}).then(r=>r.type==='opaqueredirect')"}]},
 {...base,name:"shop-stale-basket",viewports:["mobile"],actions:[ready,{evaluate:"localStorage.setItem('rocktama.basket.v1',JSON.stringify([{variantId:'750-single',quantity:1},{variantId:'750-pack24',quantity:2},{variantId:'1500-single',quantity:1}]));window.dispatchEvent(new Event('rocktama:basket'));true"},{click:'header a[href="/checkout"]'},{waitFor:"location.pathname==='/checkout' && !![...document.querySelectorAll('main')].find(m=>m.checkVisibility())?.querySelector('#checkout-heading')"}],expect:[{name:"a saved basket with packs no longer sold online keeps only payable items (no 'Price on request', never ₦0)",js:"[...document.querySelectorAll('main')].find(m=>m.checkVisibility()).querySelectorAll('aside li').length===1 && !/Price on request|₦0\\.00/.test([...document.querySelectorAll('main')].find(m=>m.checkVisibility()).textContent) && document.querySelector('[data-cart-count]').textContent==='1'"}]},
 {...base,name:"shop-storage-failure",viewports:["mobile"],actions:[ready,reset,{click:'[data-pack="750-single"] button[aria-label^="Increase"]'},{evaluate:"window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new Error('storage disabled')};true"},{click:'[data-buy-now]'},{evaluate:"Storage.prototype.setItem=window.originalSetItem;true"}],expect:[{name:"storage failure is honest: stays on the page and points to Contact (no unpaid order route)",js:"location.pathname==='/shop' && /couldn’t save the cart/.test(document.querySelector('[role=status]').textContent) && document.querySelector('[data-cart-count]').textContent==='0' && document.querySelector('[role=status] a')?.getAttribute('href')==='/contact'"}]},
 {...base,name:"shop-corrupt-basket",viewports:["mobile"],actions:[ready,{evaluate:"localStorage.setItem('rocktama.basket.v1','not-json');window.dispatchEvent(new Event('rocktama:basket'));true"},{click:'header a[href="/checkout"]'},{waitFor:"[...document.querySelectorAll('main')].find(m=>m.checkVisibility())?.textContent.includes('basket is empty')"},reset],expect:[{name:"corrupt storage is handled safely",js:"document.querySelector('[data-cart-count]').textContent==='0'"}]},
 {...base,name:"shop-no-js",viewports:["mobile"],javascript:false,expect:[{name:"without JS: gallery and product links remain; ordering points to Contact (payment needs JS)",js:"!!document.querySelector('#shop-heading') && document.querySelectorAll('[data-shop-products] article a').length===4 && !!document.querySelector('section[aria-labelledby=shop-heading] a[href=\"/contact\"]') && !document.querySelector('a[href^=\"/wholesale?\"]')"}]},
 ];
}
