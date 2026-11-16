/**
 * Register of product, process and quality claims shown on the site (D-013, D-068, D-078).
 * Every claim rendered anywhere must reference an entry here. A claim stays "unverified" until the
 * client supplies evidence (lab report, certificate, survey). Strict public-launch builds
 * (DEPLOY_MODE=production) reject unverified claims; incomplete automatic deployments
 * warn and remain noindex staging (next.config.ts, D-100).
 *
 * Self-contained on purpose (no path aliases): next.config.ts imports this file.
 */
export type ClaimStatus = "unverified" | "verified";

export type Claim = {
  /** Wording as it appears on the site. */
  text: string;
  status: ClaimStatus;
  /** Evidence required (unverified) or held (verified): document, issuer, date. */
  evidence: string;
};

export const claims = {
  qualityPurityTrust: { text: "Purity You Can Trust", status: "unverified", evidence: "Owner-approved purity assurance wording supported by current analyses" },
  undistilled: { text: "Undistilled (Natural State)", status: "unverified", evidence: "Documented process confirmation that the water is not distilled; reference typo corrected under the approved Quality briefing" },
  odourlessTastelessAtSource: { text: "Odourless & Tasteless at Source", status: "unverified", evidence: "Current sensory and relevant laboratory evidence at the source" },
  iso22000: { text: "ISO 22000 Food Safety Management", status: "unverified", evidence: "Valid applicable certificate with certifying body, certificate number, entity/site, scope and issue/expiry dates; badge hidden until verified" },
  naturallyProtectedSource: { text: "Naturally Protected Source", status: "unverified", evidence: "Site or hydrogeological evidence establishing natural protection of the Nanka source; rendered in homepage origin, evidence pending" },
  preservedNaturalPurity: { text: "Preserved Natural Purity", status: "unverified", evidence: "Documented handling/process and relevant current analyses supporting preservation of natural purity; rendered in homepage origin, evidence pending" },
  ultraPure: { text: "Ultra Pure", status: "unverified", evidence: "Lab analysis supporting a purity claim; owner approval of the marketing wording" },
  bottledAtSource: { text: "Bottled at Source", status: "unverified", evidence: "Confirmation that bottling takes place at the spring site" },
  lowTds: { text: "Low TDS (6–8 mg/L)", status: "unverified", evidence: "Current lab report showing total dissolved solids of 6–8 mg/L" },
  heavyMetalsNotDetected: { text: "Heavy Metals Not Detected", status: "unverified", evidence: "Lab report covering the heavy-metal panel with detection limits" },
  pathogensAbsent: { text: "Pathogens Absent", status: "unverified", evidence: "Microbiological lab report" },
  labTested: { text: "Lab Tested", status: "unverified", evidence: "Name/accreditation of the testing laboratory and test frequency" },
  rockFiltered: { text: "Naturally filtered through ancient rock formations", status: "unverified", evidence: "Hydrogeological survey or equivalent (hero description)" },
} as const satisfies Record<string, Claim>;

export type ClaimId = keyof typeof claims;

/** Claims that block a production deployment until verified. */
export const unverifiedClaims = (): { id: string; claim: Claim }[] =>
  Object.entries(claims as Record<string, Claim>)
    .filter(([, claim]) => claim.status !== "verified")
    .map(([id, claim]) => ({ id, claim }));
