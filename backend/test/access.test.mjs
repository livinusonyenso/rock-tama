import assert from "node:assert/strict";
import test from "node:test";
import { canAccessDistributorFeatures, createSessionGuards } from "../src/auth/access.mjs";
import { authCookieConfig, createSessionToken } from "../src/auth/security.mjs";

const cookie = authCookieConfig("http://127.0.0.1:4000");

function fakeResponse() {
  return {
    locals: {}, statusCode: 200, body: undefined, cleared: false,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    clearCookie() { this.cleared = true; },
  };
}

async function run(guards, user, header) {
  const db = { query: async () => ({ rows: user ? [user] : [] }) };
  const { requireSession, requireApprovedDistributor } = createSessionGuards({ db, cookie });
  const response = fakeResponse();
  let reached = false;
  const request = { get: () => header };
  await requireSession(request, response, () => {
    requireApprovedDistributor(request, response, () => { reached = true; });
  });
  return { response, reached };
}

test("only approved distributors can access distributor features", () => {
  assert.equal(canAccessDistributorFeatures({ role: "distributor", status: "approved" }), true);
  for (const status of ["pending", "suspended", undefined]) assert.equal(canAccessDistributorFeatures({ role: "distributor", status }), false);
  assert.equal(canAccessDistributorFeatures({ role: "admin", status: "approved" }), false);
});

test("guards: approved passes, pending gets 403, no session gets 401 and a stale cookie is cleared", async () => {
  const header = `rocktama_session=${createSessionToken()}`;
  const approved = await run(true, { role: "distributor", status: "approved" }, header);
  assert.equal(approved.reached, true);

  const pending = await run(true, { role: "distributor", status: "pending" }, header);
  assert.equal(pending.reached, false);
  assert.equal(pending.response.statusCode, 403);
  assert.equal(pending.response.body.error.code, "distributor_approval_required");

  const stale = await run(true, null, header);
  assert.equal(stale.response.statusCode, 401);
  assert.equal(stale.response.cleared, true);

  const none = await run(true, null, undefined);
  assert.equal(none.response.statusCode, 401);
  assert.equal(none.response.cleared, false);
});
