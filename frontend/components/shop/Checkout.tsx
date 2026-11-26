"use client";
import Image from "next/image";
import Link from "next/link";
import {useActionState,useEffect,useRef,useState,type ReactNode} from "react";
import {submitCheckout,type CheckoutState} from "@/app/checkout/actions";
import {checkoutDetailsSchema,type CheckoutDetails} from "@/lib/checkout-details";
import {useBasket,updateBasket} from "@/lib/basket";
import {money,variantById} from "@/content/commerce";
import {shopGallery} from "@/content/shop-gallery";
import {HONEYPOT_FIELD} from "@/lib/enquiry";
import {Icon} from "@/components/icons/Icon";
import type {IconName} from "@/types/content";
import styles from "./checkout.module.css";
import {resolveHref} from "@/lib/navigation";
const customLabelsHref=resolveHref("customLabels")??"/custom-labels";
const initial:CheckoutState={status:"idle"};
const steps = { basket: "Basket", contact: "Contact", delivery: "Delivery" } as const;
type Step = keyof typeof steps;
const initialNavigation: {step: Step; submission: CheckoutState} = { step: "basket", submission: initial };
const contactFields = ["name", "phone", "email"] as const;
const contactSchema = checkoutDetailsSchema.pick({ name: true, phone: true, email: true });
const backClass = "focus-ring min-h-11 rounded-button px-3 text-sm font-semibold text-gold-700 underline underline-offset-4 lg:hidden";
function Panel({title,subtitle,icon,step,children}:{title:string;subtitle:string;icon:IconName;step:Step|"desktop";children:ReactNode}){return <section className={styles.panel} data-checkout-panel={step}><div className={styles.panelHeading}><span className={styles.medallion}><Icon name={icon} className="size-6"/></span><div><h2 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">{title}</h2><p className="mt-1 font-serif text-base italic">{subtitle}</p></div></div>{children}</section>}
/** One form feeds the payment page. Smaller screens reveal one part at a time. */
export function Checkout({initialDetails,signedInEmail,savedDetails=false}:{initialDetails?:Partial<CheckoutDetails>;signedInEmail?:string;savedDetails?:boolean}){
 const lines=useBasket();const [state,action,pending]=useActionState(submitCheckout,initial);
 const [values,setValues]=useState({name:"",email:"",phone:"",address:"",city:"",state:"",notes:"",...initialDetails});
 const [useSavedDetails,setUseSavedDetails]=useState(savedDetails);
 const [storageError,setStorageError]=useState("");const form=useRef<HTMLFormElement>(null);const status=useRef<HTMLDivElement>(null);
 const [navigation, setNavigation] = useState(initialNavigation);
 const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
 const progress = useRef<HTMLElement>(null);
 const errors = { ...state.errors, ...contactErrors };
 const errorStep = state.status === "invalid" && contactFields.some(name => state.errors?.[name])
   ? "contact"
   : "delivery";
 const step = navigation.submission !== state && state.status !== "idle" ? errorStep : navigation.step;
 const showSavedDetails = useSavedDetails && !Object.keys(errors).some(name => name !== "notes" && name !== "consent");

 useEffect(() => {
   if (navigation === initialNavigation) return;
   progress.current?.focus();
 }, [navigation]);

 useEffect(() => {
   if (state.status === "invalid" || Object.keys(contactErrors).length > 0) {
     const invalidFields = form.current?.querySelectorAll<HTMLElement>("[aria-invalid=true]");
     Array.from(invalidFields ?? []).find(field => field.getClientRects().length > 0)?.focus();
   }
   if (state.status === "error") status.current?.focus();
 }, [state, contactErrors]);

 const goTo = (next: Step) => setNavigation({ step: next, submission: state });
 const advance = () => {
   if (step === "basket") {
     goTo("contact");
     return;
   }
   const validation = contactSchema.safeParse(values);
   if (!validation.success) {
     setUseSavedDetails(false);
     setContactErrors(Object.fromEntries(validation.error.issues.map(issue => [String(issue.path[0]), issue.message])));
     return;
   }
   setContactErrors({});
   goTo("delivery");
 };

 const save=(next:typeof lines)=>{try{updateBasket(next);setStorageError("")}catch{setStorageError("Your browser could not update the basket. Please try again.")}};
 const field=(name:keyof typeof values,label:string,autoComplete:string,type="text")=><label className={styles.field} htmlFor={`checkout-${name}`}>{label} <span className="text-gold-700" aria-hidden="true">*</span><input id={`checkout-${name}`} name={name} type={type} autoComplete={autoComplete} required maxLength={name==="address"?120:name==="city"?40:name==="state"?35:120} value={values[name]} onChange={e=>setValues({...values,[name]:e.target.value})} aria-invalid={!!errors[name]} aria-describedby={errors[name]?`checkout-${name}-error`:undefined}/>{errors[name]&&<span id={`checkout-${name}-error`} className="mt-1 block text-sm text-error">{errors[name]}</span>}</label>;
 if(!lines.length)return <div className={`${styles.panel} py-12 text-center`}><Icon name="shopping-cart" className="mx-auto size-10 text-gold-700"/><h2 className="mt-4 font-serif text-3xl font-semibold">Your basket is empty</h2><p className="mt-3">Choose your bottles or packs before checking out.</p><Link href="/shop" className={`${styles.submit} mx-auto mt-6 max-w-xs`}>Explore products →</Link><noscript><p className="mt-4">Checkout uses your browser’s saved basket. You can also <Link href="/wholesale#enquiry" className="underline">request an order directly</Link>.</p></noscript></div>;
 const known=lines.reduce((n,l)=>n+(variantById(l.variantId)?.amount??0)*l.quantity,0);
 const customLabelQuote = <p className="mt-3 text-sm text-ink-700">Need custom labels for a wedding, memorial or event? Those are priced on request: <Link data-custom-labels href={customLabelsHref} className="font-semibold text-gold-700 underline">request a custom label quote</Link>.</p>;
 return <form ref={form} action={action} noValidate className={styles.layout} aria-label="Checkout order request" data-checkout-step={step} onSubmit={event => {
  if (step !== "delivery" && !window.matchMedia("(min-width: 64rem)").matches) {
    event.preventDefault();
    advance();
  } else if (Object.keys(contactErrors).length > 0) {
    setContactErrors({});
  }
 }}>
 <input type="hidden" name="basket" value={JSON.stringify(lines)}/><div className="hidden" aria-hidden="true"><label htmlFor="checkout-website">Website</label><input id="checkout-website" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off"/></div>
 <nav ref={progress} tabIndex={-1} aria-label={`Checkout step: ${steps[step]}`} className="scroll-mt-4 rounded-card border border-line-card bg-cream-200 p-3 focus-ring lg:hidden">
  <ol className="grid grid-cols-3 gap-2 text-center text-sm">
   {(Object.keys(steps) as Step[]).map((item, index) => (
    <li key={item} aria-current={item === step ? "step" : undefined} className="flex min-w-0 flex-col items-center gap-1.5 text-ink-700 aria-[current=step]:font-semibold aria-[current=step]:text-forest-heading">
     <span aria-hidden="true" className={`grid size-7 place-items-center rounded-full border ${item === step ? "border-forest-850 bg-forest-850 text-on-dark" : "border-line-card bg-ivory-50"}`}>{index + 1}</span>
     <span className="max-w-full wrap-anywhere">{steps[item]}</span>
    </li>
   ))}
  </ol>
 </nav>
 <div className={styles.details}>
 {signedInEmail&&<p data-checkout-panel="contact" className="rounded-button border border-line-card bg-cream-200 p-4 text-sm">Signed in as <strong className="break-all">{signedInEmail}</strong>. {showSavedDetails?"Your saved contact and delivery details are ready to use.":"Your email is filled in. Add your remaining contact and delivery details to continue."}</p>}
 {showSavedDetails?<section data-saved-checkout-details className={styles.panel} aria-labelledby="saved-checkout-heading">
  <div className="flex items-center justify-between gap-4">
   <h2 id="saved-checkout-heading" className="font-serif text-2xl font-bold text-forest-heading">Your saved details</h2>
   <button type="button" className="min-h-11 shrink-0 px-3 text-sm text-gold-700 underline focus-ring" onClick={()=>setUseSavedDetails(false)}>Edit details</button>
  </div>
  <div data-checkout-panel="contact">
   <p className="mt-4 font-semibold">{values.name}</p>
   <p className="mt-2 break-all text-sm">{values.email} · {values.phone}</p>
  </div>
  <div data-checkout-panel="delivery">
   <p className="mt-3 text-sm leading-relaxed">{values.address}<br/>{values.city}, {values.state}</p>
   <label className={`${styles.field} mt-5`} htmlFor="checkout-notes">Delivery notes (optional)<textarea id="checkout-notes" name="notes" rows={2} maxLength={500} value={values.notes} onChange={e=>setValues({...values,notes:e.target.value})} aria-invalid={!!errors.notes} aria-describedby={errors.notes?"checkout-notes-error":undefined}/>{errors.notes&&<span id="checkout-notes-error" className="text-sm text-error">{errors.notes}</span>}</label>
  </div>
  {(["name","email","phone","address","city","state"] as const).map(name=><input key={name} type="hidden" name={name} value={values[name]}/>)}
 </section>:<>
 <Panel title="Contact Information" subtitle="We’ll use these details to arrange your order." icon="user" step="contact"><div className={styles.fields}>{field("name","Full name","name")}{field("phone","Phone number","tel","tel")}<div className="sm:col-span-2">{field("email","Email address","email","email")}</div></div></Panel>
 <Panel title="Delivery Address" subtitle="Where should we deliver your ROCK-TAMA order?" icon="map-pin" step="delivery"><div className={styles.fields}><div className="sm:col-span-2">{field("address","Address","street-address")}</div>{field("city","City","address-level2")}{field("state","State / region","address-level1")}<label className={`${styles.field} sm:col-span-2`} htmlFor="checkout-notes">Delivery notes <span className="font-normal">(optional)</span><textarea id="checkout-notes" name="notes" rows={3} maxLength={500} value={values.notes} onChange={e=>setValues({...values,notes:e.target.value})} placeholder="Reception details, preferred delivery time or other instructions." aria-invalid={!!errors.notes} aria-describedby={errors.notes?"checkout-notes-error":undefined}/>{errors.notes&&<span id="checkout-notes-error" className="text-sm text-error">{errors.notes}</span>}</label></div></Panel>
 </>}
 <Panel title="Delivery Method" subtitle="Let us help arrange a suitable delivery option." icon="truck" step="desktop"><div className={styles.option}><span className={styles.radio} aria-hidden="true"/><div><h3 className="font-serif text-xl font-bold">Delivery to your address</h3><p className="mt-1 text-sm text-ink-700">Delivery timing and fee are arranged with you after payment.</p></div></div></Panel>
 <Panel title="Payment" subtitle="Next: pay by card or bank transfer." icon="file-text" step="desktop"><div data-payment-option="next" className={styles.option}><span className={styles.radio} aria-hidden="true"/><div><h3 className="font-serif text-xl font-bold">Card or bank transfer</h3><p className="mt-1 text-sm text-ink-700">On the next page, pay by card (processed securely by Paystack) or by bank transfer and send us your receipt or transaction ID.</p></div></div>
 {customLabelQuote}</Panel>
 </div>
 <aside className={styles.summary} aria-labelledby="order-summary-heading"><div className={styles.summaryHeading}><Icon name="shopping-cart" className="size-8 text-gold-500"/><h2 id="order-summary-heading" className="font-serif text-3xl font-semibold">Order Summary</h2></div><div className={styles.summaryBody}>
 <div data-checkout-panel="basket">
 <ul className="divide-y divide-line-card">{lines.map(line=>{const v=variantById(line.variantId)!;const key=(v.pack==="pack12"?"750-pack12":v.pack==="pack24"?"750-pack24":v.product) as keyof typeof shopGallery;const image=shopGallery[key]?.[0]??shopGallery[v.product as keyof typeof shopGallery][0];return <li key={line.variantId} className={styles.item}><div className={styles.itemImage}><Image src={image.src} alt={image.alt} fill sizes="112px" className="object-contain p-2"/></div><div className="min-w-0"><h3 className="font-serif text-xl font-bold">{v.pack==="single"?`${v.size==="750"?"750 ml":"1.5 L"} Bottle`:v.label}</h3><p className="mt-1 text-sm text-ink-700">{v.detail}</p><div className={styles.quantity}><button type="button" disabled={pending||line.quantity<=1} aria-label={`Decrease ${v.detail}`} onClick={()=>save(lines.map(l=>l.variantId===line.variantId?{...l,quantity:l.quantity-1}:l))}>−</button><span aria-label={`Quantity: ${line.quantity}`}>{line.quantity}</span><button type="button" disabled={pending||line.quantity>=10000} aria-label={`Increase ${v.detail}`} onClick={()=>save(lines.map(l=>l.variantId===line.variantId?{...l,quantity:l.quantity+1}:l))}>+</button></div></div><div className="flex h-full flex-col items-end justify-between"><button disabled={pending} type="button" className="flex size-11 items-center justify-center rounded-button text-ink-700 hover:bg-cream-200 focus-ring" aria-label={`Remove ${v.label} ${v.detail}`} onClick={()=>save(lines.filter(l=>l.variantId!==line.variantId))}><Icon name="x" className="size-4"/></button><p className="text-right font-serif text-xl font-bold">{money(v.amount===null?null:v.amount*line.quantity)}</p></div></li>})}</ul>
 {storageError&&<p role="alert" className="mt-3 text-error">{storageError}</p>}
 <dl className="mt-4 space-y-3 border-t border-line-card pt-5 text-sm"><div className="flex justify-between gap-4"><dt>Subtotal</dt><dd className="font-semibold">{money(known)}</dd></div><div className="flex justify-between gap-4"><dt>Delivery fee</dt><dd>To be confirmed</dd></div></dl>
 <div className={styles.total}><span className="font-serif text-2xl font-bold">Total</span><strong className="font-serif text-2xl">{money(known)}</strong></div><p className="mt-2 text-xs text-ink-700">Products only: delivery is arranged and charged separately.</p>
 {step === "basket" && <div className="mt-5 lg:hidden"><button type="button" data-checkout-next className={styles.submit} onClick={advance}>Continue to contact<Icon name="arrow-right" className="size-5 text-gold-500"/></button></div>}
 </div>
 <div data-checkout-panel="delivery">
 <div className="lg:hidden"><div className={styles.total}><span className="font-serif text-xl font-bold">Product total</span><strong className="font-serif text-xl">{money(known)}</strong></div></div>
 <label className="mt-5 flex items-start gap-3 text-sm"><input className="mt-1 size-4 shrink-0 accent-forest-850 focus-ring" name="consent" type="checkbox" value="yes" required aria-invalid={!!errors.consent} aria-describedby={errors.consent?"checkout-consent-error":undefined}/><span>I agree that ROCK-TAMA may use these details to process and deliver my order.</span></label>{errors.consent&&<p id="checkout-consent-error" className="mt-1 text-sm text-error">{errors.consent}</p>}
 {state.message&&<div ref={status} tabIndex={-1} role="alert" className="mt-4 rounded-button border border-error p-3 text-sm text-error focus-ring">{state.message}</div>}
 <button type="submit" data-checkout-submit="continue" disabled={pending} className={`${styles.submit} mt-5`}>{pending?"Saving your details…":"Continue to payment"}<Icon name="arrow-right" className="size-5 text-gold-500"/></button><p className="mt-3 text-center text-xs text-ink-700">Products only: any delivery fee is agreed with you separately. <span className="lg:hidden">Choose card or bank transfer on the next page.</span></p>
 {step === "delivery" && <button type="button" data-checkout-back disabled={pending} className={`${backClass} mx-auto mt-2 block`} onClick={() => goTo("contact")}>Back to contact</button>}
 </div>
 <div data-checkout-panel="basket">
 <div className={styles.help}><Icon name="message-circle" className="size-8 shrink-0 text-gold-700"/><div><h3 className="font-serif text-xl font-bold">Need Help With Your Order?</h3><p className="mt-1 text-sm">Our team is here to assist you.</p><Link href="/contact" className="mt-2 inline-block text-sm text-gold-700 underline underline-offset-4">Contact ROCK-TAMA →</Link></div></div>
 <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-sm text-gold-700">
  <Link href="/shop" className="focus-ring underline">Continue shopping</Link>
  <Link href="/contact" className="focus-ring underline lg:hidden">Get help</Link>
 </div>
 <div className="lg:hidden">{customLabelQuote}</div>
 </div>
 </div></aside>
 {step === "contact" && <div className="grid gap-2 lg:hidden">
  <button type="button" data-checkout-next className={styles.submit} onClick={advance}>Continue to delivery<Icon name="arrow-right" className="size-5 text-gold-500"/></button>
  <button type="button" data-checkout-back className={backClass} onClick={() => goTo("basket")}>Back to basket</button>
 </div>}
 </form>;
}
