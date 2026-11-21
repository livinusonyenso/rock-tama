import type { Metadata } from "next";
import { ShopPageHeader } from "@/components/shop/ShopPageHeader";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Franchise Opportunities",
  description: "ROCK-TAMA franchise registration is coming soon.",
};

export default function FranchisePage() {
  return (
    <main id="main" aria-labelledby="franchise-heading" className="flex-1 bg-ivory-50 wrap-anywhere">
      <ShopPageHeader id="franchise-heading" eyebrow="Partner with us" title="Franchise opportunities" />
      <Container className="py-12 md:py-16">
        <section
          aria-labelledby="franchise-registration-heading"
          className="mx-auto max-w-2xl rounded-card border border-line-light bg-ivory-100 px-5 py-8 text-center sm:p-10"
        >
          <h2 id="franchise-registration-heading" className="font-serif text-3xl font-semibold text-forest-850 sm:text-4xl">
            Franchise registration is coming soon
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed">
            Check back here to find out how to apply to become a ROCK-TAMA franchise partner.
          </p>
        </section>
      </Container>
    </main>
  );
}
