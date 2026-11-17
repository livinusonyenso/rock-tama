import { NextResponse, type NextRequest } from "next/server";
import { listedProducts } from "@/content/products";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/server/admin/session-token";

const knownProducts = new Set(listedProducts.map((product) => product.slug));

/**
 * 1. Admin protection (D-128): /admin requires a valid signed session (HTTP redirect to the sign-in page before
 *    any admin HTML is sent); a signed-in admin opening /auth/admin goes straight to the dashboard.
 * 2. Real 404 status for unknown /wholesale/<product> and /shop/<slug> URLs. With Cache Components, notFound()
 *    inside the page runs after the static shell has started a 200 response, so the check happens here, before
 *    streaming. Unknown slugs are rewritten to a path with no route (served as the 404 page).
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/admin" || path.startsWith("/admin/") || path === "/auth/admin") {
    const signedIn = verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value) !== null;
    if (path === "/auth/admin") return signedIn ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
    if (!signedIn) {
      const login = new URL("/auth/admin", request.url);
      const response = NextResponse.redirect(login);
      if (request.cookies.has(ADMIN_COOKIE)) response.cookies.delete(ADMIN_COOKIE); // expired or forged
      return response;
    }
    return NextResponse.next();
  }
  const slug = path.split("/")[2];
  if (slug && !knownProducts.has(slug)) {
    return NextResponse.rewrite(new URL("/_unknown-product", request.url));
  }
}

export const config = {
  matcher: ["/wholesale/:product", "/shop/:slug", "/admin", "/admin/:path*", "/auth/admin"],
};
