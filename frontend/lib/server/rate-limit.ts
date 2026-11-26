import "server-only";

const hits = new Map<string, number[]>();

/**
 * Best-effort in-memory sliding-window limiter. Per server instance only; on serverless platforms
 * instances are not shared, so this deters casual abuse rather than guaranteeing a global limit
 * (documented limitation; a shared store can replace it later without changing callers).
 */
export function isRateLimited(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}
