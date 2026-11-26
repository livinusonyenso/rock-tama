import { ContactChannels } from "@/components/contact/ContactChannels";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contact } from "@/content/contact";

/**
 * Homepage Contact Us (D-117). Server Component; reuses the Contact page's WhatsApp + email cards so both stay
 * in sync with content/contact.ts (placeholders until the owner supplies real details).
 */
export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="home-contact-heading" className="bg-ivory-50 py-12 lg:py-16">
      <Container size="wide" className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center lg:gap-12">
        <Reveal>
          <SectionHeading id="home-contact-heading" eyebrow={contact.eyebrow} title={contact.title} description={contact.description} align="left" trailingRule />
        </Reveal>
        <Reveal delay={80}>
          <ContactChannels headingLevel="h3" withWholesale={false} />
        </Reveal>
      </Container>
    </section>
  );
}
