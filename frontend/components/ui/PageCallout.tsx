import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { resolveHref } from "@/lib/navigation";
import type { ButtonVariant, RouteKey } from "@/types/content";

export type PageCalloutContent = {
  heading: string;
  text: string;
  actions: readonly { label: string; route: RouteKey; variant: ButtonVariant }[];
};

/** Closing panel at the end of a content page: a short line and links to working pages (D-141). Server Component. */
export function PageCallout({ id, heading, text, actions }: PageCalloutContent & { id: string }) {
  return (
    <Container className="py-12 md:py-16">
      <section aria-labelledby={id} className="mx-auto max-w-3xl rounded-card border border-line-light bg-ivory-100 px-5 py-8 text-center sm:p-10">
        <h2 id={id} className="font-serif text-3xl font-semibold text-forest-850 sm:text-4xl">{heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed">{text}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {actions.map((action) => (
            <ButtonLink key={action.route} href={resolveHref(action.route)} variant={action.variant} size="sm" surface="light">
              {action.label}
            </ButtonLink>
          ))}
        </div>
      </section>
    </Container>
  );
}
