import assert from "node:assert/strict";
import test from "node:test";
import { parseTrustProxy } from "../src/trust-proxy.mjs";

test("TRUST_PROXY is off unless explicitly set", () => {
  for (const value of [undefined, "", "  ", "false"]) assert.equal(parseTrustProxy(value), false);
});

test("TRUST_PROXY accepts explicit proxy addresses, CIDRs and private-range names", () => {
  assert.deepEqual(parseTrustProxy("10.0.0.0/16, 172.18.0.5,loopback"), ["10.0.0.0/16", "172.18.0.5", "loopback"]);
  assert.deepEqual(parseTrustProxy("fd00::/8,::1"), ["fd00::/8", "::1"]);
});

test("TRUST_PROXY refuses settings that let any client choose its IP", () => {
  for (const value of ["true", "*", "1", "2", "0.0.0.0/0", "::/0", "10.0.0.0/33", "10.0.0.0/8/1", "example.com", "10.0.0.0/", "uniquelocal,true"]) {
    assert.throws(() => parseTrustProxy(value), /TRUST_PROXY/, value);
  }
});
