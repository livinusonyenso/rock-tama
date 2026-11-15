/**
 * /shop and product page copy. Until online checkout is configured (F4), the honest purchase path is
 * a product enquiry through the working wholesale/enquiry flow (D-066, D-072): no simulated orders.
 */
export const shop = {
  metaTitle: "Shop",
  metaDescription: "Browse ROCK-TAMA natural spring water: 750 ml glass bottles, 1.5 L bottles and carton packs.",
  eyebrow: "Shop ROCK-TAMA",
  heading: "The ROCK-TAMA Range",
  description:
    "Natural spring water from Nanka, Anambra State. Prices are confirmed on request while online checkout is being set up.",
  viewLabel: "View product",
  requestLabel: "Request this product",
  requestNote:
    "Online checkout isn't available yet. Request this product and we'll confirm the price, availability and delivery for your location.",
  wholesale: {
    heading: "Buying for a business?",
    text: "Hotels, offices, retailers and events can request wholesale and bulk supply.",
    label: "Wholesale & Bulk Supply",
  },
  otherProductsHeading: "More from the range",
} as const;
