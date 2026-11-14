#!/usr/bin/env node
/**
 * ROCK-TAMA visual verification (D-040). No dependencies beyond Node and an
 * installed Chrome/Chromium: the script drives headless Chrome over the
 * DevTools Protocol and does all image work (crops, comparison sheets,
 * pixel diffs) inside the browser.
 *
 * Usage (see docs/DEVELOPMENT_GUIDELINES.md):
 *   npm run verify:visual
 *   npm run verify:visual -- --section announcement --viewport desktop,mobile
 *   npm run verify:visual -- --no-build              reuse the existing .next build
 *   npm run verify:visual -- --url http://localhost:3000   use a running server
 *   npm run verify:visual -- --approve               after owner acceptance: update APPROVED baselines
 *   npm run verify:visual -- --provisional           store PROVISIONAL references (not approved; D-049)
 *   npm run verify:visual -- --save m2.4             copy sheets + report to docs/verification/m2.4/
 *
 * Exit codes: 0 all checks passed · 1 a check failed · 2 incomplete (setup error).
 * Automated checks find layout problems; they are not proof of pixel-perfect
 * accuracy. Comparison sheets must still be reviewed by a person.
 */
import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import config from "./visual-check.config.mjs";

/**
 * @typedef {{ name: string, width: number, height: number, compareWithReference?: boolean }} Viewport
 * @typedef {{ click?: string, clickAt?: { x: number, y: number }, press?: string, times?: number, wait?: number, pauseAnimationsAt?: number }} Action
 * @typedef {{ name: string, page: string, selector?: string, reference?: { x: number, y: number, width: number, height: number },
 *   viewports?: string[], actions?: Action[], expect?: { name: string, js: string }[], media?: { name: string, value: string }[] }} Section
 * @typedef {{ port: number, cdpPort: number, reference: { path: string, width: number }, viewports: Viewport[],
 *   pages: { name: string, path: string }[], sections: Section[],
 *   regression: { pixelTolerance: number, maxDiffRatio: number }, ignoreConsole: (string|RegExp)[] }} VisualCheckConfig
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_DIR = join(ROOT, "docs/verification/baselines"); // approved by the owner
const PROVISIONAL_DIR = join(ROOT, "docs/verification/provisional"); // regression only, NOT approved
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

// ---------- CLI ----------
const { values: args } = parseArgs({
  allowNegative: true,
  options: {
    section: { type: "string", multiple: true },
    viewport: { type: "string", multiple: true },
    build: { type: "boolean", default: true },
    url: { type: "string" },
    approve: { type: "boolean", default: false },
    provisional: { type: "boolean", default: false },
    save: { type: "string" },
    "full-page": { type: "boolean", default: true },
  },
});
const pick = (list, wanted, label) => {
  if (!wanted?.length) return list;
  const names = wanted.flatMap((w) => w.split(","));
  const unknown = names.filter((n) => !list.some((item) => item.name === n));
  if (unknown.length) fatal(`Unknown ${label}: ${unknown.join(", ")}. Known: ${list.map((i) => i.name).join(", ")}`);
  return list.filter((item) => names.includes(item.name));
};
if (args.approve && args.provisional) fatal("Use either --approve or --provisional, not both.");
const sections = pick(config.sections, args.section, "section");
const viewports = pick(config.viewports, args.viewport, "viewport");
const pages = config.pages.filter((p) => !args.section || sections.some((s) => s.page === p.name));

// ---------- output ----------
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const RUN_DIR = join(ROOT, ".verification", stamp);
for (const sub of ["pages", "sections", "compare"]) mkdirSync(join(RUN_DIR, sub), { recursive: true });
const rel = (p) => relative(ROOT, p);

/** @type {{ scope: string, check: string, status: "PASS"|"FAIL"|"INCOMPLETE"|"INFO", detail: string }[]} */
const results = [];
const record = (scope, check, status, detail = "") => {
  results.push({ scope, check, status, detail });
  const mark = { PASS: "✓", FAIL: "✗", INCOMPLETE: "!", INFO: "·" }[status];
  console.log(`  ${mark} ${scope} | ${check}${detail ? ` | ${detail}` : ""}`);
};
function fatal(message) {
  console.error(`visual-check: ${message}`);
  process.exit(2);
}

// ---------- processes ----------
const children = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function start(cmd, cmdArgs, logFile) {
  const log = openSync(logFile, "a");
  const child = spawn(cmd, cmdArgs, { cwd: ROOT, detached: true, stdio: ["ignore", log, log] });
  children.push(child);
  return child;
}
function stopAll() {
  for (const child of children) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      /* already exited */
    }
  }
}
process.on("SIGINT", () => {
  stopAll();
  process.exit(2);
});
async function until(fn, label, timeoutMs = 60_000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      if (await fn()) return;
    } catch {
      /* not ready */
    }
    await wait(300);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
const reachable = async (url) => {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
};

// ---------- minimal CDP client ----------
async function connect(cdpPort) {
  const target = await (await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: ok, reject, method } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${method}: ${msg.error.message}`));
      else ok(msg.result);
    } else if (msg.method) {
      for (const fn of listeners.get(msg.method) ?? []) fn(msg.params);
    }
  });
  const send = (method, params = {}) =>
    new Promise((ok, reject) => {
      const i = ++id;
      pending.set(i, { resolve: ok, reject, method });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const on = (method, fn) => listeners.set(method, [...(listeners.get(method) ?? []), fn]);
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  return { send, on, evaluate, close: () => ws.close() };
}

// ---------- browser-side helpers ----------
const SETTLE = `(async () => {
  if (document.readyState !== "complete") await new Promise(r => addEventListener("load", r, { once: true }));
  await document.fonts.ready;
  await Promise.all([...document.images].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
  // Deterministic: wait until every finite animation (e.g. entrance sequences) has finished.
  await Promise.all(document.getAnimations().filter(a => a.effect && a.effect.getComputedTiming().endTime !== Infinity).map(a => a.finished.catch(() => null)));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  return { fonts: document.fonts.status, brokenImages: [...document.images].filter(i => i.naturalWidth === 0).map(i => i.currentSrc || i.src) };
})()`;

const OVERFLOW = `(() => {
  const vw = document.documentElement.clientWidth;
  const describe = el => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\\s+/).slice(0, 3).join(".") : "");
  const offenders = [...document.body.querySelectorAll("*")]
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1); })
    .slice(0, 5).map(describe);
  return { overflow: document.documentElement.scrollWidth - vw, offenders };
})()`;

const loadImages = `const load = src => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fail(new Error("image failed to load")); i.src = src; });`;

/** Pixel diff of two PNG data URLs, computed in a canvas. Returns ratio + a diff image. */
function pixelDiffExpression(a, b, tolerance) {
  return `(async () => { ${loadImages}
    const [A, B] = await Promise.all([load(${JSON.stringify(a)}), load(${JSON.stringify(b)})]);
    if (A.width !== B.width || A.height !== B.height) return { sizeMismatch: true, baseline: [A.width, A.height], current: [B.width, B.height] };
    const c = document.createElement("canvas"); c.width = A.width; c.height = A.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(A, 0, 0); const da = ctx.getImageData(0, 0, c.width, c.height).data;
    ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(B, 0, 0); const db = ctx.getImageData(0, 0, c.width, c.height).data;
    const out = ctx.createImageData(c.width, c.height); let diff = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      if (d > ${tolerance}) { diff++; out.data.set([230, 0, 0, 255], i); }
      else { const g = 255 - (255 - (da[i] + da[i + 1] + da[i + 2]) / 3) * 0.25; out.data.set([g, g, g, 255], i); }
    }
    ctx.putImageData(out, 0, 0);
    return { ratio: diff / (c.width * c.height), image: c.toDataURL("image/png") };
  })()`;
}

/** Comparison sheet: scaled reference crop, implementation, and a difference overlay. */
function sheetHtml({ refData, refWidth, rect, scale, implData, implWidth, implHeight, title }) {
  const w = Math.round(rect.width * scale);
  const h = Math.round(rect.height * scale);
  const refImg = `<img src="${refData}" style="position:absolute;left:${-rect.x * scale}px;top:${-rect.y * scale}px;width:${refWidth * scale}px">`;
  const box = (inner, bw, bh) => `<div style="position:relative;overflow:hidden;width:${bw}px;height:${bh}px">${inner}</div>`;
  const label = (t) => `<div style="padding:6px 8px;font:600 13px system-ui;color:#a00">${t}</div>`;
  return `<!doctype html><body style="margin:0;background:#fff">
    ${label(`${title}: REFERENCE (1086px mock scaled ×${scale.toFixed(3)}; indicative only)`)}${box(refImg, w, h)}
    ${label("IMPLEMENTATION")}<img src="${implData}" style="display:block">
    ${label("DIFFERENCE OVERLAY (black = similar; review manually, not a pixel-perfect test)")}
    ${box(`${refImg}<img src="${implData}" style="position:absolute;left:0;top:0;mix-blend-mode:difference">`, Math.max(w, implWidth), Math.max(h, implHeight))}
  </body>`;
}

// ---------- main ----------
async function main() {
  const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!chrome) fatal("Chrome/Chromium not found. Set CHROME_PATH.");
  const baseUrl = args.url ?? `http://127.0.0.1:${config.port}`;

  console.log(`visual-check → ${rel(RUN_DIR)}`);
  if (!args.url) {
    if (await reachable(baseUrl)) fatal(`Port ${config.port} is already in use. Stop that server or pass --url.`);
    if (args.build) {
      console.log("  building (next build)…");
      const build = start(join(ROOT, "node_modules/.bin/next"), ["build"], join(RUN_DIR, "build.log"));
      const code = await new Promise((r) => build.on("exit", r));
      if (code !== 0) fatal(`next build failed (exit ${code}). See ${rel(join(RUN_DIR, "build.log"))}`);
    }
    start(join(ROOT, "node_modules/.bin/next"), ["start", "-p", String(config.port)], join(RUN_DIR, "server.log"));
    await until(() => reachable(baseUrl), "the production server");
  }

  start(
    chrome,
    [
      "--headless=new",
      `--remote-debugging-port=${config.cdpPort}`,
      `--user-data-dir=${join(ROOT, ".verification/.chrome-profile")}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "about:blank",
    ],
    join(RUN_DIR, "chrome.log"),
  );
  await until(() => reachable(`http://127.0.0.1:${config.cdpPort}/json/version`), "headless Chrome");
  const cdp = await connect(config.cdpPort);
  await Promise.all(["Page.enable", "Runtime.enable", "Log.enable"].map((m) => cdp.send(m)));

  let consoleErrors = [];
  const ignored = (text) => config.ignoreConsole.some((p) => (p instanceof RegExp ? p.test(text) : text.includes(p)));
  const pushError = (text) => {
    if (!ignored(text)) consoleErrors.push(text.slice(0, 300));
  };
  cdp.on("Runtime.consoleAPICalled", ({ type, args: a }) => {
    if (type === "error" || type === "assert") pushError(a.map((x) => x.value ?? x.description ?? "").join(" "));
  });
  cdp.on("Runtime.exceptionThrown", ({ exceptionDetails: e }) => pushError(e.exception?.description ?? e.text));
  cdp.on("Log.entryAdded", ({ entry }) => {
    if (entry.level === "error") pushError(`${entry.text}${entry.url ? ` (${entry.url})` : ""}`);
  });

  const refPath = join(ROOT, config.reference.path);
  const refData = `data:image/png;base64,${readFileSync(refPath).toString("base64")}`;
  const screenshot = async (clip) => {
    const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, ...(clip && { clip: { ...clip, scale: 1 } }) });
    return Buffer.from(shot.data, "base64");
  };
  /** Pages for image work are written into about:blank, so no files are served. */
  const renderScratch = async (html) => {
    await cdp.send("Page.navigate", { url: "about:blank" });
    const { frameTree } = await cdp.send("Page.getFrameTree");
    await cdp.send("Page.setDocumentContent", { frameId: frameTree.frame.id, html });
    await cdp.evaluate(SETTLE);
  };

  const captured = []; // { section, viewport, file, png, rect }

  const appliesTo = (section, viewport) => !section.viewports || section.viewports.includes(viewport.name);
  const isInteractive = (section) => Boolean(section.actions || section.expect || section.media);

  /** Screenshot one section (by selector) and queue it for reference/regression comparison. */
  async function captureSection(section, viewport) {
    const sScope = `${section.name} @${viewport.name} ${viewport.width}px`;
    const rect = await cdp.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(section.selector)});
      if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height, visible: r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" }; })()`);
    if (!rect) {
      record(sScope, "section present", "FAIL", `selector not found: ${section.selector}`);
      return;
    }
    record(sScope, "section visible", rect.visible ? "PASS" : "FAIL", `${Math.round(rect.width)}×${Math.round(rect.height)}`);
    if (!rect.visible) return;
    const file = join(RUN_DIR, "sections", `${section.name}-${viewport.name}.png`);
    const png = await screenshot({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    writeFileSync(file, png);
    captured.push({ section, viewport, file, png, rect });
  }

  const KEYS = { Escape: 27, Tab: 9, Enter: 13, " ": 32 };
  async function mouseClick(x, y) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  }
  /** Actions: { click: selector } | { clickAt: { x, y } } | { press: key, times? } | { wait: ms } | { pauseAnimationsAt: ms } */
  async function runAction(action) {
    if (action.click) {
      const point = await cdp.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(action.click)});
        if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
      if (!point) throw new Error(`action target not found: ${action.click}`);
      await mouseClick(point.x, point.y);
    } else if (action.clickAt) {
      await mouseClick(action.clickAt.x, action.clickAt.y);
    } else if (action.press) {
      const code = KEYS[action.press];
      if (!code) throw new Error(`unsupported key: ${action.press}`);
      for (let i = 0; i < (action.times ?? 1); i++) {
        const key = { key: action.press, code: action.press === " " ? "Space" : action.press, windowsVirtualKeyCode: code };
        await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", ...key });
        await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
      }
    } else if (action.wait) {
      await wait(action.wait);
    } else if (action.pauseAnimationsAt !== undefined) {
      // Freeze every animation at a given time (0 = initial state) for deterministic inspection.
      await cdp.evaluate(`document.getAnimations().forEach(a => { a.pause(); a.currentTime = ${Number(action.pauseAnimationsAt)}; }); true`);
    } else {
      throw new Error(`unknown action: ${JSON.stringify(action)}`);
    }
    await wait(150);
  }

  for (const viewport of viewports) {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.width < 640 });
    for (const page of pages) {
      const scope = `${page.name} @${viewport.name} ${viewport.width}px`;
      consoleErrors = [];
      await cdp.send("Page.navigate", { url: new URL(page.path, baseUrl).href });
      let settled;
      try {
        settled = await cdp.evaluate(SETTLE);
      } catch (error) {
        record(scope, "page load", "INCOMPLETE", String(error.message));
        continue;
      }
      await wait(200); // let late console/network errors arrive
      record(scope, "fonts loaded", settled.fonts === "loaded" ? "PASS" : "FAIL", settled.fonts);
      record(scope, "images loaded", settled.brokenImages.length ? "FAIL" : "PASS", settled.brokenImages.join(", "));

      const { overflow, offenders } = await cdp.evaluate(OVERFLOW);
      record(scope, "no horizontal overflow", overflow > 0 ? "FAIL" : "PASS", overflow > 0 ? `+${overflow}px; ${offenders.join(", ")}` : "");

      const vpFile = join(RUN_DIR, "pages", `${page.name}-${viewport.name}-viewport.png`);
      writeFileSync(vpFile, await screenshot());
      if (args["full-page"]) {
        const { cssContentSize: size } = await cdp.send("Page.getLayoutMetrics");
        const fullFile = join(RUN_DIR, "pages", `${page.name}-${viewport.name}-full.png`);
        writeFileSync(fullFile, await screenshot({ x: 0, y: 0, width: viewport.width, height: Math.ceil(size.height) }));
      }

      const onPage = sections.filter((s) => s.page === page.name && appliesTo(s, viewport));
      for (const section of onPage.filter((s) => !isInteractive(s))) {
        await captureSection(section, viewport);
      }

      record(scope, "no console errors", consoleErrors.length ? "FAIL" : "PASS", consoleErrors.join(" | "));

      // Interactive states: each gets a fresh page load so states never leak into each other.
      for (const section of onPage.filter(isInteractive)) {
        const sScope = `${section.name} @${viewport.name} ${viewport.width}px`;
        consoleErrors = [];
        try {
          if (section.media) await cdp.send("Emulation.setEmulatedMedia", { features: section.media });
          await cdp.send("Page.navigate", { url: new URL(page.path, baseUrl).href });
          await cdp.evaluate(SETTLE);
          for (const action of section.actions ?? []) await runAction(action);
          await wait(350); // let transitions finish (drawer: 200ms)
        } catch (error) {
          record(sScope, "interaction", "INCOMPLETE", error.message);
          if (section.media) await cdp.send("Emulation.setEmulatedMedia", { features: [] });
          continue;
        }
        for (const expectation of section.expect ?? []) {
          try {
            const value = await cdp.evaluate(`(() => (${expectation.js}))()`);
            record(sScope, expectation.name, value ? "PASS" : "FAIL", value ? "" : `got ${JSON.stringify(value)}`);
          } catch (error) {
            record(sScope, expectation.name, "INCOMPLETE", error.message);
          }
        }
        const { overflow: o, offenders: off } = await cdp.evaluate(OVERFLOW);
        record(sScope, "no horizontal overflow", o > 0 ? "FAIL" : "PASS", o > 0 ? `+${o}px; ${off.join(", ")}` : "");
        if (section.selector) await captureSection(section, viewport);
        else writeFileSync(join(RUN_DIR, "sections", `${section.name}-${viewport.name}.png`), await screenshot());
        await wait(100);
        record(sScope, "no console errors", consoleErrors.length ? "FAIL" : "PASS", consoleErrors.join(" | "));
        if (section.media) await cdp.send("Emulation.setEmulatedMedia", { features: [] });
      }
    }
  }

  // Image work happens after page checks so it can't disturb them.
  for (const { section, viewport, file, png, rect } of captured) {
    const sScope = `${section.name} @${viewport.name} ${viewport.width}px`;
    const implData = `data:image/png;base64,${png.toString("base64")}`;

    if (viewport.compareWithReference && section.reference) {
      const scale = viewport.width / config.reference.width;
      await renderScratch(
        sheetHtml({ refData, refWidth: config.reference.width, rect: section.reference, scale, implData, implWidth: Math.round(rect.width), implHeight: Math.round(rect.height), title: sScope }),
      );
      const size = await cdp.evaluate("({ width: document.body.scrollWidth, height: document.body.scrollHeight })");
      const sheet = join(RUN_DIR, "compare", `${section.name}-${viewport.name}-reference.png`);
      writeFileSync(sheet, await screenshot({ x: 0, y: 0, width: size.width, height: size.height }));
      record(sScope, "reference comparison sheet", "INFO", `review ${rel(sheet)}`);
    }

    // Approved baselines take priority; provisional references (D-049) are used only when no
    // approved baseline exists, and are always labelled as not approved.
    const fileName = `${section.name}-${viewport.name}.png`;
    const approved = join(BASELINE_DIR, fileName);
    const provisional = join(PROVISIONAL_DIR, fileName);
    const reference = existsSync(approved)
      ? { path: approved, check: "matches approved baseline" }
      : existsSync(provisional)
        ? { path: provisional, check: "matches provisional reference (NOT approved)" }
        : null;
    if (reference) {
      await renderScratch("<!doctype html><body></body>");
      const result = await cdp.evaluate(
        pixelDiffExpression(`data:image/png;base64,${readFileSync(reference.path).toString("base64")}`, implData, config.regression.pixelTolerance),
      );
      if (result.sizeMismatch) {
        record(sScope, reference.check, "FAIL", `size changed ${result.baseline.join("×")} → ${result.current.join("×")}`);
      } else {
        const pct = (result.ratio * 100).toFixed(2);
        const diffFile = join(RUN_DIR, "compare", `${section.name}-${viewport.name}-baseline-diff.png`);
        writeFileSync(diffFile, Buffer.from(result.image.split(",")[1], "base64"));
        const ok = result.ratio <= config.regression.maxDiffRatio;
        record(sScope, reference.check, ok ? "PASS" : "FAIL", `${pct}% pixels differ${ok ? "" : `; see ${rel(diffFile)}`}`);
      }
    } else {
      record(sScope, "matches approved baseline", "INFO", "no approved baseline or provisional reference yet");
    }

    if (args.approve || args.provisional) {
      const dir = args.approve ? BASELINE_DIR : PROVISIONAL_DIR;
      mkdirSync(dir, { recursive: true });
      copyFileSync(file, join(dir, fileName));
      record(sScope, args.approve ? "approved baseline updated" : "provisional reference updated (NOT approved)", "INFO", rel(join(dir, fileName)));
    }
  }

  cdp.close();
}

function writeReport() {
  const count = (s) => results.filter((r) => r.status === s).length;
  const summary = { pass: count("PASS"), fail: count("FAIL"), incomplete: count("INCOMPLETE"), info: count("INFO") };
  const lines = [
    `# Visual check: ${stamp}`,
    "",
    `**Result:** ${summary.fail ? "FAIL" : summary.incomplete ? "INCOMPLETE" : "PASS"} · ${summary.pass} passed · ${summary.fail} failed · ${summary.incomplete} incomplete · ${summary.info} info`,
    "",
    `Sections: ${sections.map((s) => s.name).join(", ") || "none"} · Viewports: ${viewports.map((v) => `${v.name} ${v.width}px`).join(", ")}`,
    "",
    "> Automated checks catch overflow, loading, console and regression problems. Reference comparison sheets are indicative (the reference is a scaled mock) and must be reviewed by a person; passing checks are not proof of pixel-perfect accuracy.",
    "",
    "| Scope | Check | Status | Detail |",
    "|---|---|---|---|",
    ...results.map((r) => `| ${r.scope} | ${r.check} | ${r.status} | ${r.detail.replace(/\|/g, "\\|")} |`),
    "",
  ];
  writeFileSync(join(RUN_DIR, "report.md"), lines.join("\n"));
  writeFileSync(join(RUN_DIR, "report.json"), JSON.stringify({ stamp, summary, results }, null, 2));
  return summary;
}

let exitCode = 0;
try {
  await main();
} catch (error) {
  record("run", "verification completed", "INCOMPLETE", error.message);
} finally {
  stopAll();
  const summary = writeReport();
  if (args.save) {
    const dest = join(ROOT, "docs/verification", args.save);
    mkdirSync(dest, { recursive: true });
    copyFileSync(join(RUN_DIR, "report.md"), join(dest, "report.md"));
    for (const name of readdirSync(join(RUN_DIR, "compare"))) copyFileSync(join(RUN_DIR, "compare", name), join(dest, name));
    mkdirSync(join(dest, "sections"), { recursive: true });
    for (const name of readdirSync(join(RUN_DIR, "sections"))) copyFileSync(join(RUN_DIR, "sections", name), join(dest, "sections", name));
    console.log(`Saved report and comparison images to ${rel(dest)}`);
  }
  exitCode = summary.fail ? 1 : summary.incomplete ? 2 : 0;
  console.log(`\n${summary.fail ? "FAIL" : summary.incomplete ? "INCOMPLETE" : "PASS"}: ${summary.pass} passed, ${summary.fail} failed, ${summary.incomplete} incomplete. Report: ${rel(join(RUN_DIR, "report.md"))}`);
}
process.exit(exitCode);
