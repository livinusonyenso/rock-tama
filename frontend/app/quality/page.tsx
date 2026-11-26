import type { Metadata } from "next";
import { QualitySection } from "@/components/home/QualitySection";
import { WaterBand } from "@/components/home/WaterBand";
import { ShopPageHeader } from "@/components/shop/ShopPageHeader";
import { PageCallout } from "@/components/ui/PageCallout";
import { sectionPages } from "@/content/home";

const page = sectionPages.quality;
export const metadata: Metadata = { title: page.title, description: page.description };

/** Quality & Safety (D-140, D-141): page header, the Quality section shared with the homepage, then a closing panel. */
export default function QualityPage() {
  return (
    <main id="main" aria-labelledby="quality-page-heading" className="flex-1 bg-ivory-50">
      <ShopPageHeader id="quality-page-heading" eyebrow={page.eyebrow} title={page.title} description={page.description} />
      <WaterBand>
        <QualitySection />
      </WaterBand>
      <PageCallout id="quality-callout" {...page.callout} />
    </main>
  );
}
