import { Container } from "@/components/ui/Container";
import { IconFeature } from "@/components/ui/IconFeature";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeQuality } from "@/content/home";
import { qualityIndicators } from "@/content/highlights";
import { claims } from "@/content/claims";
import { canShowCertification } from "@/lib/certification";
import { siteDate } from "@/lib/site-date";

export async function QualitySection() {
  const certification = homeQuality.certification;
  // No date lookup, badge or ISO wording unless both evidence and explicit configuration permit it.
  const showCertificate = certification.enabled && canShowCertification(certification, claims.iso22000.status, await siteDate());
  return (
    <section id="quality" aria-labelledby="quality-heading" className="pt-8 pb-6 lg:pt-6 lg:pb-9">
      <Container size="wide" className="grid items-center gap-6 md:grid-cols-2 xl:flex xl:flex-wrap xl:gap-x-0 xl:pr-8 xl:pl-52 min-[90rem]:pr-20 min-[90rem]:pl-56">
        <Reveal viewportInset={0} className="min-w-0 xl:pr-7">
          <div data-claim={homeQuality.headingClaim} className="max-w-72 xl:max-w-60 [&_h2]:text-forest-heading [&_p]:text-gold-800">
            <SectionHeading id="quality-heading" eyebrow={homeQuality.eyebrow} title={homeQuality.heading} align="left" trailingRule />
          </div>
        </Reveal>
        <Reveal viewportInset={0} className="min-w-0 md:border-l md:border-gold-600/70 md:pl-6 xl:pr-6">
          <p className="max-w-64 text-base leading-snug text-balance text-ink-900 xl:max-w-56 xl:text-sm">{homeQuality.description}</p>
        </Reveal>
        <ul className="grid grid-cols-2 gap-y-6 md:col-span-2 md:grid-cols-4 md:divide-x md:divide-gold-600/60 xl:min-w-[min(100%,28rem)] xl:flex-1">
          {qualityIndicators.map((item, index) => (
            <li key={item.claim} data-claim={item.claim} data-claim-status={claims[item.claim].status} className="min-w-0 px-2 xl:px-1 min-[90rem]:px-0">
              <Reveal viewportInset={0} delay={index * 50}>
                <IconFeature icon={item.icon} label={item.label} tone="light" compact circled />
              </Reveal>
            </li>
          ))}
        </ul>
        {showCertificate && (
          <div data-certification="iso22000" className="flex items-center gap-4 md:col-span-2 xl:basis-full">
            <span className="rounded-full border-2 border-gold-700 p-5 text-center font-serif text-xl font-bold text-forest-heading">ISO<br />22000</span>
            <p className="text-sm text-ink-900">{claims.iso22000.text}</p>
          </div>
        )}
      </Container>
    </section>
  );
}
