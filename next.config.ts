import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { unverifiedClaims } from "./content/claims";
import { launchPlaceholders } from "./content/launch";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // D-121: one cart/checkout page. Old /cart links and bookmarks go permanently to /checkout.
  async redirects() {
    return [{ source: "/cart", destination: "/checkout", permanent: true }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Process Tailwind only in its entry stylesheet; CSS Modules must retain
      // Next.js scoping and their exported class-name mapping.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

/**
 * Incomplete deployments automatically use staging behaviour: warnings rather than a build failure,
 * and noindex responses. DEPLOY_MODE=production explicitly restores strict launch checks.
 * This never makes an unconfigured enquiry submission report success.
 */
function missingDeliveryConfig() {
  const missing = ["RESEND_API_KEY", "ENQUIRY_TO", "ENQUIRY_FROM"].filter(name => !process.env[name]);
  if (process.env.ENQUIRY_DELIVERY !== "resend") missing.unshift('ENQUIRY_DELIVERY="resend"');
  return missing;
}

const stagingMode = () => process.env.DEPLOY_MODE === "staging" || (
  process.env.DEPLOY_MODE !== "production" &&
  (missingDeliveryConfig().length > 0 || unverifiedClaims().length > 0 || launchPlaceholders().length > 0 || paymentProblem() !== null)
);

function blockOrWarn(message: string) {
  if (stagingMode()) {
    console.warn(`[staging] ${message.replace("Production deployment blocked", "Not launch-ready")}`);
    return;
  }
  throw new Error(message);
}

/**
 * Delivery readiness check (D-100): warn for incomplete automatic/staging deployments.
 * Explicit DEPLOY_MODE=production retains the strict Resend build requirement.
 * Runtime delivery still reports an honest error when unconfigured.
 */
function assertProductionDeliveryConfig() {
  if (process.env.VERCEL_ENV !== "production") return;
  const missing = missingDeliveryConfig();
  if (missing.length > 0) {
    blockOrWarn(
      `Production deployment blocked: enquiry delivery is not configured (missing ${missing.join(", ")}). ` +
        "See docs/ECOMMERCE_REQUIREMENTS.md.",
    );
  }
}

/**
 * Claim readiness check: evidence is never inferred from a successful staging build.
 * Explicit DEPLOY_MODE=production rejects unverified claims; staging warns and stays noindex.
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

/**
 * Payment readiness (D-122): a public launch needs a live Paystack secret key. Without one, checkout uses the
 * built-in test gateway on staging (labelled "no money is charged") and online payment is off on a strict launch.
 */
function paymentProblem(): string | null {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) return "PAYSTACK_SECRET_KEY is not set (checkout uses the test gateway)";
  if (!/^sk_(test|live)_/.test(key)) return "PAYSTACK_SECRET_KEY must start with sk_test_ or sk_live_";
  if (key.startsWith("sk_test_")) return "PAYSTACK_SECRET_KEY is a Paystack test key (no real payments)";
  return null;
}

function assertPaymentsReady() {
  if (process.env.VERCEL_ENV !== "production") return;
  const problem = paymentProblem();
  if (problem) blockOrWarn(`Production deployment blocked: online payments are not live: ${problem}. See .env.example.`);
}

/**
 * Placeholder readiness check (D-111): placeholder contact details, sample testimonials and "#" social links
 * must be replaced before a public launch. Strict mode rejects them; staging warns and stays noindex.
 */
function assertNoLaunchPlaceholders() {
  if (process.env.VERCEL_ENV !== "production") return;
  const pending = launchPlaceholders();
  if (pending.length > 0) {
    blockOrWarn(`Production deployment blocked: placeholder content still present: ${pending.join("; ")}.`);
  }
}

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    assertProductionDeliveryConfig();
    assertNoUnverifiedClaims();
    assertNoLaunchPlaceholders();
    assertPaymentsReady();
  }
  if (!stagingMode()) return nextConfig;
  return {
    ...nextConfig,
    async headers() {
      return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
    },
  };
}
