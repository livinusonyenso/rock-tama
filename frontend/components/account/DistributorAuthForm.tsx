"use client";
import Link from "next/link";
import {useState,useTransition,useSyncExternalStore,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {startDemoSession} from "@/app/account/demo-actions";
const subscribe=()=>()=>{};
const inputClass="mt-2 block min-h-12 w-full rounded-button border border-line-card bg-ivory-50 px-4 py-3 text-base font-normal focus-ring aria-[invalid=true]:border-error";
const secondaryClass="min-h-12 rounded-button border border-forest-850 px-6 py-3 font-semibold text-forest-850 disabled:cursor-not-allowed disabled:opacity-70 focus-ring";
// Same phone rule as checkout and the API (lib/checkout-details.ts, backend validation.mjs).
const phonePattern=/^\+?[0-9\s()-]{7,20}$/;
const unavailable="Account services are unavailable right now. Please try again shortly.";

/** Messages for the Express API's error codes (via the same-origin gateway, D-134). Never echoes input. */
function errorMessage(status:number,retryAfter:string|null,register:boolean){
 if(status===429){const minutes=Math.max(1,Math.ceil(Number(retryAfter??"60")/60));return `Too many attempts. Please try again in ${minutes} minute${minutes===1?"":"s"}.`;}
 if(status===401)return "Email or password is incorrect.";
 if(status===400)return register?"Please check your details: a valid email, phone number, city and state, and a 15–128 character password.":"Enter a valid email and your password.";
 if(status===403)return "This page could not be verified. Reload it and try again.";
 return unavailable;
}

/**
 * Distributor login and registration (D-127, D-134). Both post JSON to /api/v1/auth/* on this site; Next.js
 * forwards to Express, which sets the HttpOnly session cookie. No token is ever readable by this script.
 * The demo dashboard (development and staging only) is a separate, clearly labelled button.
 */
export function DistributorAuthForm({mode,demoEnabled=false}:{mode:"login"|"register";demoEnabled?:boolean}){
 const register=mode==="register";
 const enhanced=useSyncExternalStore(subscribe,()=>true,()=>false);
 const router=useRouter();const [pending,startTransition]=useTransition();const [error,setError]=useState("");
 const [received,setReceived]=useState(false);
 const demo=!register&&demoEnabled;
 const [shown,setShown]=useState(false);const [values,setValues]=useState<Record<string,string>>({});
 const field=(name:string,label:string,autoComplete:string,type="text")=><label className="block text-sm font-semibold" htmlFor={`auth-${name}`}>{label}<input id={`auth-${name}`} name={name} value={values[name]??""} onChange={e=>setValues(v=>({...v,[name]:e.target.value}))} type={type} autoComplete={autoComplete} required maxLength={name==="password"||name==="confirmPassword"?128:name==="email"?254:name==="location"?80:150} className={inputClass}/></label>;
 const clearPasswords=()=>setValues(v=>({...v,password:"",confirmPassword:""}));

 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");
  const form=new FormData(event.currentTarget);
  const email=values.email?.trim()??"",password=values.password??"";
  if(register){
   const length=[...password].length;
   if(length<15||length>128)return setError("Choose a password of 15 to 128 characters.");
   if(password!==values.confirmPassword)return setError("The passwords do not match.");
   if(!phonePattern.test(values.phone?.trim()??""))return setError("Enter a valid phone number with country code.");
   if(form.get("consent")!=="yes")return setError("Please agree to how we use your details.");
  }
  const payload=register?{email,password,name:values.name?.trim(),company:values.company?.trim(),phone:values.phone?.trim(),location:values.location?.trim(),consent:true}:{email,password};
  startTransition(async()=>{
   try{
    const response=await fetch(`/api/v1/auth/${register?"register":"login"}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload),cache:"no-store"});
    if(register&&response.status===202){clearPasswords();setReceived(true);return;}
    if(!register&&response.status===200){clearPasswords();router.replace("/account/dashboard");router.refresh();return;}
    setError(errorMessage(response.status,response.headers.get("Retry-After"),register));
   }catch{setError(unavailable)}
  });
 }

 function openDemo(){
  const email=values.email?.trim();
  if(!email)return setError("Enter an email to preview the demo dashboard.");
  setError("");
  startTransition(async()=>{try{const result=await startDemoSession(email);if(result.ok){clearPasswords();router.push("/account/dashboard")}else setError(result.message??"Unable to open the demo.")}catch{setError("Unable to open the demo. Please try again.")}});
 }

 if(received)return <div data-registration-received role="status" className="rounded-button border border-line-card bg-cream-200 p-5 leading-relaxed"><h2 className="font-serif text-2xl font-bold text-forest-heading">Application received</h2><p className="mt-3 text-sm text-ink-700">Thank you. If this email can be registered, your distributor application is now with our team for review. Log in with your email and password to follow its status; distributor features open only after approval.</p><p className="mt-3 text-sm text-ink-700">Already have an account? Log in with your existing password.</p><Link href="/account/login" className="mt-5 inline-flex min-h-12 items-center rounded-button bg-forest-850 px-6 py-3 font-semibold text-on-dark focus-ring">Go to log in</Link></div>;

 return <><nav aria-label="Distributor account" className="mb-7 grid grid-cols-2 border-b border-line-card text-center text-sm font-semibold"><Link href="/account/login" aria-current={!register?"page":undefined} className={`focus-ring border-b-2 px-3 py-4 ${!register?"border-gold-700 text-forest-850":"border-transparent text-ink-500"}`}>Log in</Link><Link href="/account/register" aria-current={register?"page":undefined} className={`focus-ring border-b-2 px-3 py-4 ${register?"border-gold-700 text-forest-850":"border-transparent text-ink-500"}`}>Register</Link></nav>
 <p id="account-availability" className="mb-6 rounded-button border border-line-card bg-cream-200 p-4 text-sm leading-relaxed">{register?"New applications are reviewed by our team before distributor access is granted.":"Log in with the email and password you registered with. New accounts stay pending until our team approves them."}{demo&&" Demo access (development and staging only): enter any email and choose “Open demo dashboard”; no real account is used."} For help, <Link href="/contact" className="text-gold-700 underline">contact our team</Link> or <Link href="/wholesale#enquiry" className="text-gold-700 underline">send a distributor enquiry</Link>.</p>
 <form method="post" onSubmit={submit} className="grid gap-5" aria-label={register?"Distributor registration":"Distributor login"}>
 {register&&<>{field("name","Full name","name")}{field("company","Business name","organization")}<div className="grid gap-5 sm:grid-cols-2">{field("phone","Phone number","tel","tel")}{field("location","City and state","address-level2")}</div></>}
 {field("email","Email address","email","email")}
 <div>{field("password","Password",register?"new-password":"current-password",shown?"text":"password")}<div className="mt-2 flex items-center justify-between gap-3"><span id="password-hint" className="text-xs text-ink-500">{register?"Use 15 to 128 characters; a passphrase works well.":"Use your distributor account password."}</span><button type="button" aria-pressed={shown} onClick={()=>setShown(v=>!v)} className="min-h-11 shrink-0 px-2 text-sm text-gold-700 underline focus-ring">{shown?"Hide":"Show"} password</button></div></div>
 {register&&<>{field("confirmPassword","Confirm password","new-password",shown?"text":"password")}<label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" name="consent" value="yes" required className="mt-1 size-4 shrink-0 accent-forest-850 focus-ring" /><span>I agree that ROCK-TAMA may use these details to manage my distributor account and contact me about my application.</span></label></>}
 {error&&<p role="alert" className="text-sm text-error">{error}</p>}
 <button disabled={!enhanced||pending} type="submit" aria-describedby="account-availability" className="min-h-13 rounded-button bg-forest-850 px-6 py-3 font-semibold text-on-dark disabled:cursor-not-allowed disabled:opacity-70 focus-ring">{pending?(register?"Sending application…":"Logging in…"):register?"Create distributor account":"Log in"}</button>
 {demo&&<button type="button" data-demo-login disabled={!enhanced||pending} onClick={openDemo} className={secondaryClass}>Open demo dashboard</button>}
 <noscript><p className="text-sm">JavaScript is needed to sign in or register.</p></noscript>
 </form>
 {register&&<p className="mt-3 text-xs leading-relaxed text-ink-500">Registration is subject to business review and does not approve distributor access.</p>}
 <p className="mt-6 text-center text-sm text-ink-700">{register?"Already registered? ":"New distributor? "}<Link href={register?"/account/login":"/account/register"} className="text-gold-700 underline focus-ring">{register?"Log in":"Create an account"}</Link></p>
 {!register&&<p className="mt-4 text-center text-sm"><Link href="/contact" className="text-gold-700 underline focus-ring">Need help accessing your account?</Link></p>}
 </>;
}
