/** WhatsApp number used by enquiry links, in international digits-only format. */
export const enquiryWhatsAppNumber = "2349034018849";

/**
 * Contact channels (D-111). Owner: WhatsApp number + email.
 * PLACEHOLDERS until the owner supplies the real details: replace `display`/`number`/`address` and set
 * `placeholder: false`. While a channel is a placeholder its action is not a link (a made-up WhatsApp number
 * could reach a stranger) and strict production launches are blocked (content/launch.ts).
 */
export const contact = {
  metaTitle: "Contact Us",
  metaDescription: "Contact ROCK-TAMA Natural Spring Water by WhatsApp or email for orders, delivery and wholesale questions.",
  eyebrow: "Contact Us",
  title: "Get in Touch",
  description: "Questions about our water, an order or regular supply? Message us on WhatsApp or send an email.",
  whatsapp: {
    placeholder: false,
    title: "WhatsApp",
    text: "Chat with our team about orders, delivery and availability.",
    display: "+234 903 401 8849",
    /** International format, digits only (e.g. 2348031234567). */
    number: enquiryWhatsAppNumber,
    greeting: "Hello ROCK-TAMA, I would like to ask about your spring water.",
    action: "Chat on WhatsApp",
  },
  phone: {
    title: "Call Us",
    text: "Speak to our team about orders, delivery and availability.",
    display: "+234 903 401 8849",
    /** tel: link target in international format. */
    tel: `+${enquiryWhatsAppNumber}`,
    action: "Call Now",
  },
  email: {
    placeholder: true,
    title: "Email",
    text: "For detailed questions, documents and business correspondence.",
    address: "rocktamanaturalspringwater@gmail.com",
    subject: "Enquiry from the ROCK-TAMA website",
    action: "Send an Email",
  },
  wholesale: {
    title: "Ordering in bulk?",
    text: "Hotels, offices, retailers and events can send a detailed wholesale enquiry.",
    action: "Request Wholesale",
  },
} as const;
