"use server";
import {redirect} from "next/navigation";
import {z} from "zod";
import {priceBasket} from "@/lib/server/payments/order";
import {newOrderReference,savePendingOrder} from "@/lib/server/payments/order-session";
import {variantById} from "@/content/commerce";
import {HONEYPOT_FIELD} from "@/lib/enquiry";
export type CheckoutState={status:"idle"|"invalid"|"error";message?:string;errors?:Record<string,string>};
const schema=z.object({
 name:z.string().trim().min(2,"Enter your full name.").max(120),
 email:z.email("Enter a valid email address."),
 phone:z.string().trim().regex(/^\+?[0-9\s()-]{7,20}$/, "Enter a valid phone number with country code."),
 address:z.string().trim().min(5,"Enter your delivery address.").max(120),
 city:z.string().trim().min(2,"Enter your city.").max(40),
 state:z.string().trim().min(2,"Enter your state or region.").max(35),
 notes:z.string().trim().max(500,"Use 500 characters or fewer."),
 consent:z.literal("yes","Please agree that we may contact you about this request."),
});
const linesSchema=z.array(z.object({variantId:z.string().refine(id=>!!variantById(id)),quantity:z.number().int().min(1).max(10000)})).min(1).max(5);

/**
 * Checkout details → payment page (D-124). Validates the customer and basket on the server, keeps the pending
 * order in a signed httpOnly cookie (no personal data in URLs), then opens /checkout/pay where the customer
 * chooses card (Paystack) or bank transfer. Shop orders are always paid (D-123).
 */
export async function submitCheckout(_previous:CheckoutState,form:FormData):Promise<CheckoutState>{
 if(String(form.get(HONEYPOT_FIELD)??"")!=="")return {status:"error",message:"Your order could not be started. Please try again."};
 const fields=Object.fromEntries([...form.entries()].filter(([,v])=>typeof v==="string"));
 const details=schema.safeParse(fields);
 if(!details.success)return {status:"invalid",errors:Object.fromEntries(details.error.issues.map(i=>[String(i.path[0]),i.message])),message:"Please check the highlighted fields."};
 let raw:unknown;try{raw=JSON.parse(String(form.get("basket")??""))}catch{return {status:"error",message:"Your basket could not be read. Please return to the shop and try again."}}
 const parsed=linesSchema.safeParse(raw);
 if(!parsed.success||new Set(parsed.data.map(l=>l.variantId)).size!==parsed.data.length)return {status:"error",message:"Your basket is empty or has invalid items. Please review it before continuing."};
 if(priceBasket(parsed.data).unpriced.length>0)return {status:"error",message:"Some items in your basket are no longer sold online. Please review your basket."};
 const c=details.data;
 await savePendingOrder({orderRef:newOrderReference(),customer:{name:c.name,email:c.email,phone:c.phone,address:c.address,city:c.city,state:c.state,notes:c.notes},lines:parsed.data});
 redirect("/checkout/pay");
}
