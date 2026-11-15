import { AfricaMap } from "@/components/brand/AfricaMap";
import { Container } from "@/components/ui/Container";
import { IconFeature } from "@/components/ui/IconFeature";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeOrigin } from "@/content/home";
import { claims } from "@/content/claims";

/** §6: Server composition; Reveal is the only client island. */
export function OriginSection() {
  return (
    <section id="origin" aria-labelledby="origin-heading" className="border-t border-line-card/50 bg-ivory-50 py-8 lg:pt-6 lg:pb-4">
      <Container size="wide" className="grid items-start gap-6 lg:grid-cols-[46%_minmax(0,1fr)] lg:gap-10">
        <Reveal className="min-w-0">
          <MediaFrame media={homeOrigin.media} mobileAspect="16/9" fit="cover" objectPosition="center" landscape sizes="(min-width: 1440px) 633px, (min-width: 1024px) 44vw, calc(100vw - 48px)" className="w-full rounded-card border border-line-card shadow-card" />
        </Reveal>
        <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-4 md:gap-y-4">
          <Reveal delay={80} className="min-w-0 md:col-start-1 md:row-start-1">
            <SectionHeading id="origin-heading" eyebrow={homeOrigin.eyebrow} title={homeOrigin.heading} align="left" size="compact" trailingRule />
            <p className="mt-2 text-base leading-snug text-ink-700">{homeOrigin.description}</p>
          </Reveal>
          <ul className="flex min-w-0 flex-col gap-4 md:col-start-1 md:row-start-2 md:flex-row md:flex-wrap md:gap-y-4">
            {homeOrigin.indicators.map((indicator, index) => (
              <li key={indicator.icon} data-claim={indicator.claim} data-claim-status={indicator.claim ? claims[indicator.claim].status : undefined} className="min-w-0 md:basis-32 md:grow md:border-l md:border-gold-600/60 md:pl-4 md:first:border-0 md:first:pl-0">
                <Reveal delay={index * 60}>
                  <IconFeature icon={indicator.icon} label={indicator.label} tone="light" layout="inline" />
                </Reveal>
              </li>
            ))}
          </ul>
          <AfricaMap className="mx-auto h-auto w-32 max-w-full md:col-start-2 md:row-start-1 md:row-span-2 md:w-36 lg:w-32 xl:w-44 2xl:w-46" />
        </div>
      </Container>
    </section>
  );
}
