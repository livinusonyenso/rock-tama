import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WholesaleLanding } from "@/components/wholesale/WholesaleLanding";
import { listedProducts, productBySlug } from "@/content/products";
import { wholesale } from "@/content/wholesale";

/**
 * /wholesale/[product]: the wholesale landing pre-built with a product selected (D-076), so
 * "Select product" works without JavaScript. Same content as /wholesale (canonical).
 * Unknown slugs return 404 via notFound() (`dynamicParams` is not available with cacheComponents).
 */

export function generateStaticParams() {
  return listedProducts.map((product) => ({ product: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/wholesale/[product]">): Promise<Metadata> {
  const product = productBySlug((await params).product);
  return {
    title: product ? `${product.name}: Wholesale Quote` : wholesale.metaTitle,
    description: wholesale.metaDescription,
    alternates: { canonical: "/wholesale" },
  };
}

export default async function WholesaleProductPage({ params }: PageProps<"/wholesale/[product]">) {
  const product = productBySlug((await params).product);
  if (!product) notFound();
  return <WholesaleLanding selectedProduct={product} />;
}
