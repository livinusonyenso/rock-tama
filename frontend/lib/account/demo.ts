/** Demo access never grants distributor approval or access to real customer/order data. */
import {demoAuthEnabled} from "@/lib/demo-auth";
export const DEMO_COOKIE="rocktama-distributor-demo";
/** Fail-closed demo switch shared with the admin demo login (D-133). */
export function demoLoginEnabled(){return demoAuthEnabled();}
export function parseDemoSession(raw:string|undefined):{email:string}|null{
 if(!demoLoginEnabled()||!raw)return null;
 try{const value=JSON.parse(raw);return value.mode==="demo"&&typeof value.email==="string"&&value.email.trim().length>0&&value.email.length<=254?{email:value.email}:null}catch{return null}
}
