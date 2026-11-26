import assert from "node:assert/strict";
import { canShowCertification } from "../lib/certification.ts";

// Synthetic fixtures only; never alter real claims or certificate configuration.
const active = { enabled: true, certificate: { issuer: "Fixture issuer", number: "TEST-ONLY", entity: "Fixture entity", scope: "Fixture scope", issuedOn: "2026-01-01", expiresOn: "2026-12-31" } };
assert.equal(canShowCertification(active, "verified", "2026-11-16"), true);
assert.equal(canShowCertification(active, "unverified", "2026-11-16"), false);
assert.equal(canShowCertification({ ...active, enabled: false }, "verified", "2026-11-16"), false);
assert.equal(canShowCertification({ enabled: true, certificate: null }, "verified", "2026-11-16"), false);
assert.equal(canShowCertification(active, "verified", "2027-01-01"), false);
assert.equal(canShowCertification(active, "verified", "2025-12-31"), false);
assert.equal(canShowCertification({ ...active, certificate: { ...active.certificate, scope: "" } }, "verified", "2026-11-16"), false);
assert.equal(canShowCertification({ ...active, certificate: { ...active.certificate, expiresOn: "2026-02-30" } }, "verified", "2026-01-16"), false);
console.log("PASS: 8 certification gates (active, unverified, disabled, missing, expired, future, incomplete, invalid date)");
