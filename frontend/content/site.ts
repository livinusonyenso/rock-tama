import type { SiteConfig } from "@/types/content";
import { enquiryWhatsAppNumber } from "@/content/contact";
import { whatsappChatHref } from "@/lib/contact";

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
      src: "/images/brand/rock-tama-horizontal.webp",
      alt: name,
      width: 960,
      height: 379,
      available: true,
    },
    stacked: {
      src: "/images/brand/rock-tama-stacked.webp",
      alt: name,
      width: 960,
      height: 464,
      available: true,
    },
  },
  // Interim, enquiry-oriented wording. Delivery coverage, wholesale fulfilment and
  // export are pending business verification; the reference copy is preserved in
  // docs/UI_BREAKDOWN.md §01 (D-030).
  announcements: [
    {
      id: "delivery",
      icon: "truck",
      text: "Ask About Delivery to Your Area",
      href: whatsappChatHref(enquiryWhatsAppNumber, "Hello ROCK-TAMA, do you deliver to my area?"),
      placement: "start",
      priority: 1,
    },
    {
      id: "wholesale",
      text: "Wholesale & Bulk Supply Enquiries for Hotels, Offices & Retailers",
      placement: "start",
      priority: 3,
    },
    {
      id: "international",
      icon: "globe",
      text: "International Enquiries Welcome",
      placement: "end",
      priority: 2,
    },
  ],
};
