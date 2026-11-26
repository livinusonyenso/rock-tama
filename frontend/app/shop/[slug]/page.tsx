import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopStorefront } from "@/components/shop/ShopStorefront";
import { Container } from "@/components/ui/Container";
import { defaultVariantFor } from "@/content/commerce";
import { listedProducts, productBySlug } from "@/content/products";
import { shop } from "@/content/shop";

/** Pre-built product URLs for listed products; unknown slugs get a real 404 in proxy.ts. */
export function generateStaticParams() {
  return listedProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  return product ? { title: product.name, description: product.summary } : { title: shop.metaTitle };
}

/**
 * /shop/[slug] (D-125): the same storefront as All Products, with this product's pack preselected.
 * The page itself stays synchronous; reading `params` happens inside <Suspense> (Cache Components): direct
 * visits get the pre-built HTML, and client navigations can show the page frame instantly (D-126).
 */
export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<StorefrontPlaceholder />}>
      <ProductStorefront params={params} />
    </Suspense>
  );
}

async function ProductStorefront({ params }: { params: PageProps<"/shop/[slug]">["params"] }) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  return <ShopStorefront initialVariant={defaultVariantFor(product.slug).id} current={product.name} />;
}

/** Reserves the storefront's space while the product resolves (no wrong product flashes in). */
function StorefrontPlaceholder() {
  return (
    <main id="main" aria-busy="true" className="flex-1 bg-ivory-50">
      <Container size="wide" className="py-6">
        <p role="status" className="sr-only">Loading product…</p>
        <div aria-hidden="true" className="grid min-h-[36rem] gap-8 lg:grid-cols-2">
          <div className="rounded-card bg-cream-200" />
          <div className="space-y-4 pt-4">
            <div className="h-12 w-3/4 rounded-button bg-cream-200" />
            <div className="h-6 w-1/2 rounded-button bg-cream-200" />
            <div className="h-40 rounded-button bg-cream-200" />
          </div>
        </div>
      </Container>
    </main>
  );
}
