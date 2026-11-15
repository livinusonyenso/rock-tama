import type { ButtonVariant, IconName } from "@/types/content";

/**
 * /wholesale landing copy (F1, restructured per owner brief). Enquiry-oriented (D-030): no prices,
 * minimum orders, stock levels, pack sizes, delivery times or export promises. The process
 * description and segment wording are to be confirmed with the client before launch.
 */
export const wholesale = {
  metaTitle: "Wholesale & Distribution",
  metaDescription:
    "Wholesale and bulk supply of ROCK-TAMA natural spring water for hotels, offices, retailers, events and institutions. Choose your products and request a quotation.",
  hero: {
    eyebrow: "ROCK-TAMA Wholesale",
    heading: "Wholesale and Distribution",
    description:
      "Natural spring water from Nanka, Anambra State, for hotels, offices, retailers and events. Choose the products you need and request a quotation for your volumes and delivery location.",
    actions: [
      { label: "Explore Products", href: "#products", variant: "primary", icon: "package-search" },
      { label: "Request Quote", href: "#enquiry", variant: "outline-dark", icon: "file-text" },
    ] satisfies { label: string; href: `#${string}`; variant: ButtonVariant; icon: IconName }[],
  },
  products: {
    eyebrow: "Available Products",
    heading: "Choose Your Supply",
    description: "Select a product to start your quotation. Pricing and availability are confirmed in your quote.",
    selectLabel: "Select product",
  },
  supply: {
    eyebrow: "Wholesale Supply",
    heading: "Who We Supply",
    description:
      "We welcome supply enquiries from businesses and institutions. Tell us your volumes, packaging and delivery location, and we'll confirm the supply arrangements we can offer.",
    segments: [
      { icon: "bed", title: "Hotels & Hospitality", text: "Guest rooms, restaurants, conferences and functions." },
      { icon: "building", title: "Offices & Workplaces", text: "Drinking water for staff, meetings and visitors." },
      { icon: "store", title: "Retail & Supermarkets", text: "Stock for shelves, chillers and multi-buy packs." },
      { icon: "calendar", title: "Events & Institutions", text: "Supply for events, schools and organisations." },
    ] satisfies { icon: IconName; title: string; text: string }[],
  },
  process: {
    eyebrow: "How It Works",
    heading: "From Selection to Supply",
    steps: [
      { icon: "package-search", title: "Choose Product", text: "Select the products and quantities your business needs." },
      { icon: "file-text", title: "Request Quotation", text: "Send your enquiry with your delivery location. We review it and reply with a quotation." },
      { icon: "handshake", title: "Confirm Supply", text: "Review the quotation and confirm your supply arrangement with us." },
    ] satisfies { icon: IconName; title: string; text: string }[],
  },
  enquiry: {
    eyebrow: "Request a Quote",
    heading: "Your Wholesale Enquiry",
    description: "Share your requirements and we'll reply by email or phone. Fields marked as optional can be left blank.",
  },
} as const;
