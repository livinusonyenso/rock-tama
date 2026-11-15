import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { unverifiedClaims } from "./content/claims";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

/**
 * Deploy guard (D-066/D-072): a production deployment must never ship a form that cannot deliver
 * enquiries. On Vercel production builds, require the Resend configuration; local builds and
 * preview deployments are unaffected (previews report an honest error at submit time instead).
 */
function assertProductionDeliveryConfig() {
  if (process.env.VERCEL_ENV !== "production") return;
  const missing = ["RESEND_API_KEY", "ENQUIRY_TO", "ENQUIRY_FROM"].filter((name) => !process.env[name]);
  if (process.env.ENQUIRY_DELIVERY !== "resend") missing.unshift('ENQUIRY_DELIVERY="resend"');
  if (missing.length > 0) {
    throw new Error(
      `Production deployment blocked: enquiry delivery is not configured (missing ${missing.join(", ")}). ` +
        "See docs/ECOMMERCE_REQUIREMENTS.md.",
    );
  }
}

/**
 * Claims guard (D-013, D-078): a production deployment must not publish product, process or quality
 * claims without evidence. Lists every unverified claim in content/claims.ts.
 */
function assertNoUnverifiedClaims() {
  if (process.env.VERCEL_ENV !== "production") return;
  const pending = unverifiedClaims();
  if (pending.length > 0) {
    throw new Error(
      `Production deployment blocked: ${pending.length} claim(s) lack evidence: ` +
        pending.map(({ id, claim }) => `${id} ("${claim.text}": needs ${claim.evidence})`).join("; ") +
        ". Verify them in content/claims.ts or remove them from the content.",
    );
  }
}

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    assertProductionDeliveryConfig();
    assertNoUnverifiedClaims();
  }
  return nextConfig;
}
