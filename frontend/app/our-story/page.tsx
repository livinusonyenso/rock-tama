import type { Metadata } from "next";
import { OriginSection } from "@/components/home/OriginSection";
import { ShopPageHeader } from "@/components/shop/ShopPageHeader";
import { PageCallout } from "@/components/ui/PageCallout";
import { sectionPages } from "@/content/home";

const page = sectionPages.ourStory;
export const metadata: Metadata = { title: page.title, description: page.description };

/** Our Story (D-140, D-141): page header, the Origin section shared with the homepage, then a closing panel. */
export default function OurStoryPage() {
  return (
    <main id="main" aria-labelledby="our-story-heading" className="flex-1 bg-ivory-50">
      <ShopPageHeader id="our-story-heading" eyebrow={page.eyebrow} title={page.title} description={page.description} />
      <OriginSection />
      <PageCallout id="our-story-callout" {...page.callout} />
    </main>
  );
}
