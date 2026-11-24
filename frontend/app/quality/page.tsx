import type { Metadata } from "next";
import { QualitySection } from "@/components/home/QualitySection";
import { WaterBand } from "@/components/home/WaterBand";
import { sectionPages } from "@/content/home";

const page = sectionPages.quality;
export const metadata: Metadata = { title: page.title, description: page.description };

/** Quality & Safety (D-140): the nav opens this page instead of scrolling the homepage; same section as the homepage. */
export default function QualityPage() {
  return (
    <main id="main" className="flex-1 bg-ivory-50">
      <h1 className="sr-only">{page.title}</h1>
      <WaterBand>
        <QualitySection />
      </WaterBand>
    </main>
  );
}
