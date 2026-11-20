import { hashValue, readSessionToken } from "./security.mjs";
import { findSessionUser } from "./store.mjs";

export function fail(response, status, code, message) {
  return response.status(status).json({ error: { code, message } });
}

export function unauthenticated(response) {
  return fail(response, 401, "authentication_required", "An active session is required.");
}

/** Approved-distributor access is derived from the stored role and status, never from the request. */
export function canAccessDistributorFeatures({ role, status }) {
  return role === "distributor" && status === "approved";
}

/**
 * Server-side authorisation for any router (D-133). Each request re-reads the session and user from
 * PostgreSQL, so logout, expiry and status changes apply immediately.
 */
export function createSessionGuards({ db, cookie }) {
  async function requireSession(request, response, next) {
    const header = request.get("cookie");
    const token = readSessionToken(header, cookie.name);
    const user = token && await findSessionUser(db, hashValue(token));
    if (!user) {
      // Remove a stale or malformed session cookie so the browser stops sending it.
      if (header?.includes(`${cookie.name}=`)) response.clearCookie(cookie.name, cookie.options);
      return unauthenticated(response);
    }
    response.locals.user = user;
    return next();
  }

  // Use after requireSession on every approved-distributor route.
  function requireApprovedDistributor(_request, response, next) {
    if (!canAccessDistributorFeatures(response.locals.user)) {
      return fail(response, 403, "distributor_approval_required", "This feature is available after your distributor account is approved.");
    }
    return next();
  }

  return { requireSession, requireApprovedDistributor };
}
