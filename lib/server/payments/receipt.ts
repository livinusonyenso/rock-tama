import "server-only";
import {mkdir,writeFile} from "node:fs/promises";
import {dirname,join} from "node:path";
import {z} from "zod";
import type {DeliveryConfig} from "@/lib/server/env";
import type {DeliveryResult} from "@/lib/server/enquiries/deliver";
import type {VerifiedPayment} from "./complete";
import {paymentReceipt} from "./receipt-content";
import {receiptPdf} from "./receipt-pdf";
export {paymentReceipt} from "./receipt-content";
type Paid=Extract<VerifiedPayment,{status:"paid"}>;
export async function deliverPaymentReceipt(payment:Paid,config:DeliveryConfig):Promise<DeliveryResult>{
 if(payment.status!=="paid")return {ok:false,reason:"Payment is not verified as paid."};
 if(!/^RT-PAY-\d{8}-[A-Z0-9]{8}$/.test(payment.reference)||!z.email().safeParse(payment.metadata.customer.email).success)return {ok:false,reason:"Invalid receipt reference or recipient."};
 const email={...paymentReceipt(payment),attachments:[{filename:`ROCK-TAMA-${payment.reference}.pdf`,content:receiptPdf(payment).toString("base64")}]};
 if(config.kind==="unconfigured")return {ok:false,reason:"Receipt email delivery is not configured."};
 if(config.kind==="dev-file"){
  try{const folder=join(dirname(config.path),"payment-receipts");await mkdir(folder,{recursive:true});await writeFile(join(folder,`${payment.reference}.json`),JSON.stringify(email,null,2),{encoding:"utf8",flag:"wx"});return {ok:true}}catch(error){if((error as NodeJS.ErrnoException).code==="EEXIST")return {ok:true};return {ok:false,reason:"Could not save development receipt."}}
 }
 try{
  const response=await fetch(`${config.baseUrl}/emails`,{method:"POST",headers:{Authorization:`Bearer ${config.apiKey}`,"Content-Type":"application/json","Idempotency-Key":`payment-receipt/${payment.reference}`},body:JSON.stringify({from:config.from,...email}),signal:AbortSignal.timeout(10000),cache:"no-store"});
  return response.ok?{ok:true}:{ok:false,reason:`Receipt email provider responded ${response.status}.`};
 }catch{return {ok:false,reason:"Receipt email provider is unreachable."}}
}
