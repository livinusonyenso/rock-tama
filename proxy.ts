import { NextResponse, type NextRequest } from "next/server";
import { products } from "@/content/products";

const knownProducts = new Set(products.map((product) => product.slug));

/**
 * Real 404 status for unknown /wholesale/<product> URLs. With Cache Components, notFound() inside
 * the page runs after the static shell has started a 200 response, so the check happens here,
 * before streaming (Next.js docs: loading.js → Status codes). Unknown slugs are rewritten to a
 * path with no route, which Next.js serves as the not-found page with status 404.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !knownProducts.has(slug)) {
    return NextResponse.rewrite(new URL("/_unknown-wholesale-product", request.url));
  }
}

export const config = {
  matcher: "/wholesale/:product",
};
