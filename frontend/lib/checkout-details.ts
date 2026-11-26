import {z} from "zod";
export const CHECKOUT_PROFILE_COOKIE="rt_checkout_profile";
export const checkoutDetailsSchema=z.object({
 name:z.string().trim().min(2,"Enter your full name.").max(120),
 email:z.email("Enter a valid email address."),
 phone:z.string().trim().regex(/^\+?[0-9\s()-]{7,20}$/, "Enter a valid phone number with country code."),
 address:z.string().trim().min(5,"Enter your delivery address.").max(120),
 city:z.string().trim().min(2,"Enter your city.").max(40),
 state:z.string().trim().min(2,"Enter your state or region.").max(35),
});
export type CheckoutDetails=z.infer<typeof checkoutDetailsSchema>;
