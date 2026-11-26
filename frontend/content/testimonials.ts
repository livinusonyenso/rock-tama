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
  shareLabel: "Share your testimonial on WhatsApp",
  shareMessage: "Hello ROCK-TAMA, I'd like to share my testimonial:",
  items: [
    { quote: "Our guests have started asking for ROCK-TAMA by name, and deliveries arrive when agreed, which matters for a busy hotel.", role: "Front Office Manager", place: "Hotel, Awka" },
    { quote: "The carton packs move well on our shelves, and the team responds quickly whenever we need to restock.", role: "Store Owner", place: "Supermarket, Onitsha" },
    { quote: "We served ROCK-TAMA at our wedding reception. The bottles looked elegant on every table.", role: "Event Host", place: "Wedding, Enugu" },
    { quote: "Our office goes through several cartons every week, and reordering is simple and dependable.", role: "Office Administrator", place: "Company Office, Nnewi" },
    { quote: "The team was flexible with delivery times for our school events, even at short notice.", role: "School Bursar", place: "Secondary School, Ekwulobia" },
    { quote: "The 750 ml bottles suit our dining room, and guests often comment on how good they look on the table.", role: "Restaurant Manager", place: "Restaurant, Asaba" },
  ],
  sliderLabel: "Customer testimonials",
} as const;
