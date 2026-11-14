import { z } from "zod";
import { products } from "@/content/products";

/**
 * Wholesale / product enquiry contract, shared by the form (labels, limits, options) and the
 * Server Action (validation). No secrets here; safe for client and server.
 */
export const enquiryUnits = ["cartons", "bottles"] as const;
export const MIXED_PRODUCTS = "mixed";

export const enquiryProductOptions = [
  ...products.map((product) => ({ value: product.slug, label: product.name })),
  { value: MIXED_PRODUCTS, label: "Several products" },
] as const;

const productValues = enquiryProductOptions.map((option) => option.value) as [string, ...string[]];

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name or business name.").max(120, "Use 120 characters or fewer."),
  email: z.string().trim().pipe(z.email("Enter a valid email address, like name@example.com.")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{7,20}$/, "Enter a valid phone number, including the country code if outside Nigeria."),
  product: z.enum(productValues, "Choose the product you're interested in."),
  quantity: z.coerce
    .number("Enter the quantity as a number.")
    .int("Enter a whole number.")
    .min(1, "Enter a quantity of at least 1.")
    .max(1_000_000, "For quantities above 1,000,000, describe them in additional requirements."),
  unit: z.enum(enquiryUnits, "Choose cartons or bottles."),
  location: z.string().trim().min(2, "Enter the delivery city, state or country.").max(200, "Use 200 characters or fewer."),
  message: z.string().trim().max(2000, "Use 2,000 characters or fewer.").optional().default(""),
  consent: z.literal("yes", "Confirm that we may use these details to respond to your enquiry."),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export type EnquiryField = keyof Enquiry;

/** Result returned by the Server Action to the form. Values are echoed back so nothing typed is lost. */
export type EnquiryFormState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: Partial<Record<EnquiryField, string>>; values: Record<string, string> }
  | { status: "error"; message: string; values: Record<string, string> }
  | { status: "success"; reference: string; email: string };

/** Hidden spam-trap field name (humans never see or fill it). */
export const HONEYPOT_FIELD = "website_url";
