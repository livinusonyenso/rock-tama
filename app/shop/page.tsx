import type { Metadata } from "next";
import { ShopPageHeader } from "@/components/shop/ShopPageHeader";
import { buttonClassName } from "@/components/ui/button-styles";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { listedProducts } from "@/content/products";
import { shop } from "@/content/shop";
import { productHref, resolveHref } from "@/lib/navigation";
import { formatPrice } from "@/lib/price";
import Link from "next/link";

export const metadata: Metadata = { title: shop.metaTitle, description: shop.metaDescription };

/** /shop: product listing from the catalogue (F2). Server Component. */
export default function ShopPage() {
  const wholesaleHref = resolveHref("wholesale");
  return (
    <main id="main" className="flex-1 bg-ivory-50">
      <section aria-labelledby="shop-heading">
        <ShopPageHeader id="shop-heading" eyebrow={shop.eyebrow} title={shop.heading} description={shop.description} />
        <Container size="wide" className="py-section-sm lg:py-section">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listedProducts.map((product) => {
              const href = productHref(product);
              return (
              <li key={product.slug}>
                <ProductCard
                  product={product}
                  headingLevel="h2"
                  meta={formatPrice(product.price)}
                  action={
                    href && (
                      <Link href={href} className={buttonClassName("outline-light", { size: "sm", surface: "light" })}>
                        {shop.viewLabel}
                        <span className="sr-only">: {product.name}</span>
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

      {wholesaleHref && (
        <section aria-labelledby="shop-wholesale-heading" className="bg-forest-850 text-on-dark">
          <Container size="wide" className="flex flex-col items-start gap-6 py-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 id="shop-wholesale-heading" className="font-serif text-3xl font-semibold">{shop.wholesale.heading}</h2>
              <p className="mt-2 text-lg text-on-dark-muted">{shop.wholesale.text}</p>
            </div>
            <ButtonLink href={wholesaleHref} variant="primary" icon="warehouse">
              {shop.wholesale.label}
            </ButtonLink>
          </Container>
        </section>
      )}
    </main>
  );
}
