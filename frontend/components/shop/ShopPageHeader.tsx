import { HeroWaves } from "@/components/home/HeroWaves";
import { Container } from "@/components/ui/Container";

type ShopPageHeaderProps = { id: string; eyebrow: string; title: string; description?: string };

/** Compact dark-green page header for shop pages, reusing the hero background and waves. Server Component. */
export function ShopPageHeader({ id, eyebrow, title, description }: ShopPageHeaderProps) {
  return (
    <div className="relative isolate overflow-hidden bg-hero text-on-dark">
      <HeroWaves />
      <Container size="wide" className="py-12 lg:py-16">
        <p className="animate-enter text-sm font-semibold uppercase tracking-eyebrow text-gold-500 lg:text-base">{eyebrow}</p>
        <h1 id={id} className="mt-3 animate-enter font-serif text-5xl font-bold enter-delay-80 enter-duration-600 enter-rise-12 lg:text-6xl">
          {title}
        </h1>
        {description && <p className="mt-4 max-w-2xl animate-enter text-lg enter-delay-200">{description}</p>}
      </Container>
    </div>
  );
}
