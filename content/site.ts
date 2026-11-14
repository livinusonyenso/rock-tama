import type { SiteConfig } from "@/types/content";

const name = "ROCK-TAMA";
const productLine = "Natural Spring Water";

export const site: SiteConfig = {
  name,
  heroDisplayName: "ROCK TAMA",
  productLine,
  title: `${name} ${productLine}`,
  description: `${name} natural spring water from Nanka, Anambra State, Nigeria.`,
  location: {
    locality: "Nanka",
    region: "Anambra State",
    country: "Nigeria",
  },
  logos: {
    horizontal: {
      src: "/brand/rock-tama-logo-horizontal.svg",
      alt: name,
      width: 320,
      height: 66,
      available: false,
    },
    stackedLight: {
      src: "/brand/rock-tama-logo-stacked-light.svg",
      alt: name,
      width: 170,
      height: 100,
      available: false,
    },
  },
  // Interim, enquiry-oriented wording. Delivery coverage, wholesale fulfilment and
  // export are pending business verification; the reference copy is preserved in
  // docs/UI_BREAKDOWN.md §01 (D-030).
  announcements: [
    { id: "delivery", icon: "truck", text: "Ask About Delivery to Your Area" },
    { id: "wholesale", text: "Wholesale & Bulk Supply Enquiries for Hotels, Offices & Retailers" },
    { id: "international", icon: "globe", text: "International Enquiries Welcome" },
  ],
};
