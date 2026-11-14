import { HeroSection } from "@/components/home/HeroSection";

/** Homepage: composes sections only (PROJECT_STRUCTURE). Sections are added per milestone. */
export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <HeroSection />
    </main>
  );
}
