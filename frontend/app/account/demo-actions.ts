"use server";
import {CHECKOUT_PROFILE_COOKIE} from "@/lib/checkout-details";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {DEMO_COOKIE,demoLoginEnabled} from "@/lib/account/demo";
/** Only the display email reaches this action. Demo passwords are never sent or stored. */
export async function startDemoSession(email:string):Promise<{ok:boolean;message?:string}>{
 if(!demoLoginEnabled())return {ok:false,message:"Demo login is unavailable on the live site."};
 if(typeof email!=="string"||!email.trim()||email.length>254)return {ok:false,message:"Enter an email to preview the dashboard."};
 (await cookies()).delete(CHECKOUT_PROFILE_COOKIE);
 (await cookies()).set(DEMO_COOKIE,JSON.stringify({mode:"demo",email:email.trim()}),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:8*60*60});
 return {ok:true};
}
export async function endDemoSession(){const jar=await cookies();jar.delete(DEMO_COOKIE);jar.delete(CHECKOUT_PROFILE_COOKIE);redirect("/account/login")}
