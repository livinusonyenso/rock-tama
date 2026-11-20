import express from "express";
import { canAccessDistributorFeatures, createSessionGuards, fail, unauthenticated } from "./access.mjs";
import {
  authCookieConfig, createSessionToken, hashPassword, hashValue, readSessionToken, verifyPassword,
} from "./security.mjs";
import {
  clearLimit, consumeAttempt, deleteActiveSession, findBlockingLimit, findUserForLogin,
  insertPendingUser, insertSession, pruneExpiredAuthRows, recordFailures,
} from "./store.mjs";
import { validateLogin, validateRegistration } from "./validation.mjs";

const registrationLimit = { limit: 10, seconds: 3600 };
// Login limits count failed attempts only (D-133). A correct password never adds to them.
const loginLimits = {
  ip: { scope: "login_ip", limit: 30, seconds: 900 },
  emailAndIp: { scope: "login_email_ip", limit: 5, seconds: 900 },
  email: { scope: "login_email", limit: 100, seconds: 3600 },
};
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const dummyHash = await hashPassword(createSessionToken());

function sendUser(response, status, user) {
  const { id, email, name, company, phone, location, role, status: accountStatus } = user;
  return response.status(status).json({
    user: {
      id, email, name, company, phone: phone ?? null, location: location ?? null, role, status: accountStatus,
      canAccessDistributorFeatures: canAccessDistributorFeatures(user),
    },
  });
}

function requireJson(request, response, next) {
  if (!request.is("application/json")) {
    return fail(response, 415, "unsupported_media_type", "Send an application/json request.");
  }
  next();
}

function tooManyAttempts(response, retryAfter) {
  response.set("Retry-After", String(retryAfter));
  return fail(response, 429, "rate_limited", "Too many attempts. Try again later.");
}

export function createAuthRouter({ db, origin }) {
  const router = express.Router();
  const cookie = authCookieConfig(origin);
  const { requireSession } = createSessionGuards({ db, cookie });
  const parseJson = express.json({ limit: "8kb", inflate: false });
  let nextPruneAt = 0;
  let passwordJobs = 0;

  function sessionHash(request) {
    const token = readSessionToken(request.get("cookie"), cookie.name);
    return token ? hashValue(token) : null;
  }

  async function runPasswordJob(response, job) {
    if (passwordJobs >= 4) {
      response.set("Retry-After", "1");
      return fail(response, 503, "try_again", "Authentication is busy. Try again shortly.");
    }
    passwordJobs += 1;
    try {
      const now = Date.now();
      if (now >= nextPruneAt) {
        nextPruneAt = now + 60_000;
        await pruneExpiredAuthRows(db);
      }
      return await job();
    } finally {
      passwordJobs -= 1;
    }
  }

  router.use((request, response, next) => {
    response.set("Cache-Control", "no-store");
    // CSRF: every state-changing method needs the exact storefront Origin, including login before a
    // session exists. The Next.js gateway forwards the browser's Origin unchanged (D-134).
    if (!safeMethods.has(request.method) && !cookie.origins.has(request.get("origin"))) {
      return fail(response, 403, "origin_forbidden", "The request origin is not allowed.");
    }
    next();
  });

  router.post("/register", requireJson, parseJson, async (request, response) => {
    const { limit, seconds } = registrationLimit;
    if (!await consumeAttempt(db, "register_ip", hashValue(request.ip), limit, seconds)) {
      return tooManyAttempts(response, seconds);
    }
    const registration = validateRegistration(request.body);
    if (!registration) return fail(response, 400, "invalid_input", "Provide a valid email, name, company, phone, location, consent and 15–128 character password.");

    return runPasswordJob(response, async () => {
      // New and already-registered emails take the same path and get the same response, so registration
      // does not reveal which emails have accounts. An existing account is never modified.
      const passwordHash = await hashPassword(registration.password);
      await insertPendingUser(db, registration, passwordHash);
      return response.status(202).json({ registration: { status: "received" } });
    });
  });

  router.post("/login", requireJson, parseJson, async (request, response) => {
    const credentials = validateLogin(request.body);
    if (!credentials) return fail(response, 400, "invalid_input", "Provide a valid email and password.");

    const { ip, emailAndIp, email } = loginLimits;
    const buckets = [
      { ...ip, keyHash: hashValue(request.ip) },
      { ...emailAndIp, keyHash: hashValue(`${credentials.email}\n${request.ip}`) },
      { ...email, keyHash: hashValue(credentials.email) },
    ];
    const blocked = await findBlockingLimit(db, buckets);
    if (blocked) return tooManyAttempts(response, blocked.retryAfter);

    return runPasswordJob(response, async () => {
      const user = await findUserForLogin(db, credentials.email);
      const matches = await verifyPassword(user?.password_hash ?? dummyHash, credentials.password);
      if (!user || !matches) {
        await recordFailures(db, buckets);
        return fail(response, 401, "invalid_credentials", "Email or password is incorrect.");
      }

      // Success clears this email-and-IP bucket only; the IP and account-wide counters keep running.
      await clearLimit(db, buckets[1].scope, buckets[1].keyHash);
      const token = createSessionToken();
      await insertSession(db, user.id, hashValue(token), sessionHash(request));
      response.cookie(cookie.name, token, { ...cookie.options, maxAge: cookie.lifetime });
      return sendUser(response, 200, user);
    });
  });

  router.post("/logout", async (request, response) => {
    const hash = sessionHash(request);
    const deleted = hash && await deleteActiveSession(db, hash);
    response.clearCookie(cookie.name, cookie.options);
    if (!deleted) return unauthenticated(response);
    return response.status(204).end();
  });

  router.get("/me", requireSession, (_request, response) => sendUser(response, 200, response.locals.user));

  router.use((_request, response) => fail(response, 404, "not_found", "Authentication endpoint not found."));
  router.use((error, _request, response, next) => {
    if (response.headersSent) return next(error);
    if (error.type === "entity.too.large") return fail(response, 413, "request_too_large", "The request body is too large.");
    if (error.type === "charset.unsupported" || error.type === "encoding.unsupported") {
      return fail(response, 415, "unsupported_media_type", "Send uncompressed UTF-8 JSON.");
    }
    if (["entity.parse.failed", "request.size.invalid", "request.aborted"].includes(error.type)) {
      return fail(response, 400, "invalid_input", "Send a valid JSON request.");
    }
    // Log only the error code (for example a PostgreSQL SQLSTATE), never bodies, hashes or tokens.
    console.error("Authentication request failed", { code: error.code ?? error.name });
    return fail(response, 500, "internal_error", "Unable to complete the request.");
  });

  return router;
}
