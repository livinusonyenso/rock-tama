import "server-only";

/**
 * Payment provider configuration (D-122). Read at request time, never at module load.
 * - Paystack when PAYSTACK_SECRET_KEY is set (sk_test_… = Paystack test mode, sk_live_… = real payments).
 * - Otherwise a built-in **test gateway** ("dummy flow"): no money moves; clearly labelled everywhere.
 * - A strict public launch (VERCEL_ENV=production + DEPLOY_MODE=production) never uses the test gateway:
 *   without a key, online payment is unavailable and the build guard blocks the launch (next.config.ts).
 */
export type PaymentConfig =
  | { kind: "paystack"; secretKey: string; baseUrl: string; live: boolean }
  | { kind: "test"; secret: string }
  | { kind: "unavailable"; reason: string };

/** What the checkout UI needs to know (no secrets). */
export type PaymentMode = "paystack-live" | "paystack-test" | "test" | "unavailable";

export const isStrictLaunch = (env: NodeJS.ProcessEnv = process.env) =>
  env.VERCEL_ENV === "production" && env.DEPLOY_MODE === "production";

export function getPaymentConfig(env: NodeJS.ProcessEnv = process.env): PaymentConfig {
  const key = env.PAYSTACK_SECRET_KEY?.trim();
  if (key) {
    if (!/^sk_(test|live)_/.test(key)) return { kind: "unavailable", reason: "PAYSTACK_SECRET_KEY must start with sk_test_ or sk_live_." };
    return { kind: "paystack", secretKey: key, baseUrl: env.PAYSTACK_API_BASE_URL ?? "https://api.paystack.co", live: key.startsWith("sk_live_") };
  }
  if (isStrictLaunch(env)) return { kind: "unavailable", reason: "PAYSTACK_SECRET_KEY is not set." };
  // Not a secret in the security sense: test-gateway tokens only ever represent fake payments.
  return { kind: "test", secret: env.PAYMENT_TEST_SECRET ?? "rocktama-test-gateway" };
}

export function paymentMode(config: PaymentConfig = getPaymentConfig()): PaymentMode {
  if (config.kind === "paystack") return config.live ? "paystack-live" : "paystack-test";
  return config.kind;
}
