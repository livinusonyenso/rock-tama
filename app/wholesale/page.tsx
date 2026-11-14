import type { Metadata } from "next";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { EnquiryFormWithPrefill } from "@/components/forms/EnquiryFormWithPrefill";
import { Container } from "@/components/ui/Container";
import { wholesale } from "@/content/wholesale";

export const metadata: Metadata = {
  title: wholesale.metaTitle,
  description: wholesale.metaDescription,
};

/** /wholesale: working wholesale / product enquiry flow (F1, D-066). */
export default function WholesalePage() {
  return (
    <main id="main" className="flex-1 bg-ivory-50">
      <section aria-labelledby="wholesale-heading" className="py-section-sm lg:py-section">
        <Container size="wide" className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-gold-700">{wholesale.eyebrow}</p>
            <h1 id="wholesale-heading" className="mt-3 font-serif text-4xl font-semibold text-forest-heading lg:text-section">
              {wholesale.heading}
            </h1>
            <p className="mt-5 max-w-prose text-lg text-ink-700">{wholesale.intro}</p>
            <ul className="mt-8 grid gap-3 text-base text-ink-700">
              {wholesale.segments.map((segment) => (
                <li key={segment} className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-2 rounded-full bg-gold-600" />
                  {segment}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-line-card bg-cream-200 p-6 shadow-card sm:p-10">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-forest-heading">{wholesale.formHeading}</h2>
            {/* The fallback is the same form without prefill, so it renders immediately and without JS. */}
            <Suspense fallback={<EnquiryForm />}>
              <EnquiryFormWithPrefill />
            </Suspense>
          </div>
        </Container>
      </section>
    </main>
  );
}
