import type { Metadata } from "next";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ShopPageHeader } from "@/components/shop/ShopPageHeader";
import { Container } from "@/components/ui/Container";
import { contact } from "@/content/contact";

export const metadata: Metadata = { title: contact.metaTitle, description: contact.metaDescription };

/** Contact Us (D-111): composes the page header and contact channels. */
export default function ContactPage() {
  return (
    <main id="main" aria-labelledby="contact-heading" className="flex-1 bg-ivory-50">
      <ShopPageHeader id="contact-heading" eyebrow={contact.eyebrow} title={contact.title} description={contact.description} />
      <Container size="wide" className="py-12 lg:py-16">
        <ContactChannels />
      </Container>
    </main>
  );
}
