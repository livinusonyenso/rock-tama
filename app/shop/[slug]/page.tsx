import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClassName } from "@/components/ui/button-styles";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ProductCard } from "@/components/ui/ProductCard";
import { listedProducts, productBySlug } from "@/content/products";
import { shop } from "@/content/shop";
import { productHref, resolveHref, wholesaleQuoteHref } from "@/lib/navigation";
import { formatPrice } from "@/lib/price";

/** Pre-built product pages for listed products; unknown slugs get a real 404 in proxy.ts. */
export function generateStaticParams() {
  return listedProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  return product ? { title: product.name, description: product.summary } : { title: shop.metaTitle };
}

/** /shop/[slug]: product details; primary action = product enquiry with the product preselected (F2). */
export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  const requestHref = wholesaleQuoteHref(product.slug);
  const shopHref = resolveHref("shop");
  const others = listedProducts.filter((other) => other.slug !== product.slug);
  const [w, h] = product.media.aspect.split("/").map(Number);

  return (
    <main id="main" className="flex-1 bg-ivory-50">
      <Container size="wide" className="pt-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <li>
              {shopHref ? (
                <Link href={shopHref} className="focus-ring underline-offset-4 hover:text-gold-700 hover:underline">
                  Shop
                </Link>
              ) : (
                "Shop"
              )}
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink-900">
              {product.name}
            </li>
          </ol>
        </nav>
      </Container>

      <article aria-labelledby="product-heading">
        <Container size="wide" className="grid gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div className="flex min-h-96 items-end justify-center rounded-card border border-line-card bg-cream-200 p-8 shadow-card lg:min-h-136">
            <MediaFrame
              media={product.media}
              priority
              sizes={w > h ? "(min-width: 1024px) 480px, calc(100vw - 96px)" : `(min-width: 1024px) ${Math.ceil(480 * w / h)}px, ${Math.ceil(320 * w / h)}px`}
              className={w > h ? "w-full max-w-120" : "h-80 lg:h-120"}
            />
          </div>

          <div className="lg:pt-6">
            <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-gold-700">{product.packaging}</p>
            <h1 id="product-heading" className="mt-3 font-serif text-5xl font-bold text-ink-900 lining-nums lg:text-6xl">
              {product.name}
            </h1>
            <p className="mt-5 text-xl text-ink-700">{product.summary}</p>

            <dl className="mt-8 grid gap-3 border-y border-line-card py-6 text-base">
              <div className="flex gap-4">
                <dt className="w-32 shrink-0 font-semibold text-ink-900">Packaging</dt>
                <dd className="text-ink-700">{product.packaging}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 shrink-0 font-semibold text-ink-900">Price</dt>
                <dd className="font-serif text-2xl font-semibold text-forest-heading lining-nums">{formatPrice(product.price)}</dd>
              </div>
            </dl>

            {product.price === null && <p className="mt-6 text-base text-ink-700">{shop.requestNote}</p>}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              {requestHref && (
                <ButtonLink href={requestHref} variant="primary" surface="light" icon="file-text">
                  {shop.requestLabel}
                </ButtonLink>
              )}
              {shopHref && (
                <Link href={shopHref} className={buttonClassName("outline-light", { surface: "light" })}>
                  All products
                </Link>
              )}
            </div>
          </div>
        </Container>
      </article>

      {others.length > 0 && (
        <section aria-labelledby="other-products-heading" className="border-t border-line-card py-section-sm">
          <Container size="wide">
            <h2 id="other-products-heading" className="font-serif text-3xl font-semibold uppercase text-ink-900">
              {shop.otherProductsHeading}
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2">
              {others.map((other) => {
                const href = productHref(other);
                return (
                <li key={other.slug}>
                  <ProductCard
                    product={other}
                    meta={formatPrice(other.price)}
                    action={
                      href && (
                        <Link href={href} className={buttonClassName("outline-light", { size: "sm", surface: "light" })}>
                          {shop.viewLabel}
                          <span className="sr-only">: {other.name}</span>
                        </Link>
                      )
                    }
                  />
                </li>
                );
              })}
            </ul>
          </Container>
        </section>
      )}
    </main>
  );
}
