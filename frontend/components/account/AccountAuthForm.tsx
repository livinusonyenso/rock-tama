"use client";
import Link from "next/link";
import {useEffect,useRef,useState,useTransition,useSyncExternalStore,type FormEvent,type ReactNode} from "react";
import {useRouter} from "next/navigation";
import {startDemoSession} from "@/app/account/demo-actions";
import {accountCopy,availabilities,businessTypes,idTypes,monthlyVolumes,nigerianStates,vehicleTypes,type AccountRole,type AccountType} from "@/content/accounts";
import {dashboardPath} from "@/lib/account/roles";
const subscribe=()=>()=>{};
const inputClass="mt-2 block min-h-12 w-full rounded-button border border-line-card bg-ivory-50 px-4 py-3 text-base font-normal focus-ring aria-[invalid=true]:border-error";
const secondaryClass="min-h-12 rounded-button border border-forest-850 px-6 py-3 font-semibold text-forest-850 disabled:cursor-not-allowed disabled:opacity-70 focus-ring";
// Same phone rule as checkout and the API (lib/checkout-details.ts, backend validation.mjs).
const phonePattern=/^\+?[0-9\s()-]{7,20}$/;
const unavailable="Account services are unavailable right now. Please try again shortly.";
const roles:readonly AccountRole[]=["customer","driver","distributor","admin"];
// Tailwind `max-md`: below this width registration shows one section (step) at a time.
const phoneQuery="(width < 48rem)";
type StepKey="about"|"business"|"identification"|"address"|"vehicle"|"supply"|"signin";
const stepCopy=accountCopy.register.steps;

/** Messages for the Express API's error codes (via the same-origin gateway, D-134). Never echoes input. */
function errorMessage(status:number,retryAfter:string|null,register:boolean){
 if(status===429){const minutes=Math.max(1,Math.ceil(Number(retryAfter??"60")/60));return `Too many attempts. Please try again in ${minutes} minute${minutes===1?"":"s"}.`;}
 if(status===401)return "Email or password is incorrect.";
 if(status===400)return register?"Please check your details: a valid email, phone number, city and state, and a 15–128 character password.":"Enter a valid email and your password.";
 if(status===403)return "This page could not be verified. Reload it and try again.";
 return unavailable;
}

/**
 * Login and registration for customers, drivers and distributors (D-127, D-134, D-137). Both post JSON to
 * /api/v1/auth/* on this site; Next.js forwards to Express, which sets the HttpOnly session cookie. No token is
 * ever readable by this script. After login each role goes to its own dashboard. Admin accounts are never
 * offered here: the API and the database refuse them. The demo dashboard (development and staging only) is a
 * separate, clearly labelled button.
 */
export function AccountAuthForm({mode,accountType="customer",demoEnabled=false,typePicker}:{mode:"login"|"register";accountType?:AccountType;demoEnabled?:boolean;/** Server-rendered account type choice, shown under the tabs. */typePicker?:ReactNode}){
 const register=mode==="register";
 const copy=accountCopy.types[accountType];
 const enhanced=useSyncExternalStore(subscribe,()=>true,()=>false);
 const router=useRouter();const [pending,startTransition]=useTransition();const [error,setError]=useState("");
 const [received,setReceived]=useState(false);
 const demo=!register&&demoEnabled;
 const [shown,setShown]=useState(false);const [values,setValues]=useState<Record<string,string>>({});
 const set=(name:string)=>(event:{target:{value:string}})=>setValues(v=>({...v,[name]:event.target.value}));
 const field=(name:string,label:string,autoComplete:string,{type="text",max=150,hint,inputMode,required=true}:{type?:string;max?:number;hint?:string;inputMode?:"numeric"|"text";required?:boolean}={})=><label className="block text-sm font-semibold" htmlFor={`auth-${name}`}>{label}{!required&&<span className="font-normal text-ink-500"> (optional)</span>}<input id={`auth-${name}`} name={name} value={values[name]??""} onChange={set(name)} type={type} autoComplete={autoComplete} inputMode={inputMode} required={required} maxLength={max} aria-describedby={hint?`auth-${name}-hint`:undefined} className={inputClass}/>{hint&&<span id={`auth-${name}-hint`} className="mt-1.5 block text-xs font-normal text-ink-500">{hint}</span>}</label>;
 const select=(name:string,label:string,options:readonly {value:string;label:string}[],placeholder:string)=><label className="block text-sm font-semibold" htmlFor={`auth-${name}`}>{label}<select id={`auth-${name}`} name={name} required value={values[name]??""} onChange={set(name)} className={inputClass}><option value="" disabled>{placeholder}</option>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
 const yesNo=(name:string,label:string)=><fieldset><legend className="text-sm font-semibold">{label}</legend><div className="mt-2 flex gap-6">{(["yes","no"] as const).map(answer=><label key={answer} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" id={`auth-${name}-${answer}`} name={name} value={answer} required checked={values[name]===answer} onChange={set(name)} className="size-4 accent-forest-850 focus-ring"/>{answer==="yes"?"Yes":"No"}</label>)}</div></fieldset>;
 const [step,setStep]=useState(0);
 const formRef=useRef<HTMLFormElement>(null);const stepHeading=useRef<HTMLParagraphElement>(null);const moved=useRef(false);
 // After Next/Back, move focus and the view to the new step's heading so every user knows where they are.
 useEffect(()=>{if(!moved.current)return;stepHeading.current?.focus({preventScroll:true});stepHeading.current?.scrollIntoView({block:"start"});},[step]);
 const goTo=(index:number)=>{moved.current=true;setStep(index);};
 const section=(index:number,legend:string,children:ReactNode)=><fieldset key={legend} data-step={index} className={`grid gap-5 border-t border-line-card pt-5 first-of-type:border-t-0 first-of-type:pt-0 max-md:border-t-0 max-md:pt-0 ${index===step?"":"max-md:hidden"}`}><legend className="float-left mb-1 w-full font-serif text-xl font-bold text-forest-heading">{legend}</legend>{children}</fieldset>;
 const clearPasswords=()=>setValues(v=>({...v,password:"",confirmPassword:""}));
 const text=(name:string)=>values[name]?.trim()??"";
 const states=nigerianStates.map(state=>({value:state,label:state}));
 const licence=values.idType==="drivers_licence";

 /** Exactly the fields this account type sends (D-138); the API rejects anything else. */
 function registration(){
  const shared={accountType,email:text("email"),password:values.password??"",name:text("name"),phone:text("phone"),street:text("street"),city:text("city"),state:values.state??"",consent:true};
  if(accountType==="driver")return {...shared,dateOfBirth:values.dateOfBirth??"",idType:values.idType??"",idNumber:text("idNumber"),licenceExpiry:licence?values.licenceExpiry??"":"",vehicleType:values.vehicleType??"",plateNumber:text("plateNumber"),operatingArea:text("operatingArea"),availability:values.availability??""};
  if(accountType==="distributor")return {...shared,position:text("position"),company:text("company"),businessType:values.businessType??"",cacNumber:text("cacNumber"),supplyAreas:text("supplyAreas"),monthlyVolume:values.monthlyVolume??"",hasStorage:values.hasStorage==="yes",hasVehicle:values.hasVehicle==="yes"};
  return shared;
 }

 /** Friendly checks for one section, before moving on or sending; the API repeats every one of them. */
 function stepProblem(key:StepKey){
  const code=(name:string)=>text(name).toUpperCase().replace(/[\s-]/g,"");
  const now=new Date();
  if(key==="about"){
   if(!phonePattern.test(text("phone")))return "Enter a valid phone number with country code.";
   if(accountType==="driver"){
    const birth=new Date(`${values.dateOfBirth}T00:00:00Z`);
    const age=now.getUTCFullYear()-birth.getUTCFullYear()-(now.getUTCMonth()<birth.getUTCMonth()||(now.getUTCMonth()===birth.getUTCMonth()&&now.getUTCDate()<birth.getUTCDate())?1:0);
    if(!values.dateOfBirth||Number.isNaN(age)||age<18||age>80)return "Drivers must be between 18 and 80 years old.";
   }
  }
  if(key==="identification"){
   if(values.idType==="nin"&&!/^[0-9]{11}$/.test(code("idNumber")))return "Your NIN has 11 digits.";
   if(licence&&!/^[A-Z0-9]{8,15}$/.test(code("idNumber")))return "Enter your licence number as printed on the card (8 to 15 letters and numbers).";
   if(licence&&(!values.licenceExpiry||values.licenceExpiry<now.toISOString().slice(0,10)))return "Your driver’s licence must not be expired.";
  }
  if(key==="vehicle"&&!/^[A-Z0-9]{5,10}$/.test(code("plateNumber")))return "Enter your vehicle’s plate number, for example ABC-123DE.";
  if(key==="business"&&text("cacNumber")&&!/^(RC|BN|IT)[0-9]{4,8}$/.test(code("cacNumber")))return "A CAC number starts with RC, BN or IT followed by digits, for example RC123456. Leave it empty if you are not registered.";
  if(key==="signin"){
   const length=[...(values.password??"")].length;
   if(length<15||length>128)return "Choose a password of 15 to 128 characters.";
   if(values.password!==values.confirmPassword)return "The passwords do not match.";
  }
  return "";
 }

 /** Phone step-by-step: check this step's fields (browser rules, then ours) before showing the next one. */
 function next(){
  const fieldset=formRef.current?.querySelector<HTMLFieldSetElement>(`[data-step="${step}"]`);
  const invalid=fieldset?[...fieldset.elements].find(element=>element instanceof HTMLInputElement||element instanceof HTMLSelectElement?!element.checkValidity():false) as HTMLInputElement|HTMLSelectElement|undefined:undefined;
  if(invalid){setError("");invalid.reportValidity();return;}
  const problem=stepProblem(steps[step].key);if(problem)return setError(problem);
  setError("");goTo(step+1);
 }

 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");
  const form=new FormData(event.currentTarget);
  const password=values.password??"";
  if(register){
   const stepped=window.matchMedia(phoneQuery).matches;
   // Enter in a field on an earlier phone step means "Next", not "send".
   if(stepped&&step<steps.length-1)return next();
   for(const [index,{key}] of steps.entries()){const problem=stepProblem(key);if(problem){if(stepped&&index!==step)goTo(index);return setError(problem);}}
   if(form.get("consent")!=="yes")return setError("Please agree to how we use your details.");
  }
  const payload=register?registration():{email:values.email?.trim()??"",password};
  startTransition(async()=>{
   try{
    const response=await fetch(`/api/v1/auth/${register?"register":"login"}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload),cache:"no-store"});
    if(register&&response.status===202){clearPasswords();setReceived(true);return;}
    if(!register&&response.status===200){
     clearPasswords();
     const role=((await response.json().catch(()=>null)) as {user?:{role?:AccountRole}}|null)?.user?.role;
     // The server re-checks the role on every dashboard; this only picks the first page to open.
     router.replace(dashboardPath(role&&roles.includes(role)?role:"customer"));router.refresh();return;
    }
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

 const passwordFields=<><div>{field("password","Password",register?"new-password":"current-password",{type:shown?"text":"password",max:128})}<div className="mt-2 flex items-center justify-between gap-3"><span id="password-hint" className="text-xs text-ink-500">{register?"Use 15 to 128 characters; a passphrase works well.":"Use your account password."}</span><button type="button" aria-pressed={shown} onClick={()=>setShown(v=>!v)} className="min-h-11 shrink-0 px-2 text-sm text-gold-700 underline focus-ring">{shown?"Hide":"Show"} password</button></div></div>
  {register&&field("confirmPassword","Confirm password","new-password",{type:shown?"text":"password",max:128})}</>;

 /** Registration sections for this account type, in order. Phones show one at a time; wider screens show all. */
 const steps:{key:StepKey;title:string;content:ReactNode}[]=!register?[]:[
  {key:"about",title:"About you",content:<>{field("name",accountType==="distributor"?"Contact person’s full name":"Full name","name")}
   {accountType==="distributor"&&field("position","Position in the business","organization-title",{max:100,hint:"For example Owner, Manager or Sales lead."})}
   {field("phone","Phone number","tel",{type:"tel",max:40,hint:"Include the country code, for example +234 803 123 4567."})}
   {accountType==="driver"&&field("dateOfBirth","Date of birth","bday",{type:"date",hint:"You must be at least 18."})}</>},
  ...(accountType==="distributor"?[{key:"business" as const,title:"Your business",content:<>{field("company","Business name","organization")}
   {select("businessType","Type of business",businessTypes,"Choose a business type")}
   {field("cacNumber","CAC registration number","off",{required:false,max:20,hint:"RC or BN number, if your business is registered."})}</>}]:[]),
  ...(accountType==="driver"?[{key:"identification" as const,title:"Identification",content:<>{select("idType","ID type",idTypes,"Choose an ID")}
   {values.idType&&field("idNumber",licence?"Driver’s licence number":"NIN","off",{max:20,inputMode:licence?"text":"numeric",hint:licence?"As printed on your licence.":"11 digits, from your NIN slip or card."})}
   {licence&&field("licenceExpiry","Licence expiry date","off",{type:"date"})}
   <p className="text-xs leading-relaxed text-ink-500">Your ID number is stored securely and only used to verify your identity. It is never shown in full on this site.</p></>}]:[]),
  {key:"address",title:copy.addressLegend,content:<>{field("street","Street address","street-address",{hint:accountType==="customer"?"Where we should deliver your water.":undefined})}
   <div className="grid gap-5 sm:grid-cols-2">{field("city","City or town","address-level2",{max:60})}{select("state","State",states,"Choose a state")}</div></>},
  ...(accountType==="driver"?[{key:"vehicle" as const,title:"Vehicle and availability",content:<>{select("vehicleType","Vehicle type",vehicleTypes,"Choose your vehicle")}
   {field("plateNumber","Plate number","off",{max:12,hint:"For example ABC-123DE."})}
   {field("operatingArea","Areas you can deliver to","off",{hint:"Cities or towns, for example Awka, Nnewi, Onitsha."})}
   {select("availability","Availability",availabilities,"Choose your availability")}</>}]:[]),
  ...(accountType==="distributor"?[{key:"supply" as const,title:"Supply",content:<>{field("supplyAreas","Areas you want to supply","off",{max:200,hint:"Cities, towns or markets."})}
   {select("monthlyVolume","Expected monthly volume",monthlyVolumes,"Choose a range")}
   {yesNo("hasStorage","Do you have storage space for stock?")}
   {yesNo("hasVehicle","Do you have your own delivery vehicle?")}</>}]:[]),
  {key:"signin",title:"Sign-in details",content:<>{field("email","Email address","email",{type:"email",max:254})}
   {passwordFields}</>},
 ];
 const lastStep=step>=steps.length-1;
 /** Hidden on phones until the last registration step. */
 const finalOnly=register&&!lastStep?"max-md:hidden":"";

 if(received)return <div data-registration-received={accountType} role="status" className="rounded-button border border-line-card bg-cream-200 p-5 leading-relaxed"><h2 className="font-serif text-2xl font-bold text-forest-heading">{copy.received.heading}</h2><p className="mt-3 text-sm text-ink-700">{copy.received.text}</p><p className="mt-3 text-sm text-ink-700">Already have an account? Log in with your existing password.</p><Link href="/account/login" className="mt-5 inline-flex min-h-12 items-center rounded-button bg-forest-850 px-6 py-3 font-semibold text-on-dark focus-ring">Go to log in</Link></div>;

 return <><nav aria-label="Account" className="mb-7 grid grid-cols-2 border-b border-line-card text-center text-sm font-semibold"><Link href="/account/login" aria-current={!register?"page":undefined} className={`focus-ring border-b-2 px-3 py-4 ${!register?"border-gold-700 text-forest-850":"border-transparent text-ink-500"}`}>Log in</Link><Link href="/account/register" aria-current={register?"page":undefined} className={`focus-ring border-b-2 px-3 py-4 ${register?"border-gold-700 text-forest-850":"border-transparent text-ink-500"}`}>Register</Link></nav>
 {register&&<div className={step>0?"max-md:hidden":undefined}>{typePicker}</div>}
 <p id="account-availability" className={`${register&&step>0?"max-md:hidden ":""}mb-6 rounded-button border border-line-card bg-cream-200 p-4 text-sm leading-relaxed`}>{register?copy.intro:accountCopy.login.intro}{demo&&" Demo access (development and staging only): enter any email and choose “Open demo dashboard”; no real account is used."} For help, <Link href="/contact" className="text-gold-700 underline">contact our team</Link>.</p>
 <form ref={formRef} method="post" onSubmit={submit} className="grid gap-5" aria-label={register?`${copy.label} registration`:"Account login"} data-account-type={register?accountType:undefined}>
 {register&&<div className="md:hidden"><p ref={stepHeading} tabIndex={-1} data-register-progress={`${step+1}/${steps.length}`} className="scroll-mt-4 text-sm font-semibold text-forest-850 outline-none">{stepCopy.step} {step+1} {stepCopy.of} {steps.length} · {steps[step]?.title}</p><div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-200"><div className="h-full rounded-full bg-gold-700" style={{width:`${(step+1)/steps.length*100}%`}}/></div></div>}
 {steps.map(({title,content},index)=>section(index,title,content))}
 {!register&&<>{field("email","Email address","email",{type:"email",max:254})}{passwordFields}</>}
 {register&&<><label className={`${finalOnly} flex items-start gap-3 text-sm leading-relaxed`}><input type="checkbox" name="consent" value="yes" required className="mt-1 size-4 shrink-0 accent-forest-850 focus-ring" /><span>{copy.consent}</span></label></>}
 {error&&<p role="alert" className="text-sm text-error">{error}</p>}
 <button disabled={!enhanced||pending} type="submit" aria-describedby="account-availability" className={`${finalOnly} min-h-13 rounded-button bg-forest-850 px-6 py-3 font-semibold text-on-dark disabled:cursor-not-allowed disabled:opacity-70 focus-ring`}>{pending?(register?"Sending…":"Logging in…"):register?copy.submit:"Log in"}</button>
 {register&&<div className="grid grid-cols-2 gap-3 md:hidden">
  {step>0&&<button type="button" data-step-back onClick={()=>{setError("");goTo(step-1)}} className={`${secondaryClass} ${lastStep?"col-span-2":""}`}>{stepCopy.back}</button>}
  {!lastStep&&<button type="button" data-step-next disabled={!enhanced} onClick={next} className={`${step===0?"col-span-2":"col-start-2"} min-h-13 rounded-button bg-forest-850 px-6 py-3 font-semibold text-on-dark disabled:cursor-not-allowed disabled:opacity-70 focus-ring`}>{stepCopy.next}</button>}
 </div>}
 {demo&&<button type="button" data-demo-login disabled={!enhanced||pending} onClick={openDemo} className={secondaryClass}>Open demo dashboard</button>}
 <noscript><p className="text-sm">JavaScript is needed to sign in or register.</p></noscript>
 </form>
 {register&&accountType!=="customer"&&<p className="mt-3 text-xs leading-relaxed text-ink-500">{copy.panel.note}</p>}
 <p className="mt-6 text-center text-sm text-ink-700">{register?"Already registered? ":"New to ROCK-TAMA? "}<Link href={register?"/account/login":"/account/register"} className="text-gold-700 underline focus-ring">{register?"Log in":"Create an account"}</Link></p>
 {!register&&<p className="mt-4 text-center text-sm"><Link href="/contact" className="text-gold-700 underline focus-ring">Need help accessing your account?</Link></p>}
 </>;
}
