"use client";
import Link from "next/link";
import {useState,useTransition,useSyncExternalStore} from "react";
import {useRouter} from "next/navigation";
import {startDemoSession} from "@/app/account/demo-actions";
const subscribe=()=>()=>{};
const inputClass="mt-2 block min-h-12 w-full rounded-button border border-line-card bg-ivory-50 px-4 py-3 text-base font-normal focus-ring aria-[invalid=true]:border-error";
/** UI only: Node.js/Express integration will supply submission and session handling later. */
export function DistributorAuthForm({mode,demoEnabled=false}:{mode:"login"|"register";demoEnabled?:boolean}){
 const register=mode==="register";
 const enhanced=useSyncExternalStore(subscribe,()=>true,()=>false);
 const router=useRouter();const [pending,startTransition]=useTransition();const [error,setError]=useState("");
 const demo=!register&&demoEnabled;
 const [shown,setShown]=useState(false);const [values,setValues]=useState<Record<string,string>>({});
 const field=(name:string,label:string,autoComplete:string,type="text")=><label className="block text-sm font-semibold" htmlFor={`auth-${name}`}>{label}<input id={`auth-${name}`} name={name} value={values[name]??""} onChange={e=>setValues(v=>({...v,[name]:e.target.value}))} type={type} autoComplete={autoComplete} required maxLength={name==="password"||name==="confirmPassword"?128:name==="email"?254:150} className={inputClass}/></label>;
 return <><nav aria-label="Distributor account" className="mb-7 grid grid-cols-2 border-b border-line-card text-center text-sm font-semibold"><Link href="/account/login" aria-current={!register?"page":undefined} className={`focus-ring border-b-2 px-3 py-4 ${!register?"border-gold-700 text-forest-850":"border-transparent text-ink-500"}`}>Log in</Link><Link href="/account/register" aria-current={register?"page":undefined} className={`focus-ring border-b-2 px-3 py-4 ${register?"border-gold-700 text-forest-850":"border-transparent text-ink-500"}`}>Register</Link></nav>
 <p id="account-availability" className="mb-6 rounded-button border border-line-card bg-cream-200 p-4 text-sm leading-relaxed">{demo?"Demo access: use any email and any non-empty password to explore the dashboard. No real account is created; use a made-up password.":"Distributor registration will open soon."} For help, <Link href="/contact" className="text-gold-700 underline">contact our team</Link> or <Link href="/wholesale#enquiry" className="text-gold-700 underline">send a distributor enquiry</Link>.</p>
 <form onSubmit={event=>{event.preventDefault();if(!demo||!values.email?.trim()||!values.password)return;setError("");startTransition(async()=>{try{const result=await startDemoSession(values.email);if(result.ok){setValues(v=>({...v,password:""}));router.push("/account/dashboard")}else setError(result.message??"Unable to open the demo.")}catch{setError("Unable to open the demo. Please try again.")}})}} className="grid gap-5" aria-label={register?"Distributor registration":"Distributor login"}>
 {register&&<>{field("name","Full name","name")}{field("company","Business name","organization")}<div className="grid gap-5 sm:grid-cols-2">{field("phone","Phone number","tel","tel")}{field("location","City and state","address-level2")}</div></>}
 {field("email","Email address","email","email")}
 <div>{field("password","Password",register?"new-password":"current-password",shown?"text":"password")}<div className="mt-2 flex items-center justify-between gap-3"><span id="password-hint" className="text-xs text-ink-500">{register?"Choose a strong, unique password.":demo?"Any made-up password works for this demo.":"Use your distributor account password."}</span><button type="button" aria-pressed={shown} onClick={()=>setShown(v=>!v)} className="min-h-11 shrink-0 px-2 text-sm text-gold-700 underline focus-ring">{shown?"Hide":"Show"} password</button></div></div>
 {register&&<>{field("confirmPassword","Confirm password","new-password",shown?"text":"password")}<label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" name="consent" value="yes" required className="mt-1 size-4 shrink-0 accent-forest-850 focus-ring" /><span>I agree that ROCK-TAMA may use these details to manage my distributor account and contact me about my application.</span></label></>}
 {error&&<p role="alert" className="text-sm text-error">{error}</p>}
 <button disabled={!demo||!enhanced||pending} type="submit" aria-describedby="account-availability" className="min-h-13 rounded-button bg-forest-850 px-6 py-3 font-semibold text-on-dark disabled:cursor-not-allowed disabled:opacity-70 focus-ring">{pending?"Opening dashboard…":register?"Create distributor account":demo?"Log in to demo":"Log in"}</button>
 {demo&&<noscript><p>JavaScript is needed to open this demo dashboard. No real account will be created.</p></noscript>}
 </form>
 {register&&<p className="mt-3 text-xs leading-relaxed text-ink-500">Registration is subject to business review and does not approve distributor access.</p>}
 <p className="mt-6 text-center text-sm text-ink-700">{register?"Already registered? ":"New distributor? "}<Link href={register?"/account/login":"/account/register"} className="text-gold-700 underline focus-ring">{register?"Log in":"Create an account"}</Link></p>
 {!register&&<p className="mt-4 text-center text-sm"><Link href="/contact" className="text-gold-700 underline focus-ring">Need help accessing your account?</Link></p>}
 </>;
}
