import { Icon } from "@/components/icons/Icon";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { enquiryWhatsAppNumber } from "@/content/contact";
import { testimonials } from "@/content/testimonials";
import { whatsappChatHref } from "@/lib/contact";

/**
 * Customer testimonials: server-rendered card design with a lightweight continuous-motion island.
 * Shows a visible note while the content is sample data.
 */
export function TestimonialsSection() {
  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="bg-ivory-50 py-12 lg:py-16">
      <Container size="wide">
        <Reveal>
          <SectionHeading id="testimonials-heading" eyebrow={testimonials.eyebrow} title={testimonials.heading} eyebrowLines />
        </Reveal>
        {testimonials.sample && (
          <p data-sample-notice="" className="mx-auto mt-3 max-w-2xl text-center text-sm text-ink-700">{testimonials.sampleNotice}</p>
        )}
        <Reveal delay={80} className="mt-8">
          <TestimonialSlider
            label={testimonials.sliderLabel}
            slideLabels={testimonials.items.map((item) => `${item.role}, ${item.place}`)}
          >
            {testimonials.items.map((item) => (
              <figure key={item.place} className="flex h-full flex-col rounded-card border border-line-card bg-cream-200 p-6 shadow-card lg:p-8">
                <Icon name="quote" className="size-8 text-gold-600" />
                <blockquote className="mt-4 flex-1 font-serif text-xl leading-snug text-ink-900 italic">
                  <p>{item.quote}</p>
                </blockquote>
                <figcaption className="mt-6 border-t border-gold-600/40 pt-4 text-sm">
                  <span className="block font-semibold text-forest-heading">{item.role}</span>
                  <span className="block text-ink-700">{item.place}</span>
                </figcaption>
              </figure>
            ))}
          </TestimonialSlider>
        </Reveal>
        <div className="mt-6 text-center">
          <ButtonLink
            href={whatsappChatHref(enquiryWhatsAppNumber, testimonials.shareMessage)}
            variant="outline-light"
            surface="light"
            icon="message-circle"
          >
            {testimonials.shareLabel}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
