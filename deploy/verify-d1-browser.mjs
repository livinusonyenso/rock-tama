import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes, randomUUID, X509Certificate } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:tls";
import { setTimeout as sleep } from "node:timers/promises";

const shop = "https://shop.rocktama.localhost:8443";
const api = "https://api.rocktama.localhost:8443";
const ca = readFileSync(".d1/ca.pem");

function verifiedPin(origin) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: "127.0.0.1", port: 8443, servername: new URL(origin).hostname, ca }, () => {
      const leaf = new X509Certificate(socket.getPeerCertificate().raw);
      const spki = leaf.publicKey.export({ type: "spki", format: "der" });
      socket.end();
      resolve(createHash("sha256").update(spki).digest("base64"));
    });
    socket.setTimeout(5000, () => socket.destroy(new Error("TLS verification timed out")));
    socket.on("error", reject);
  });
}

async function until(test) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const value = await test();
    if (value) return value;
    await sleep(250);
  }
  throw new Error("Timed out waiting for a D1 browser check");
}

const pins = await Promise.all([verifiedPin(shop), verifiedPin(api)]);
const profile = mkdtempSync(join(tmpdir(), "rocktama-d1-chrome-"));
const binary = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// Trust only the two leaf keys already verified by Node against the D1 CA, in this disposable profile.
const chrome = spawn(binary, ["--headless=new", "--no-first-run", "--disable-background-networking",
  "--remote-debugging-port=0", `--user-data-dir=${profile}`, `--ignore-certificate-errors-spki-list=${pins.join(",")}`,
  "about:blank"], { stdio: "ignore" });
let launchError;
chrome.on("error", (error) => { launchError = error; });
// Per request: URL, network status and whether Chrome attached the session cookie. The *ExtraInfo events come
// from the network stack, so they are reported even when Opaque Response Blocking hides a JSON body from <img>.
const requests = new Map();
const request = (id) => { if (!requests.has(id)) requests.set(id, {}); return requests.get(id); };
const observed = (url) => [...requests.values()].find((entry) => entry.url === url && entry.status !== undefined && entry.cookieSent !== undefined);
const sessionName = "__Host-rocktama_session";
const subresource = `${shop}/api/v1/auth/me?probe=subresource`;
const navigation = `${shop}/api/v1/auth/me?probe=navigation`;
const crossSite = createServer((_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(`<img src="${subresource}"><a id="continue" href="${navigation}">Continue</a>`);
});
let socket;

try {
  crossSite.listen(0, "127.0.0.1");
  await once(crossSite, "listening");
  const devtools = await until(() => {
    if (launchError) throw launchError;
    if (chrome.exitCode !== null) throw new Error("Chrome exited before DevTools became available");
    try { return readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]; } catch { return false; }
  });
  const targets = await (await fetch(`http://127.0.0.1:${devtools}/json/list`)).json();
  socket = new WebSocket(targets.find(({ type }) => type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const event = JSON.parse(data);
    if (event.method === "Network.requestWillBeSent") request(event.params.requestId).url = event.params.request.url;
    if (event.method === "Network.requestWillBeSentExtraInfo") {
      request(event.params.requestId).cookieSent = event.params.associatedCookies
        .some(({ cookie, blockedReasons }) => cookie.name === sessionName && blockedReasons.length === 0);
    }
    if (event.method === "Network.responseReceivedExtraInfo") request(event.params.requestId).status = event.params.statusCode;
    if (event.id) pending.get(event.id)?.(event);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`DevTools ${method} timed out`)); }, 15_000);
    pending.set(id, (event) => {
      pending.delete(id);
      clearTimeout(timer);
      if (event.error) reject(new Error(`DevTools ${method} failed`));
      else resolve(event.result);
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error("A D1 script failed in Chrome");
    return result.result.value;
  };
  await send("Network.enable");
  await send("Page.navigate", { url: `${shop}/account/login` });
  await until(() => evaluate(`location.origin===${JSON.stringify(shop)} && !!document.querySelector('#auth-email')`));

  const credentials = { email: `d1-browser-${randomUUID()}@example.test`, password: randomBytes(24).toString("hex") };
  const registration = { ...credentials, name: "Browser Fixture", company: "Example Supplies",
    phone: "+234 803 123 4567", location: "Enugu, Enugu State", consent: true };
  const post = (action, body) => evaluate(`fetch('/api/v1/auth/${action}', {method:'POST',
    ${body ? `headers:{'content-type':'application/json'}, body:${JSON.stringify(JSON.stringify(body))}` : ""}}).then(r=>r.status)`);
  assert.equal(await post("register", registration), 202);
  assert.equal(await post("login", credentials), 200);
  const { cookies } = await send("Network.getCookies", { urls: [shop] });
  const cookie = cookies.find(({ name }) => name === sessionName);
  assert.ok(cookie && cookie.secure && cookie.httpOnly && cookie.sameSite === "Lax");
  assert.equal(cookie.domain, new URL(shop).hostname);
  assert.equal(cookie.path, "/");
  assert.ok(!(await send("Network.getCookies", { urls: [api] })).cookies.some(({ name }) => name === sessionName));
  assert.equal(await evaluate(`document.cookie.includes('${sessionName}')`), false);
  await send("Page.navigate", { url: `${shop}/account/dashboard` });
  await until(() => evaluate("!!document.querySelector('[data-account-status=pending]')"));

  await send("Page.navigate", { url: `http://127.0.0.1:${crossSite.address().port}` });
  const image = await until(() => observed(subresource));
  assert.deepEqual([image.status, image.cookieSent], [401, false], "SameSite=Lax must withhold the cookie from a cross-site subresource");
  await until(() => evaluate("!!document.querySelector('#continue')"));
  await evaluate("document.querySelector('#continue').click(); true");
  const followed = await until(() => observed(navigation));
  assert.deepEqual([followed.status, followed.cookieSent], [200, true], "SameSite=Lax must send the cookie on a top-level navigation");
  await until(() => evaluate(`location.href===${JSON.stringify(navigation)}`));
  assert.equal(await post("logout"), 204);
  assert.equal(await evaluate("fetch('/api/v1/auth/me').then(r=>r.status)"), 401);

  // The real form: type into the login fields, submit, reach the pending dashboard, then use its Log out button.
  await send("Page.navigate", { url: `${shop}/account/login` });
  await until(() => evaluate("document.querySelector('main button[type=submit]')?.disabled===false"));
  for (const [selector, text] of [["#auth-email", credentials.email], ["#auth-password", credentials.password]]) {
    await evaluate(`(()=>{const field=document.querySelector(${JSON.stringify(selector)});field.focus();field.select();return true})()`);
    await send("Input.insertText", { text });
  }
  await evaluate("document.querySelector('main button[type=submit]').click(); true");
  await until(() => evaluate("location.pathname==='/account/dashboard' && !!document.querySelector('[data-account-status=pending]')"));
  assert.match(await evaluate("document.querySelector('#account-profile').textContent"), /Example Supplies/);
  await evaluate("document.querySelector('[data-logout]').click(); true");
  await until(() => evaluate("location.pathname==='/account/login'"));
  assert.equal(await evaluate("fetch('/api/v1/auth/me').then(r=>r.status)"), 401);
  console.log("PASS Chrome HTTPS registration/login, host-only HttpOnly cookie, pending dashboard, SameSite=Lax subresource vs top-level navigation, logout; real login form and Log out button");
} finally {
  socket?.close();
  crossSite.close();
  if (chrome.pid && chrome.exitCode === null && chrome.signalCode === null) {
    const closed = once(chrome, "close");
    chrome.kill("SIGTERM");
    await closed;
  }
  rmSync(profile, { recursive: true, force: true });
}
