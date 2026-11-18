import { cacheLife } from "next/cache";

/** Stable server date for static content, refreshed daily (Cache Components compatible). */
export async function siteDate() {
  "use cache";
  cacheLife("days");
  return new Date().toISOString().slice(0, 10);
}
