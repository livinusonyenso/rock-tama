import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/content/testimonials";

/**
 * Customer testimonials (D-111). Server Component; reuses SectionHeading + Reveal (staggered once-only reveal,
 * visible without JS / with reduced motion). Shows a visible note while the content is sample data.
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
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.items.map((item, index) => (
            <li key={item.place}>
              <Reveal delay={index * 80} className="h-full">
                <figure className="flex h-full flex-col rounded-card border border-line-card bg-cream-200 p-6 shadow-card lg:p-8">
                  <Icon name="quote" className="size-8 text-gold-600" />
                  <blockquote className="mt-4 flex-1 font-serif text-xl leading-snug text-ink-900 italic">
                    <p>{item.quote}</p>
                  </blockquote>
                  <figcaption className="mt-6 border-t border-gold-600/40 pt-4 text-sm">
                    <span className="block font-semibold text-forest-heading">{item.role}</span>
                    <span className="block text-ink-700">{item.place}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
