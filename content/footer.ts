import type { NavLinkItem } from "@/types/content";

export const footer = {
  groups: [
    { heading: "Shop", items: [
      { label: "All Products", route: "shop" },
      { label: "750 ml Bottle", route: "product750ml" },
      { label: "1.5 L Bottle", route: "product15l" },
      { label: "Carton Packs", route: "productCartons" },
    ] },
    { heading: "Company", items: [
      { label: "Our Story", route: "ourStory" },
      { label: "Quality & Safety", route: "quality" },
      { label: "Wholesale & Distribution", route: "wholesale" },
      { label: "Contact Us", route: "contact" },
    ] },
    { heading: "Help", items: [
      { label: "Delivery & Returns", route: "deliveryReturns" },
      { label: "FAQs", route: "faqs" },
      { label: "Terms & Conditions", route: "terms" },
      { label: "Privacy Policy", route: "privacy" },
    ] },
  ] satisfies { heading: string; items: NavLinkItem[] }[],
  newsletter: {
    heading: "Stay Connected",
    description: "News and updates from ROCK-TAMA.",
    unavailable: "Newsletter coming soon.",
  },
  // Only official, owner-supplied destinations belong here. No guessed social handles.
  socials: [] as readonly { label: string; href: `https://${string}` }[],
};
