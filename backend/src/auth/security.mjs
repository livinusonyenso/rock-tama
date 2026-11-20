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

export function authCookieConfig(origin) {
  const url = URL.parse(origin);
  const secure = url?.protocol === "https:";
  const local = url?.protocol === "http:" && loopbackHosts.has(url.hostname);
  if (!url || url.origin !== origin || (!secure && !local)) {
    throw new Error("AUTH_ORIGIN must be an exact HTTPS origin or an HTTP loopback origin");
  }
  return {
    name: secure ? "__Host-rocktama_session" : "rocktama_session",
    options: { httpOnly: true, secure, sameSite: "strict", path: "/" },
    lifetime: cookieLifetime,
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
