import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopStorefront } from "@/components/shop/ShopStorefront";
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
 * /shop/[slug] (D-125): the same storefront as All Products, with this product's pack preselected, so every
 * Shop menu item shows the same UI. Own title/description per product.
 */
export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  return <ShopStorefront initialVariant={defaultVariantFor(product.slug).id} current={product.name} />;
}
