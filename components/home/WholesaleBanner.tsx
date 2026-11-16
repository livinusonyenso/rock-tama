import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { IconFeature } from "@/components/ui/IconFeature";
import { Reveal } from "@/components/ui/Reveal";
import { homeSupply } from "@/content/home";
import { wholesale } from "@/content/wholesale";
import { resolveHref } from "@/lib/navigation";

/** Reuses the existing supply segments and working enquiry destination; no export promises. */
export function WholesaleBanner() {
  return (
    <section id="wholesale" aria-labelledby="supply-heading" className="pb-5">
      <Container size="wide">
        <Reveal viewportInset={0}>
          <div className="grid items-center gap-6 rounded-card bg-forest-850 p-6 text-on-dark shadow-card md:grid-cols-2 xl:flex xl:flex-wrap min-[90rem]:mr-10 min-[90rem]:ml-22 xl:gap-6 xl:px-8 xl:py-4">
            <h2 id="supply-heading" className="min-w-0 font-serif text-supply uppercase wrap-anywhere">{homeSupply.heading.map((line, index) => <span key={line} className="block">{line}{index === 0 ? " " : ""}</span>)}</h2>
            <p className="min-w-0 text-sm leading-snug wrap-anywhere text-on-dark md:border-l md:border-line-dark-strong/70 md:pl-6 xl:min-w-36 xl:flex-1">{homeSupply.description}</p>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,6rem),1fr))] gap-5 xl:col-span-1 xl:grid-cols-[repeat(4,6rem)] xl:gap-2">
              {wholesale.supply.segments.map(segment => (
                <li key={segment.icon} className="min-w-0"><IconFeature icon={segment.icon} label={segment.title} compact /></li>
              ))}
            </ul>
            <ButtonLink href={resolveHref(homeSupply.cta.route)} variant="primary" size="sm" trailingIcon="chevron-right" className="w-full xl:w-auto [&>span]:min-w-0 [&>span]:whitespace-normal [&>span]:wrap-anywhere">{homeSupply.cta.label}</ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
