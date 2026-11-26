import { isIP } from "node:net";

// Express understands these names (proxy-addr). Anything broader must be an explicit address or CIDR.
const namedRanges = new Set(["loopback", "linklocal", "uniquelocal"]);

/**
 * Parse TRUST_PROXY into an Express "trust proxy" setting (D-133).
 * Unset or empty → false: request.ip is the TCP peer and X-Forwarded-For is ignored.
 * Otherwise a comma-separated allow-list of proxy addresses, CIDRs or the names above.
 * "true", "*", hop counts and catch-all CIDRs are refused, so a misconfiguration stops start-up
 * instead of letting any client choose its own rate-limit identity.
 */
export function parseTrustProxy(value) {
  const raw = (value ?? "").trim();
  if (raw === "" || raw === "false") return false;
  return raw.split(",").map((entry) => {
    const item = entry.trim();
    if (namedRanges.has(item) || isIP(item)) return item;
    const [address, prefix, extra] = item.split("/");
    const family = isIP(address ?? "");
    const bits = /^\d{1,3}$/.test(prefix ?? "") ? Number(prefix) : -1;
    if (family && extra === undefined && bits >= 1 && bits <= (family === 4 ? 32 : 128)) return item;
    throw new Error(`TRUST_PROXY entry "${item}" is not an IP address, a CIDR range (not /0) or loopback, linklocal or uniquelocal`);
  });
}
