import { Suspense } from "react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { EnquiryFormWithPrefill } from "@/components/forms/EnquiryFormWithPrefill";
import { HeroWaves } from "@/components/home/HeroWaves";
import { Icon } from "@/components/icons/Icon";
import { SelectProductLink } from "@/components/wholesale/SelectProductLink";
import { buttonClassName } from "@/components/ui/button-styles";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { products } from "@/content/products";
import { wholesale } from "@/content/wholesale";
import { wholesaleQuoteHref } from "@/lib/navigation";
import type { Product } from "@/types/content";

type WholesaleLandingProps = {
  /** Set on the pre-built /wholesale/[product] pages: the form starts with this product selected. */
  selectedProduct?: Product;
};

/**
 * /wholesale landing (owner brief): hero → available products → who we supply → how it works →
 * enquiry form (F1, unchanged). Server Component; client islands: SelectProductLink, EnquiryForm.
 */
export function WholesaleLanding({ selectedProduct }: WholesaleLandingProps) {
  return (
    <main id="main" className="flex-1">
      {/* 1. Wholesale hero */}
      <section aria-labelledby="wholesale-heading" className="relative isolate overflow-hidden bg-hero text-on-dark">
        <HeroWaves />
        <Container className="py-section-sm lg:py-section">
          <p className="animate-enter text-sm font-semibold uppercase tracking-eyebrow text-gold-500 lg:text-base">
            {wholesale.hero.eyebrow}
          </p>
          <h1
            id="wholesale-heading"
            className="mt-4 max-w-3xl animate-enter font-serif text-5xl font-bold leading-none enter-delay-80 enter-duration-600 enter-rise-12 lg:text-7xl"
          >
            {wholesale.hero.heading}
          </h1>
          <p className="mt-6 max-w-2xl animate-enter text-lg text-on-dark enter-delay-200 lg:text-xl">{wholesale.hero.description}</p>
          <div className="mt-8 flex animate-enter flex-col gap-4 enter-delay-280 sm:flex-row sm:flex-wrap sm:gap-5">
            {wholesale.hero.actions.map((action) => (
              <ButtonLink key={action.label} href={action.href} variant={action.variant} icon={action.icon} className="sm:min-w-56">
                {action.label}
              </ButtonLink>
            ))}
          </div>
        </Container>
      </section>

      {/* 2. Available products (shared catalogue) */}
      <section id="products" aria-labelledby="products-heading" className="bg-ivory-50 py-section-sm lg:py-section">
        <Container size="wide">
          <SectionHeading id="products-heading" eyebrow={wholesale.products.eyebrow} title={wholesale.products.heading} description={wholesale.products.description} />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            {products.map((product) => {
              const href = wholesaleQuoteHref(product.slug);
              return (
                <li key={product.slug}>
                  <ProductCard
                    product={product}
                    action={
                      href && (
                        <SelectProductLink
                          href={href}
                          slug={product.slug}
                          productName={product.name}
                          className={buttonClassName("outline-light", { size: "sm", surface: "light" })}
                        >
                          {wholesale.products.selectLabel}
                          <span className="sr-only">: {product.name}</span>
                        </SelectProductLink>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* 3. Who we supply */}
      <section aria-labelledby="supply-heading" className="bg-forest-850 py-section-sm text-on-dark lg:py-section">
        <Container size="wide">
          <SectionHeading id="supply-heading" tone="dark" eyebrow={wholesale.supply.eyebrow} title={wholesale.supply.heading} description={wholesale.supply.description} />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {wholesale.supply.segments.map((segment) => (
              <li key={segment.title} className="text-center">
                <Icon name={segment.icon} strokeWidth={1.5} className="mx-auto size-10 text-gold-500" />
                <h3 className="mt-4 font-serif text-2xl font-semibold">{segment.title}</h3>
                <p className="mt-2 text-base text-on-dark-muted">{segment.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 4. How it works */}
      <section aria-labelledby="process-heading" className="bg-ivory-50 py-section-sm lg:py-section">
        <Container size="wide">
          <SectionHeading id="process-heading" eyebrow={wholesale.process.eyebrow} title={wholesale.process.heading} />
          <ol className="mt-10 grid gap-6 md:grid-cols-3 lg:mt-12">
            {wholesale.process.steps.map((step, index) => (
              <li key={step.title} className="relative rounded-card border border-line-card bg-cream-200 p-8 text-center shadow-card">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-gold-600 text-gold-700">
                  <Icon name={step.icon} strokeWidth={1.5} className="size-7" />
                </span>
                <p className="mt-4 text-sm font-semibold uppercase tracking-eyebrow text-gold-700">Step {index + 1}</p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-ink-900">{step.title}</h3>
                <p className="mt-3 text-base text-ink-700">{step.text}</p>
                {index < wholesale.process.steps.length - 1 && (
                  <Icon name="arrow-right" strokeWidth={1.5} className="absolute top-1/2 -right-5 z-10 hidden size-6 -translate-y-1/2 text-gold-600 md:block" />
                )}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 5. Enquiry form (F1, unchanged behaviour) */}
      <section id="enquiry" aria-labelledby="enquiry-heading" className="bg-sage-100 py-section-sm lg:py-section">
        <Container size="wide" className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <SectionHeading id="enquiry-heading" align="left" eyebrow={wholesale.enquiry.eyebrow} title={wholesale.enquiry.heading} description={wholesale.enquiry.description} />
          <div className="rounded-card border border-line-card bg-cream-200 p-6 shadow-card sm:p-10">
            <p id="product-selection-status" aria-live="polite" className="sr-only" />
            {selectedProduct ? (
              <EnquiryForm defaultProduct={selectedProduct.slug} />
            ) : (
              // Fallback is the same form without prefill, so it renders immediately and without JS.
              <Suspense fallback={<EnquiryForm />}>
                <EnquiryFormWithPrefill />
              </Suspense>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}
