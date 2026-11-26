import "server-only";
import { isIP } from "node:net";
import { SESSION_COOKIE_NAMES, apiBaseUrl, sessionCookieHeader } from "@/lib/server/api";

/**
 * Same-origin gateway from the storefront to the Express auth API (D-134). Only these four endpoints and
 * methods are forwarded. Express stays authoritative: it checks Origin, validates input, rate-limits and owns
 * the session. The gateway only narrows what crosses: an allow-list of request headers (Content-Type, the
 * browser's Origin, the session cookie, optionally one client address) and of response headers (Content-Type,
 * Retry-After and the session Set-Cookie).
 */
const ROUTES: Record<string, "GET" | "POST"> = { register: "POST", login: "POST", logout: "POST", me: "GET" };
const MAX_BODY_BYTES = 8 * 1024;
const RESPONSE_HEADERS = ["content-type", "retry-after"];

function failure(status: number, code: string, message: string, headers: Record<string, string> = {}) {
  return Response.json({ error: { code, message } }, { status, headers: { "cache-control": "no-store", ...headers } });
}

/**
 * The client address to forward to Express, or null (D-134). Measured on `next start`: Next.js fills in
 * X-Forwarded-For only when the request has none, and passes a client-written value through unchanged. So the
 * header is only trustworthy behind a proxy that overwrites or appends it (Vercel, an AWS ALB).
 * - AUTH_CLIENT_IP_SOURCE unset or "none" (default): forward nothing. Express then sees one gateway address for
 *   everyone: coarse rate limits, but nothing a client can spoof.
 * - "x-forwarded-for": forward the right-most entry, the one written by that front proxy. Express honours it
 *   only when TRUST_PROXY names this server's address.
 */
export function forwardedFor(headers: Headers, env: NodeJS.ProcessEnv = process.env): string | null {
  const source = env.AUTH_CLIENT_IP_SOURCE?.trim() || "none";
  if (source === "none") return null;
  if (source !== "x-forwarded-for") {
    console.error("Auth gateway: AUTH_CLIENT_IP_SOURCE must be none or x-forwarded-for; forwarding no client address");
    return null;
  }
  const last = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "";
  return isIP(last) ? last : null;
}

/** Only the session cookie may be set through the gateway. */
function isSessionCookie(setCookie: string) {
  return (SESSION_COOKIE_NAMES as readonly string[]).includes(setCookie.split("=", 1)[0].trim());
}

async function readAuthBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return undefined;
  const bytes = new Uint8Array(MAX_BODY_BYTES);
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) return bytes.buffer.slice(0, length);
    if (length + value.byteLength > MAX_BODY_BYTES) {
      void reader.cancel().catch(() => {});
      return null;
    }
    bytes.set(value, length);
    length += value.byteLength;
  }
}

export async function forwardAuthRequest(
  request: Request,
  action: string,
  { env = process.env, fetchImpl = fetch }: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch } = {},
): Promise<Response> {
  const method = Object.hasOwn(ROUTES, action) ? ROUTES[action] : undefined;
  if (!method) return failure(404, "not_found", "Authentication endpoint not found.");
  if (request.method !== method) return failure(405, "method_not_allowed", "Method not allowed.", { allow: method });
  const base = apiBaseUrl(env);
  if (!base) {
    console.error("Auth gateway: API_URL is not configured");
    return failure(503, "service_unavailable", "Account services are unavailable. Try again shortly.");
  }

  const headers = new Headers({ accept: "application/json" });
  for (const name of ["content-type", "origin"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const cookie = sessionCookieHeader(request.headers.get("cookie"));
  if (cookie) headers.set("cookie", cookie);
  const client = forwardedFor(request.headers, env);
  if (client) headers.set("x-forwarded-for", client);

  let body: ArrayBuffer | undefined | null;
  if (method === "POST") {
    if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
      return failure(413, "request_too_large", "The request body is too large.");
    }
    try {
      body = await readAuthBody(request);
    } catch {
      return failure(400, "invalid_input", "The request body could not be read.");
    }
    if (body === null) return failure(413, "request_too_large", "The request body is too large.");
  }

  try {
    const upstream = await fetchImpl(`${base}/api/v1/auth/${action}`, {
      method, headers, body, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(10_000),
    });
    if (upstream.status >= 300 && upstream.status < 400) throw new Error("Unexpected authentication API redirect");
    const out = new Headers({ "cache-control": "no-store" });
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) out.set(name, value);
    }
    for (const value of upstream.headers.getSetCookie()) if (isSessionCookie(value)) out.append("set-cookie", value);
    const payload = upstream.status === 204 ? null : await upstream.arrayBuffer();
    return new Response(payload, { status: upstream.status, headers: out });
  } catch {
    return failure(503, "service_unavailable", "Account services are unavailable. Try again shortly.");
  }
}
