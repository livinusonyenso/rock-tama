import type { Metadata } from "next";
import { OriginSection } from "@/components/home/OriginSection";
import { sectionPages } from "@/content/home";

const page = sectionPages.ourStory;
export const metadata: Metadata = { title: page.title, description: page.description };

/** Our Story (D-140): the nav opens this page instead of scrolling the homepage; same section as the homepage. */
export default function OurStoryPage() {
  return (
    <main id="main" className="flex-1 bg-ivory-50">
      <h1 className="sr-only">{page.title}</h1>
      <OriginSection />
    </main>
  );
}
