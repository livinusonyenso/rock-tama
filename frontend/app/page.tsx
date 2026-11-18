import { ContactSection } from "@/components/home/ContactSection";
import { QualitySection } from "@/components/home/QualitySection";
import { WholesaleBanner } from "@/components/home/WholesaleBanner";
import { OriginSection } from "@/components/home/OriginSection";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductRangeSection } from "@/components/home/ProductRangeSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WaterBand } from "@/components/home/WaterBand";

/** Homepage: composes sections only (PROJECT_STRUCTURE). Sections are added per milestone. */
export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <HeroSection />
      <TrustStrip />
      <ProductRangeSection />
      <OriginSection />
      <TestimonialsSection />
      <WaterBand>
        <QualitySection />
        <WholesaleBanner />
      </WaterBand>
      <ContactSection />
    </main>
  );
}
