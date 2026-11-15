import { QualitySection } from "@/components/home/QualitySection";
import { WholesaleBanner } from "@/components/home/WholesaleBanner";
import { OriginSection } from "@/components/home/OriginSection";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductRangeSection } from "@/components/home/ProductRangeSection";
import { TrustStrip } from "@/components/home/TrustStrip";

/** Homepage: composes sections only (PROJECT_STRUCTURE). Sections are added per milestone. */
export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <HeroSection />
      <TrustStrip />
      <ProductRangeSection />
      <OriginSection />
      <QualitySection />
      <WholesaleBanner />
    </main>
  );
}
