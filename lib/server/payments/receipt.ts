import "server-only";
import {mkdir,writeFile} from "node:fs/promises";
import {dirname,join} from "node:path";
import {z} from "zod";
import type {DeliveryConfig} from "@/lib/server/env";
import type {DeliveryResult} from "@/lib/server/enquiries/deliver";
import type {VerifiedPayment} from "./complete";
import {naira} from "./order";
type Paid=Extract<VerifiedPayment,{status:"paid"}>;
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
/** Stable email payload: repeated callbacks/webhooks reuse the same provider idempotency key. */
export function paymentReceipt(payment:Paid){
 const {customer,orderRef}=payment.metadata;
 const subject=`${payment.test?"TEST — ":""}ROCK-TAMA payment receipt · ${payment.reference}`;
 const notice=payment.test?"TEST RECEIPT — no money was charged. This is not proof of payment.":"Payment confirmed. Thank you for your ROCK-TAMA order.";
 const text=[notice,`Hello ${customer.name},`,"",`Payment reference: ${payment.reference}`,...(orderRef?[`Order reference: ${orderRef}`]:[]),...(payment.paidAt?[`Payment date: ${payment.paidAt}`]:[]),...payment.basket.lines.map(l=>`${l.quantity} × ${l.label} (${l.detail}) — ${naira(l.lineKobo??0)}`),`Total ${payment.test?"simulated":"paid"}: ${naira(payment.amountKobo)}`,"Currency: NGN",...(payment.channel?[`Payment method: ${payment.channel}`]:[]),"",`Delivery address: ${customer.address}, ${customer.city}, ${customer.state}`,"Delivery fee is not included. Our team will confirm delivery arrangements separately.","Keep this email as your payment record.","ROCK-TAMA Natural Spring Water"].join("\n");
 const rows=payment.basket.lines.map(l=>`<tr><td style="padding:12px 0;border-bottom:1px solid #eadfcf">${escape(`${l.quantity} × ${l.label} (${l.detail})`)}</td><td style="padding:12px 0;border-bottom:1px solid #eadfcf;text-align:right;white-space:nowrap">${escape(naira(l.lineKobo??0))}</td></tr>`).join("");
 const html=`<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#faf5f0;color:#111814;font-family:Arial,sans-serif"><div style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #eadfcf;border-radius:12px;overflow:hidden"><div style="padding:28px;background:#0a3125;color:#f7f8f5"><p style="color:#e0ad5f;font-size:12px;letter-spacing:2px">ROCK-TAMA</p><h1 style="font-family:Georgia,serif;font-size:30px;margin:12px 0">${payment.test?"Test payment receipt":"Payment receipt"}</h1></div><div style="padding:28px"><p><strong>${escape(notice)}</strong></p><p>Hello ${escape(customer.name)},</p><p>Payment reference: <strong>${escape(payment.reference)}</strong>${orderRef?`<br>Order reference: ${escape(orderRef)}`:""}${payment.paidAt?`<br>Payment date: ${escape(payment.paidAt)}`:""}</p><table style="width:100%;border-collapse:collapse"><caption style="text-align:left;font-weight:bold;padding:16px 0">Your order</caption><thead><tr><th scope="col" style="text-align:left">Item</th><th scope="col" style="text-align:right">Amount (NGN)</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row" style="padding:18px 0;text-align:left">${payment.test?"Simulated total":"Total paid"}</th><td style="text-align:right;font-weight:bold">${escape(naira(payment.amountKobo))}</td></tr></tfoot></table><p><strong>Delivery address</strong><br>${escape(`${customer.address}, ${customer.city}, ${customer.state}`)}</p><p style="font-size:14px;line-height:1.6">Delivery fee is not included. Our team will confirm delivery arrangements separately.</p><p style="font-size:12px;color:#5e5b53">Keep this email as your payment record. ROCK-TAMA Natural Spring Water.</p></div></div></body></html>`;
 return {to:[customer.email],subject,text,html};
}
export async function deliverPaymentReceipt(payment:Paid,config:DeliveryConfig):Promise<DeliveryResult>{
 if(payment.status!=="paid")return {ok:false,reason:"Payment is not verified as paid."};
 if(!/^RT-PAY-\d{8}-[A-Z0-9]{8}$/.test(payment.reference)||!z.email().safeParse(payment.metadata.customer.email).success)return {ok:false,reason:"Invalid receipt reference or recipient."};
 const email=paymentReceipt(payment);
 if(config.kind==="unconfigured")return {ok:false,reason:"Receipt email delivery is not configured."};
 if(config.kind==="dev-file"){
  try{const folder=join(dirname(config.path),"payment-receipts");await mkdir(folder,{recursive:true});await writeFile(join(folder,`${payment.reference}.json`),JSON.stringify(email,null,2),{encoding:"utf8",flag:"wx"});return {ok:true}}catch(error){if((error as NodeJS.ErrnoException).code==="EEXIST")return {ok:true};return {ok:false,reason:"Could not save development receipt."}}
 }
 try{
  const response=await fetch(`${config.baseUrl}/emails`,{method:"POST",headers:{Authorization:`Bearer ${config.apiKey}`,"Content-Type":"application/json","Idempotency-Key":`payment-receipt/${payment.reference}`},body:JSON.stringify({from:config.from,...email}),signal:AbortSignal.timeout(10000),cache:"no-store"});
  return response.ok?{ok:true}:{ok:false,reason:`Receipt email provider responded ${response.status}.`};
 }catch{return {ok:false,reason:"Receipt email provider is unreachable."}}
}
