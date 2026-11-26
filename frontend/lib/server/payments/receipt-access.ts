import "server-only";
import {cookies} from "next/headers";
import {connection} from "next/server";
import {signPayload,readPayload} from "./token";
import {paymentTokenSecret} from "./order-session";
const COOKIE="rt_receipt_access";
export async function allowReceiptDownload(reference:string){
 (await cookies()).set(COOKIE,signPayload(paymentTokenSecret(),{reference},60*60*1000),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60});
}
export async function canDownloadReceipt(reference:string){
 await connection();const proof=readPayload<{reference:string}>(paymentTokenSecret(),(await cookies()).get(COOKIE)?.value);
 return !!proof&&proof.reference===reference;
}
