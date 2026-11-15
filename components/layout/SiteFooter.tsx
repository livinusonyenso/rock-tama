import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { footer } from "@/content/footer";
import { site } from "@/content/site";
import { resolveHref } from "@/lib/navigation";
import { siteDate } from "@/lib/site-date";

/** Shared Server footer; unavailable routes are honest text, never fake links. */
export async function SiteFooter() {
  const year = (await siteDate()).slice(0, 4);
  const homeHref = resolveHref("home");
  return (
    <footer className="bg-forest-850 text-on-dark">
      <Container size="wide">
        <div className="grid grid-cols-2 gap-8 py-8 md:grid-cols-3 xl:grid-cols-[1.1fr_1fr_1fr_1fr_2fr] xl:gap-8 xl:py-6">
          <div className="col-span-2 flex justify-center md:col-span-3 xl:col-span-1 xl:border-r xl:border-line-dark/70 xl:pr-8">
            {homeHref ? <Link href={homeHref} aria-label={`${site.name} home`} className="focus-ring-dark self-start"><Logo variant="footer" /></Link> : <Logo variant="footer" />}
          </div>
          {footer.groups.map(group => (
            <nav key={group.heading} aria-labelledby={`footer-${group.heading.toLowerCase()}`} className="min-w-0">
              <h2 id={`footer-${group.heading.toLowerCase()}`} className="mb-2 text-sm font-semibold">{group.heading}</h2>
              <ul className="space-y-1 text-sm wrap-anywhere leading-snug text-on-dark-muted">
                {group.items.map(item => {
                  const href = resolveHref(item.route);
                  return <li key={item.route}>{href
                    ? <Link href={href} className="focus-ring-dark inline-block py-1 transition-colors hover:text-on-dark">{item.label}</Link>
                    : <span className="inline-block py-1" data-pending="">{item.label}<span className="sr-only"> (Coming soon)</span></span>}
                  </li>;
                })}
              </ul>
            </nav>
          ))}
          <div className="col-span-2 min-w-0 md:col-span-3 xl:col-span-1 xl:border-l xl:border-line-dark/70 xl:pl-8">
            <h2 className="text-sm font-semibold">{footer.newsletter.heading}</h2>
            <p className="mt-2 text-sm text-on-dark-muted">{footer.newsletter.description}</p>
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <div className="mt-3 flex max-w-sm rounded-button border border-line-dark-strong/70">
              <input id="footer-email" type="email" autoComplete="email" placeholder="Enter your email" disabled aria-describedby="newsletter-availability" className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-on-dark placeholder:text-on-dark-muted disabled:cursor-not-allowed" />
              <button type="button" disabled aria-label="Subscribe" aria-describedby="newsletter-availability" className="flex size-11 shrink-0 items-center justify-center rounded-r-button bg-gold-gradient text-ink-900 disabled:cursor-not-allowed"><Icon name="arrow-right" className="size-5" /></button>
            </div>
            <p id="newsletter-availability" className="mt-2 text-sm text-on-dark-muted">{footer.newsletter.unavailable}</p>
            {footer.socials.length > 0 && <ul aria-label="Social media" className="mt-4 flex flex-wrap gap-4">{footer.socials.map(social => <li key={social.label}><a href={social.href} className="focus-ring-dark text-sm hover:text-gold-400">{social.label}</a></li>)}</ul>}
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-line-dark/70 py-4 text-center text-xs text-on-dark-muted md:flex-row md:justify-between md:text-left">
          <p>© {year} {site.name} {site.productLine}. All Rights Reserved.</p>
          <p>{site.productLine} from Africa <span aria-hidden="true" className="px-2">|</span> {site.location.locality}, {site.location.region}, {site.location.country}</p>
        </div>
      </Container>
    </footer>
  );
}
