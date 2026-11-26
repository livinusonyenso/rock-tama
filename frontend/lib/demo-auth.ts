/**
 * Demo sign-ins (D-133): the distributor demo session and the admin demo login. Fail closed:
 * - never with DEPLOY_MODE=production, on any host (Vercel, Docker or AWS);
 * - on by default only under `next dev`;
 * - any production server (`next start`, Vercel, a container) needs an explicit DEMO_AUTH=enabled,
 *   so a deployment that forgets its configuration gets no demo login rather than a public one.
 * No imports: proxy.ts and the plain-Node check scripts load this file directly.
 */
export function demoAuthEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.DEPLOY_MODE === "production") return false;
  return env.NODE_ENV !== "production" || env.DEMO_AUTH === "enabled";
}
