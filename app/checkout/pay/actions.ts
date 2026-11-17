"use server";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {z} from "zod";
import {variantById} from "@/content/commerce";
import {payment} from "@/content/payment";
import {deliverEnquiry,type Attachment} from "@/lib/server/enquiries/deliver";
import {getDeliveryConfig} from "@/lib/server/env";
import {MIXED_PRODUCTS} from "@/lib/enquiry";
import {getPaymentConfig} from "@/lib/server/payments/config";
import {naira,newPaymentReference,priceBasket} from "@/lib/server/payments/order";
import {clearPendingOrder,readPendingOrder} from "@/lib/server/payments/order-session";
import {initializeTransaction} from "@/lib/server/payments/paystack";
import {createTestToken} from "@/lib/server/payments/test-gateway";
import {isRateLimited} from "@/lib/server/rate-limit";

export type PayState={status:"idle"|"error";message?:string;field?:"transactionId"|"receipt"};
const EXPIRED="Your checkout session has expired. Please return to checkout and continue again.";

async function clientKey(){const h=await headers();return h.get("x-forwarded-for")?.split(",")[0]?.trim()||h.get("x-real-ip")||"local";}

/**
 * Card payment (D-122/D-124): re-price the pending order and hand over to Paystack's hosted page
 * (or the test gateway). A fresh payment reference per attempt (Paystack rejects re-used references).
 */
export async function payWithCard():Promise<PayState>{
 const unavailable="Card payment isn't available right now. Please try again shortly, pay by bank transfer, or contact us.";
 const order=await readPendingOrder();
 if(!order)return {status:"error",message:EXPIRED};
 if(isRateLimited(`payment:${await clientKey()}`,10,10*60*1000))return {status:"error",message:"Too many payment attempts from this connection. Please wait a few minutes and try again."};
 const basket=priceBasket(order.lines);
 if(basket.unpriced.length>0||basket.totalKobo<=0)return {status:"error",message:"Some items in your basket are no longer sold online. Please review your basket."};
 const config=getPaymentConfig();
 if(config.kind==="unavailable"){console.error(`[payment] unavailable: ${config.reason}`);return {status:"error",message:unavailable};}
 const reference=newPaymentReference();
 const metadata={customer:order.customer,lines:order.lines,orderRef:order.orderRef};
 let destination:string;
 if(config.kind==="test"){
  destination=`/checkout/pay/test?token=${encodeURIComponent(createTestToken(config.secret,{reference,amountKobo:basket.totalKobo,email:order.customer.email,metadata}))}`;
 }else{
  try{destination=await initializeTransaction(config,{email:order.customer.email,amountKobo:basket.totalKobo,reference,callbackUrl:`${siteOrigin(await headers())}/api/payments/paystack/callback`,metadata,channels:["card"]});}
  catch(error){console.error(`[payment] initialize failed (${reference}): ${(error as Error).message}`);return {status:"error",message:unavailable};}
 }
 redirect(destination);
}

const transactionIdSchema=z.string().trim().max(60,"Use 60 characters or fewer.").regex(/^[A-Za-z0-9 ._/-]*$/,"Use letters, numbers, spaces, dots, dashes or slashes.");
const SIGNATURES:{ext:string;type:string;test:(b:Buffer)=>boolean}[]=[
 {ext:"png",type:"image/png",test:b=>b.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))},
 {ext:"jpg",type:"image/jpeg",test:b=>b[0]===0xff&&b[1]===0xd8&&b[2]===0xff},
 {ext:"webp",type:"image/webp",test:b=>b.subarray(0,4).toString("latin1")==="RIFF"&&b.subarray(8,12).toString("latin1")==="WEBP"},
 {ext:"pdf",type:"application/pdf",test:b=>b.subarray(0,5).toString("latin1")==="%PDF-"},
];

/**
 * Bank transfer (D-124): the customer has transferred and sends a transaction ID and/or a receipt. This is a
 * *claim*, not a confirmed payment: the notification says to verify in the bank before fulfilling, and the
 * customer is told it awaits confirmation. Receipts are checked by content (magic bytes), not by file name.
 */
export async function submitTransfer(_previous:PayState,form:FormData):Promise<PayState>{
 const order=await readPendingOrder();
 if(!order)return {status:"error",message:EXPIRED};
 if(isRateLimited(`transfer:${await clientKey()}`,5,10*60*1000))return {status:"error",message:"Too many submissions from this connection. Please wait a few minutes and try again."};
 const id=transactionIdSchema.safeParse(String(form.get("transactionId")??""));
 if(!id.success)return {status:"error",field:"transactionId",message:id.error.issues[0].message};
 const file=form.get("receipt");
 let attachment:Attachment|null=null;
 if(file instanceof File&&file.size>0){
  if(file.size>payment.receipt.maxBytes)return {status:"error",field:"receipt",message:"The receipt is larger than 4 MB. Please upload a smaller image or PDF."};
  const content=Buffer.from(await file.arrayBuffer());
  const kind=SIGNATURES.find(s=>s.test(content));
  if(!kind)return {status:"error",field:"receipt",message:"Upload the receipt as a PNG, JPG, WEBP image or a PDF."};
  attachment={filename:`receipt-${order.orderRef}.${kind.ext}`,contentType:kind.type,content};
 }
 if(!id.data&&!attachment)return {status:"error",field:"transactionId",message:"Enter the transaction ID or upload your receipt (at least one)."};
 const basket=priceBasket(order.lines);
 if(basket.unpriced.length>0)return {status:"error",message:"Some items in your basket are no longer sold online. Please review your basket."};
 const c=order.customer;
 const result=await deliverEnquiry({
  reference:order.orderRef,receivedAt:new Date().toISOString(),name:c.name,email:c.email,phone:c.phone,
  product:basket.lines.length===1?(variantById(basket.lines[0].variantId)?.product??MIXED_PRODUCTS):MIXED_PRODUCTS,
  quantity:basket.lines.reduce((n,l)=>n+l.quantity,0),unit:"bottles",location:`${c.address}, ${c.city}, ${c.state}`,consent:"yes",
  message:[
   payment.transfer.placeholder?"TEST TRANSFER (demo bank details) — no real money expected. Do not fulfil.":"BANK TRANSFER CLAIMED — verify the credit in the bank account before fulfilling.",
   `Amount due: ${naira(basket.totalKobo)}`,
   `Transaction ID: ${id.data||"(not given)"}`,
   `Receipt: ${attachment?`attached (${attachment.filename})`:"(not uploaded)"}`,
   ...basket.lines.map(l=>`${l.quantity} × ${l.label} (${l.detail}) — ${naira(l.lineKobo??0)}`),
   "Delivery fee not included: arrange with the customer.",
   c.notes?`Delivery notes: ${c.notes}`:"",
  ].filter(Boolean).join("\n"),
 },getDeliveryConfig(),attachment?[attachment]:[]);
 if(!result.ok){console.error(`[transfer] notification failed (${order.orderRef}): ${result.reason}`);return {status:"error",message:"We couldn’t submit your transfer details right now. Please try again in a few minutes or contact us."};}
 await clearPendingOrder();
 redirect(`/checkout/transfer?reference=${encodeURIComponent(order.orderRef)}`);
}

/** Public origin for provider callbacks: SITE_URL when set, otherwise the request's own host. */
function siteOrigin(requestHeaders:Headers){
 const configured=process.env.SITE_URL?.replace(/\/$/,"");
 if(configured)return configured;
 const host=requestHeaders.get("x-forwarded-host")??requestHeaders.get("host")??"localhost:3000";
 const proto=requestHeaders.get("x-forwarded-proto")??(host.startsWith("localhost")||host.startsWith("127.")?"http":"https");
 return `${proto}://${host}`;
}
