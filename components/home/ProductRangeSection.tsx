import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { OfferCard } from "@/components/ui/OfferCard";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeProducts } from "@/content/home";
import { productBySlug } from "@/content/products";
import { productHref, resolveHref } from "@/lib/navigation";
import type { Product } from "@/types/content";

/**
 * Homepage §5 "Our Products" (UI_BREAKDOWN §05): three catalogue products linking to their product
 * pages + the Distributor Supply service offer linking to /wholesale. Server Component; the only client
 * code is the Reveal island. Reference layouts: cards 1–2 media-side, cards 3–4 media-middle.
 */
export function ProductRangeSection() {
  const cards = homeProducts.products
    .map(({ slug, ctaLabel }) => ({ product: productBySlug(slug), ctaLabel }))
    .filter((card): card is { product: Product; ctaLabel: string } => Boolean(card.product));
  const offer = homeProducts.distributorOffer;
  const offerHref = resolveHref(offer.cta.route);

  return (
    <section id="products" aria-labelledby="products-heading" className="bg-ivory-50 pt-12 pb-12 lg:pt-5 lg:pb-4">
      <Container size="wide">
        <Reveal>
          <SectionHeading
            id="products-heading"
            eyebrow={homeProducts.eyebrow}
            title={homeProducts.heading}
            description={homeProducts.subtitle}
            eyebrowLines
            descriptionStyle="serif-italic"
          />
        </Reveal>
        {/* Four media-side cards need wide-desktop space to keep full-size CTAs inside their cards. */}
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-4 min-[87.5rem]:grid-cols-4 lg:gap-2.5">
          {cards.map(({ product, ctaLabel }, index) => {
            const href = productHref(product);
            return (
              <li key={product.slug}>
                <Reveal delay={index * 80} className="h-full">
                  <ProductCard
                    product={product}
                    showPackaging={false}
                    layout={index < 2 ? "media-side" : "media-middle"}
                    action={
                      href && (
                        <ButtonLink href={href} variant="outline-light" size="sm" surface="light" trailingIcon="chevron-right">
                          {ctaLabel}
                        </ButtonLink>
                      )
                    }
                  />
                </Reveal>
              </li>
            );
          })}
          {offerHref && (
            <li>
              <Reveal delay={cards.length * 80} className="h-full">
                <OfferCard
                  title={offer.title}
                  text={offer.text}
                  media={offer.media}
                  titleStyle={offer.titleStyle}
                  layout="media-middle"
                  action={
                    <ButtonLink href={offerHref} variant="outline-light" size="sm" surface="light" trailingIcon="chevron-right">
                      {offer.cta.label}
                    </ButtonLink>
                  }
                />
              </Reveal>
            </li>
          )}
        </ul>
      </Container>
    </section>
  );
}
