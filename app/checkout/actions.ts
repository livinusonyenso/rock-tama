"use server";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {z} from "zod";
import {getPaymentConfig} from "@/lib/server/payments/config";
import {newPaymentReference,priceBasket,type PaymentMetadata} from "@/lib/server/payments/order";
import {initializeTransaction} from "@/lib/server/payments/paystack";
import {createTestToken} from "@/lib/server/payments/test-gateway";
import {isRateLimited} from "@/lib/server/rate-limit";
import {submitEnquiry} from "@/app/wholesale/actions";
import {variantById,money} from "@/content/commerce";
import {HONEYPOT_FIELD} from "@/lib/enquiry";
export type CheckoutState={status:"idle"|"invalid"|"error"|"success";message?:string;errors?:Record<string,string>;reference?:string};
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
export async function submitCheckout(_previous:CheckoutState,form:FormData):Promise<CheckoutState>{
 const fields=Object.fromEntries([...form.entries()].filter(([,v])=>typeof v==="string"));
 const details=schema.safeParse(fields);
 if(!details.success)return {status:"invalid",errors:Object.fromEntries(details.error.issues.map(i=>[String(i.path[0]),i.message])),message:"Please check the highlighted fields."};
 let raw:unknown;try{raw=JSON.parse(String(form.get("basket")??""))}catch{return {status:"error",message:"Your basket could not be read. Please return to the shop and try again."}}
 const parsed=linesSchema.safeParse(raw);
 if(!parsed.success||new Set(parsed.data.map(l=>l.variantId)).size!==parsed.data.length)return {status:"error",message:"Your basket is empty or has invalid items. Please review it before continuing."};
 const lines=parsed.data,customer=details.data;
 if(form.get("payment")==="now")return startPayment(customer,lines,String(form.get(HONEYPOT_FIELD)??""));
 // Prices are always read on the server. Client-supplied totals are never accepted.
 const variants=lines.map(line=>({...line,variant:variantById(line.variantId)!}));
 const single=variants.length===1?variants[0]:null;
 const enquiry=new FormData();
 for(const key of ["name","email","phone","consent"] as const)enquiry.set(key,customer[key]);
 enquiry.set(HONEYPOT_FIELD,String(form.get(HONEYPOT_FIELD)??""));
 enquiry.set("product",single?single.variant.product:"mixed");
 enquiry.set("quantity",String(single?single.quantity*single.variant.bottles:variants.reduce((n,l)=>n+l.quantity*(l.variant.unit==="cartons"?12:l.variant.bottles),0)));
 enquiry.set("unit",single?single.variant.unit:"bottles");
 enquiry.set("location",`${customer.address}, ${customer.city}, ${customer.state}`);
 enquiry.set("message",["Checkout order request — no payment collected. Draft prices subject to confirmation.",...variants.map(l=>`${l.quantity} × ${l.variant.label} (${l.variant.detail}) — ${money(l.variant.amount)} per selection.`),single?"":"Mixed total expressed in bottles; draft carton configuration is 12 bottles.","Delivery fee, availability and payment arrangements require confirmation.",customer.notes?`Delivery notes: ${customer.notes}`:""].filter(Boolean).join("\n"));
 const result=await submitEnquiry({status:"idle"},enquiry);
 if(result.status==="success")return {status:"success",reference:result.reference};
 return {status:"error",message:result.status==="error"?result.message:"Please check your contact and delivery details and try again."};
}

/**
 * "Pay now" (D-122): price the basket on the server, then hand over to the provider's hosted payment page
 * (Paystack) or the built-in test gateway. Card details never touch this site. redirect() must stay outside try/catch.
 */
async function startPayment(customer:z.infer<typeof schema>,lines:PaymentMetadata["lines"],honeypot:string):Promise<CheckoutState>{
 const unavailable="Online payment isn't available right now. Choose “Arrange payment after quotation” or try again later.";
 if(honeypot!=="")return {status:"error",message:unavailable};
 const requestHeaders=await headers();
 const client=requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()||requestHeaders.get("x-real-ip")||"local";
 if(isRateLimited(`payment:${client}`,10,10*60*1000))return {status:"error",message:"Too many payment attempts from this connection. Please wait a few minutes and try again."};
 const basket=priceBasket(lines);
 if(basket.unpriced.length>0)return {status:"error",message:`Some items are priced on request (${basket.unpriced.map(l=>l.label).join(", ")}). Choose “Arrange payment after quotation” for this order.`};
 const config=getPaymentConfig();
 if(config.kind==="unavailable"){console.error(`[payment] unavailable: ${config.reason}`);return {status:"error",message:unavailable};}
 const reference=newPaymentReference();
 const metadata:PaymentMetadata={customer:{name:customer.name,email:customer.email,phone:customer.phone,address:customer.address,city:customer.city,state:customer.state,notes:customer.notes},lines};
 let destination:string;
 if(config.kind==="test"){
  destination=`/checkout/pay/test?token=${encodeURIComponent(createTestToken(config.secret,{reference,amountKobo:basket.totalKobo,email:customer.email,metadata}))}`;
 }else{
  try{
   destination=await initializeTransaction(config,{email:customer.email,amountKobo:basket.totalKobo,reference,callbackUrl:`${siteOrigin(requestHeaders)}/api/payments/paystack/callback`,metadata});
  }catch(error){console.error(`[payment] initialize failed (${reference}): ${(error as Error).message}`);return {status:"error",message:unavailable};}
 }
 redirect(destination);
}

/** Public origin for provider callbacks: SITE_URL when set, otherwise the request's own host. */
function siteOrigin(requestHeaders:Headers){
 const configured=process.env.SITE_URL?.replace(/\/$/,"");
 if(configured)return configured;
 const host=requestHeaders.get("x-forwarded-host")??requestHeaders.get("host")??"localhost:3000";
 const proto=requestHeaders.get("x-forwarded-proto")??(host.startsWith("localhost")||host.startsWith("127.")?"http":"https");
 return `${proto}://${host}`;
}
