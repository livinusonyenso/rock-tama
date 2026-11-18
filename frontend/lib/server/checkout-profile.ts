import "server-only";
import {cookies} from "next/headers";
import {connection} from "next/server";
import {DEMO_COOKIE,parseDemoSession} from "@/lib/account/demo";
import {CHECKOUT_PROFILE_COOKIE,checkoutDetailsSchema,type CheckoutDetails} from "@/lib/checkout-details";
import {readPayload,signPayload} from "@/lib/server/payments/token";
import {paymentTokenSecret} from "@/lib/server/payments/order-session";
const TTL=8*60*60;
/** Temporary demo-session convenience. Not account authentication or a shared customer database. */
export async function checkoutIdentity(){
 await connection();const jar=await cookies();const session=parseDemoSession(jar.get(DEMO_COOKIE)?.value);
 if(!session)return null;
 const saved=readPayload<{owner:string;details:CheckoutDetails}>(paymentTokenSecret(),jar.get(CHECKOUT_PROFILE_COOKIE)?.value);
 const details=saved?.owner===session.email?checkoutDetailsSchema.safeParse(saved.details):null;
 return {email:session.email,details:details?.success?details.data:null};
}
export async function saveCheckoutProfile(details:CheckoutDetails){
 const jar=await cookies();const session=parseDemoSession(jar.get(DEMO_COOKIE)?.value);if(!session)return;
 jar.set(CHECKOUT_PROFILE_COOKIE,signPayload(paymentTokenSecret(),{owner:session.email,details},TTL*1000),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:TTL});
}
