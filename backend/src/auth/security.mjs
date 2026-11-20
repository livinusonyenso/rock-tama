import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";

const passwordOptions = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };
const sessionTokenPattern = /^[A-Za-z0-9_-]{43}$/;
const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
const cookieLifetime = 8 * 60 * 60 * 1000;

export function hashPassword(password) {
  return argon2.hash(password, passwordOptions);
}

export function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}

export function hashValue(value) {
  return createHash("sha256").update(value).digest();
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

/**
 * AUTH_ORIGIN (D-132, D-134): one or more exact browser origins, comma-separated, for example the storefront
 * reached through the Next.js gateway. All must be HTTPS, or all must be HTTP loopback for local work, so one
 * cookie policy fits every origin. SameSite=Lax keeps the session on top-level navigation from other sites
 * (an email link); state-changing requests are still bound to these origins by the router.
 */
export function authCookieConfig(setting) {
  const entries = String(setting ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  const origins = new Set();
  const schemes = new Set();
  for (const origin of entries) {
    const url = URL.parse(origin);
    const secure = url?.protocol === "https:";
    const local = url?.protocol === "http:" && loopbackHosts.has(url.hostname);
    if (!url || url.origin !== origin || (!secure && !local)) {
      throw new Error("AUTH_ORIGIN entries must be exact HTTPS origins or HTTP loopback origins");
    }
    origins.add(origin);
    schemes.add(url.protocol);
  }
  if (origins.size === 0) throw new Error("AUTH_ORIGIN must list at least one origin");
  if (schemes.size !== 1) throw new Error("AUTH_ORIGIN entries must all be HTTPS or all be HTTP loopback");
  const secure = schemes.has("https:");
  return {
    name: secure ? "__Host-rocktama_session" : "rocktama_session",
    options: { httpOnly: true, secure, sameSite: "lax", path: "/" },
    lifetime: cookieLifetime,
    origins,
  };
}

export function readSessionToken(header, name) {
  const prefix = `${name}=`;
  const cookies = (header ?? "").split(";").map((part) => part.trim());
  const matches = cookies.filter((part) => part.startsWith(prefix));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(prefix.length);
  return sessionTokenPattern.test(token) ? token : null;
}
