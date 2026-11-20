import express from "express";
import {
  authCookieConfig, createSessionToken, hashPassword, hashValue, readSessionToken, verifyPassword,
} from "./security.mjs";
import {
  consumeAttempt, deleteActiveSession, findSessionUser, findUserForLogin,
  insertPendingUser, insertSession, pruneExpiredAuthRows,
} from "./store.mjs";
import { validateLogin, validateRegistration } from "./validation.mjs";

const registrationWindow = 3600;
const loginWindow = 900;
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const dummyHash = await hashPassword(createSessionToken());

function fail(response, status, code, message) {
  return response.status(status).json({ error: { code, message } });
}

function sendUser(response, status, { id, email, name, company, role, status: accountStatus }) {
  return response.status(status).json({
    user: {
      id, email, name, company, role, status: accountStatus,
      canAccessDistributorFeatures: role === "distributor" && accountStatus === "approved",
    },
  });
}

function unauthenticated(response) {
  return fail(response, 401, "authentication_required", "An active session is required.");
}

function requireJson(request, response, next) {
  if (!request.is("application/json")) {
    return fail(response, 415, "unsupported_media_type", "Send an application/json request.");
  }
  next();
}

export function createAuthRouter({ db, origin }) {
  const router = express.Router();
  const cookie = authCookieConfig(origin);
  const parseJson = express.json({ limit: "8kb", inflate: false });
  let nextPruneAt = 0;
  let passwordJobs = 0;

  function sessionHash(request) {
    const token = readSessionToken(request.get("cookie"), cookie.name);
    return token ? hashValue(token) : null;
  }

  async function rateLimit(response, scope, key, limit, seconds) {
    if (await consumeAttempt(db, scope, hashValue(key), limit, seconds)) return false;
    response.set("Retry-After", String(seconds));
    fail(response, 429, "rate_limited", "Too many attempts. Try again later.");
    return true;
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
    // Fail closed for every state-changing method, including login before a session exists.
    if (!safeMethods.has(request.method) && request.get("origin") !== origin) {
      return fail(response, 403, "origin_forbidden", "The request origin is not allowed.");
    }
    next();
  });

  router.post("/register", requireJson, parseJson, async (request, response) => {
    if (await rateLimit(response, "register_ip", request.ip, 10, registrationWindow)) return;
    const registration = validateRegistration(request.body);
    if (!registration) return fail(response, 400, "invalid_input", "Provide a valid email, name, company and 15–128 character password.");

    return runPasswordJob(response, async () => {
      const passwordHash = await hashPassword(registration.password);
      const user = await insertPendingUser(db, registration, passwordHash);
      if (!user) return fail(response, 409, "registration_conflict", "Unable to register with that email.");
      return sendUser(response, 201, user);
    });
  });

  router.post("/login", requireJson, parseJson, async (request, response) => {
    if (await rateLimit(response, "login_ip", request.ip, 30, loginWindow)) return;
    const credentials = validateLogin(request.body);
    if (!credentials) return fail(response, 400, "invalid_input", "Provide a valid email and password.");
    if (await rateLimit(response, "login_email", credentials.email, 5, loginWindow)) return;

    return runPasswordJob(response, async () => {
      const user = await findUserForLogin(db, credentials.email);
      const matches = await verifyPassword(user?.password_hash ?? dummyHash, credentials.password);
      if (!user || !matches) return fail(response, 401, "invalid_credentials", "Email or password is incorrect.");

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

  router.get("/me", async (request, response) => {
    const hash = sessionHash(request);
    const user = hash && await findSessionUser(db, hash);
    if (!user) return unauthenticated(response);
    return sendUser(response, 200, user);
  });

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
