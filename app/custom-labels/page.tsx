import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { CustomLabelEnquiry } from "@/components/forms/CustomLabelEnquiry";

export const metadata: Metadata = { title: "Custom Water Label Enquiries", description: "Discuss your wedding, memorial or royal event water label ideas with ROCK-TAMA." };
export default function CustomLabelsPage() {
  return <Container className="py-12 md:py-16">
    <h1 className="font-serif text-4xl font-semibold text-forest-850 md:text-5xl">Discuss your custom water label</h1>
    <p className="mt-4 max-w-3xl text-lg leading-relaxed">Share your occasion, date, quantity and label ideas. The images are proposed design concepts; our team will need to confirm available options, pricing and timing before any order.</p>
    <section aria-labelledby="custom-enquiry-heading" className="mt-10 max-w-3xl">
      <h2 id="custom-enquiry-heading" className="mb-6 font-serif text-3xl font-semibold">Tell us about your occasion</h2>
      <Suspense fallback={<EnquiryForm defaultMessage="Custom water label enquiry. Event date and label ideas:" />}><CustomLabelEnquiry /></Suspense>
    </section>
  </Container>;
}
