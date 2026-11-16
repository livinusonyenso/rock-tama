/**
 * Homepage testimonials (D-111). SAMPLE content (owner: "use domain data for now"): these are not real
 * customers. While `sample` is true the section shows a visible note and strict production launches are
 * blocked (content/launch.ts). Replace with genuine quotes, given with the customer's permission, then set
 * `sample: false`. Quotes deliberately avoid product, quality or process claims.
 */
export const testimonials = {
  sample: true,
  sampleNotice: "Sample testimonials for preview. They will be replaced with real customer feedback before launch.",
  eyebrow: "Testimonials",
  heading: "What Our Customers Say",
  items: [
    { quote: "Our guests have started asking for ROCK-TAMA by name, and deliveries arrive when agreed, which matters for a busy hotel.", role: "Front Office Manager", place: "Hotel, Awka" },
    { quote: "The carton packs move well on our shelves, and the team responds quickly whenever we need to restock.", role: "Store Owner", place: "Supermarket, Onitsha" },
    { quote: "We served ROCK-TAMA at our wedding reception. The bottles looked elegant on every table.", role: "Event Host", place: "Wedding, Enugu" },
  ],
} as const;
