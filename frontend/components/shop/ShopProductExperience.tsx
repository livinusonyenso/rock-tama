"use client";
import {useState,useSyncExternalStore} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {resolveHref} from "@/lib/navigation";
import {ProductGallery} from "./ProductGallery";
import {shopGallery} from "@/content/shop-gallery";
import {shopVariants,money,variantById,type BasketLine,type ShopSize} from "@/content/commerce";
import {addBasketLines} from "@/lib/basket";
import {buttonClassName} from "@/components/ui/button-styles";
import styles from "./shop-experience.module.css";
const subscribe=()=>()=>{};
const MAX=10000;

export function ShopProductExperience({initialVariant}:{initialVariant?:string}={}){
 const enhanced=useSyncExternalStore(subscribe,()=>true,()=>false);
 // D-119: every pack has its own quantity; the selection can combine packs (and sizes).
 const start=(initialVariant&&variantById(initialVariant))||variantById("750-single")||shopVariants[0];
 const [viewing,setViewing]=useState(start.id),[size,setSize]=useState<ShopSize>(start.size);
 const [quantities,setQuantities]=useState<Record<string,string>>({}),[notice,setNotice]=useState("");
 const variant=variantById(viewing)!;
 const rows=shopVariants.filter(v=>v.size===size);
 const parsed=shopVariants.map(v=>{const raw=quantities[v.id]??"0";const n=Number(raw);return {v,raw,n,valid:raw.trim()!==""&&Number.isInteger(n)&&n>=0&&n<=MAX}});
 const invalid=parsed.filter(x=>!x.valid);
 const selected=parsed.filter(x=>x.valid&&x.n>0);
 const lines:BasketLine[]=selected.map(x=>({variantId:x.v.id,quantity:x.n}));
 const ready=enhanced&&invalid.length===0&&lines.length>0;
 // D-123: only priced packs are sold, so every selected line has a price.
 const total=selected.reduce((sum,x)=>sum+(x.v.amount??0)*x.n,0);
 const setQuantity=(id:string,value:string)=>{setQuantities(q=>({...q,[id]:value}));setViewing(id);setNotice("")};
 const step=(id:string,delta:number)=>{const n=Number(quantities[id]??"0");setQuantity(id,String(Math.min(MAX,Math.max(0,(Number.isInteger(n)?n:0)+delta))))};
 const chooseSize=(next:ShopSize)=>{setSize(next);setViewing(shopVariants.find(v=>v.size===next)!.id);setNotice("")};
 const galleryKey=variant.pack==="pack12"?"750-pack12":variant.pack==="pack24"?"750-pack24":variant.product as keyof typeof shopGallery;
 const contactHref=resolveHref("contact"),customLabelsHref=resolveHref("customLabels");
 // D-121: Add to cart keeps the visitor here; Buy now adds the same selection and opens the cart/checkout page.
 const router=useRouter();const checkoutHref=resolveHref("checkout");
 const [storageFailed,setStorageFailed]=useState(false);
 const save=()=>{try{addBasketLines(lines);setStorageFailed(false);return true}catch(error){const limit=error instanceof Error&&error.message.startsWith("The basket limit");setStorageFailed(!limit);setNotice(limit?(error as Error).message:"Your browser couldn’t save the cart, so this selection can’t be paid online here. Please contact us to order.");return false}};
 const add=()=>{if(save()){setQuantities({});setNotice(`Added ${lines.length===1?"1 selection":`${lines.length} selections`} to your cart. No payment has been taken.`)}};
 const buyNow=()=>{if(save()&&checkoutHref){setQuantities({});router.push(checkoutHref)}};
 return <section className={styles.product} aria-labelledby="shop-heading">
 <ProductGallery key={galleryKey} images={shopGallery[galleryKey]} enhanced={enhanced}/>
 <div className={styles.info}>
 <h1 id="shop-heading" className="font-serif text-4xl font-bold leading-none text-forest-850 lg:text-5xl">ROCK-TAMA –<br/> Natural Spring Water</h1>
 <p className="mt-3 font-serif text-2xl font-semibold italic text-ink-900">Pure by Nature. African at Heart.</p>
 <p className="mt-4 text-base leading-relaxed text-ink-900">Natural spring water from Nanka, Anambra State, Nigeria. Choose your bottle size and packs, then pay securely online.</p>
 <div className="mt-5 flex flex-wrap items-baseline gap-3"><p className="font-serif text-4xl font-bold text-forest-850 lining-nums" data-shop-price>{money(variant.amount)}</p><span className="text-sm text-ink-700">({variant.detail})</span></div>
 <p className="mt-2 text-sm text-gold-700">Paid securely online at checkout. Delivery is arranged and charged separately.</p>
 <div className={styles.sizeRow}><span className={styles.label}>Size</span><div role="group" aria-label="Bottle size" className="flex flex-1 gap-3">{([{label:"750 ml",size:"750"},{label:"1.5 L",size:"1500"}] as const).map(x=><button type="button" key={x.size} disabled={!enhanced} aria-pressed={size===x.size} onClick={()=>chooseSize(x.size)} className={`${styles.size} focus-ring ${size===x.size?styles.sizeActive:""}`}>{x.label}</button>)}</div></div>
 <fieldset className="mt-5"><legend className={styles.label}>Pack and quantity</legend><p className="mt-1 text-xs text-ink-700">Set a quantity for each pack you want. You can combine packs and sizes.</p><ul className={styles.packGrid}>{rows.map(v=>{const q=quantities[v.id]??"0";const n=Number(q);const ok=q.trim()!==""&&Number.isInteger(n)&&n>=0&&n<=MAX;const name=`${v.label} (${v.detail})`;return <li key={v.id} data-pack={v.id} className={`${styles.pack} ${viewing===v.id?styles.packActive:""} ${ok&&n>0?styles.packSelected:""}`}>
 <button type="button" data-pack-view disabled={!enhanced} aria-pressed={viewing===v.id} onClick={()=>setViewing(v.id)} className="min-w-0 flex-1 cursor-pointer text-left focus-ring"><strong className="block text-sm">{v.label}</strong><span className="block text-xs">{v.detail}</span><strong className="mt-1 block text-sm">{money(v.amount)}</strong></button>
 <div className={`${styles.quantity} ${styles.packQuantity}`}><button type="button" aria-label={`Decrease ${name}`} disabled={!enhanced||!ok||n<=0} onClick={()=>step(v.id,-1)}>−</button><input id={`qty-${v.id}`} type="number" inputMode="numeric" min={0} max={MAX} step={1} disabled={!enhanced} value={q} onChange={e=>setQuantity(v.id,e.target.value)} aria-label={`Quantity of ${name}`} aria-invalid={!ok}/><button type="button" aria-label={`Increase ${name}`} disabled={!enhanced||(ok&&n>=MAX)} onClick={()=>step(v.id,1)}>+</button></div>
 </li>})}</ul></fieldset>
 {invalid.length>0&&<p role="alert" className="mt-2 text-sm text-error">Use whole numbers from 0 to 10,000 for each pack.</p>}
 <div data-selection-summary aria-live="polite" className="mt-4 rounded-button border border-line-card bg-cream-200 p-4 text-sm">{selected.length===0?<p className="text-ink-700">No packs selected yet. Set a quantity above 0 for at least one pack.</p>:<><p className={styles.label}>Your selection</p><ul className="mt-2 space-y-1">{selected.map(x=><li key={x.v.id} data-selection-line={x.v.id} className="flex justify-between gap-3"><span>{x.n} × {x.v.label} <span className="text-ink-700">({x.v.detail})</span></span><span className="shrink-0 font-semibold lining-nums">{x.v.amount===null?"Price on request":money(x.v.amount*x.n)}</span></li>)}</ul><p data-selection-total className="mt-2 flex justify-between gap-3 border-t border-line-card pt-2 font-semibold"><span>Total</span><span className="lining-nums">{money(total)}</span></p></>}</div>
 <div className="mt-5"><p className={styles.label}>Purchase type</p><div className="mt-2 grid gap-3 sm:grid-cols-2"><div className="rounded-button border border-gold-700 bg-cream-200 p-3 text-sm"><span aria-hidden="true">◉ </span>One-time purchase</div><Link href="/wholesale#enquiry" className="focus-ring rounded-button border border-line-card p-3 text-sm underline-offset-4 hover:underline">Ask about recurring supply</Link></div></div>
 <div className="mt-5 grid gap-3 sm:grid-cols-2"><button data-add-basket disabled={!ready} type="button" onClick={add} className={`${buttonClassName("outline-light",{surface:"light"})} disabled:cursor-not-allowed disabled:opacity-50`}>Add to cart</button>{enhanced
  ?<button data-buy-now disabled={!ready} type="button" onClick={buyNow} className={`${styles.request} focus-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>Buy now</button>
  /* Without JavaScript the cart (browser storage) and payment can't work: point to Contact (D-123). */
  :contactHref&&<Link href={contactHref} className={`${styles.request} focus-ring`}>Contact us to order</Link>}</div>
 {customLabelsHref&&<p data-custom-labels className="mt-3 text-sm text-ink-700">Custom labels for weddings, memorials or events are priced on request: <Link href={customLabelsHref} className="font-semibold text-gold-700 underline underline-offset-4">request a custom label quote →</Link></p>}
 <div role="status" className="mt-2 min-h-5 text-sm text-forest-850">{notice} {notice.startsWith("Added")&&checkoutHref&&<Link href={checkoutHref} className="underline">View cart &amp; checkout →</Link>}{storageFailed&&contactHref&&<Link href={contactHref} className="underline">Contact us to order →</Link>}</div>
 <div className="mt-4 grid gap-3 border-t border-line-card pt-4 text-sm sm:grid-cols-2"><p>Delivery is arranged with you after payment.</p><Link href="/wholesale#enquiry" className="text-gold-700 underline underline-offset-4">Need larger quantities? Request wholesale pricing →</Link></div>
 <p className="mt-4 text-xs font-semibold uppercase tracking-nav text-ink-700">Secure online payment · Card, bank transfer or USSD</p>
 <noscript><p className="mt-4 text-sm">Ordering online needs JavaScript. Please contact us to place your order.</p></noscript>
 </div></section>
}
