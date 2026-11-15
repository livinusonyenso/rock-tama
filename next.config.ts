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
 * Staging mode (D-097, owner-approved 2026-11-16): DEPLOY_MODE="staging" lets a Vercel production
 * deployment build while enquiry delivery or claim evidence is still pending. The guards below then warn
 * instead of failing, and every response carries `X-Robots-Tag: noindex` so the unfinished site is not
 * indexed. Remove DEPLOY_MODE for the public launch: the guards then block again until everything is ready.
 */
const stagingMode = () => process.env.DEPLOY_MODE === "staging";

function blockOrWarn(message: string) {
  if (stagingMode()) {
    console.warn(`[staging] ${message.replace("Production deployment blocked", "Not launch-ready")}`);
    return;
  }
  throw new Error(message);
}

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
    blockOrWarn(
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
    blockOrWarn(
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
  if (!stagingMode()) return nextConfig;
  return {
    ...nextConfig,
    async headers() {
      return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
    },
  };
}
