"use client";
import {useState,useSyncExternalStore} from "react";
import Link from "next/link";
import {ProductGallery} from "./ProductGallery";
import {shopGallery} from "@/content/shop-gallery";
import {shopVariants,money,selectionHref,variantById} from "@/content/commerce";
import {addBasket} from "@/lib/basket";
import {buttonClassName} from "@/components/ui/button-styles";
import styles from "./shop-experience.module.css";
const subscribe=()=>()=>{};
export function ShopProductExperience(){
 const enhanced=useSyncExternalStore(subscribe,()=>true,()=>false);
 const [id,setId]=useState("750-single"),[quantity,setQuantity]=useState("1"),[notice,setNotice]=useState("");
 const variant=variantById(id)!;const count=Number(quantity),valid=Number.isInteger(count)&&count>=1&&count<=10000;
 const choose=(next:string)=>{setId(next);setNotice("")};
 const options=[shopVariants.find(v=>v.size===variant.size&&v.pack==="single")!,variantById("750-pack12")!,variantById("1500-carton")!];
 const href=selectionHref([{variantId:id,quantity:valid?count:1}]);
 const add=()=>{try{addBasket(id,count);setNotice("Added to your basket. No payment has been taken.")}catch(error){setNotice(error instanceof Error && error.message.startsWith("The basket limit") ? error.message : "Basket storage is unavailable. You can still request this selection directly.")}};
 return <section className={styles.product} aria-labelledby="shop-heading">
 <ProductGallery key={variant.product} images={shopGallery[variant.product as keyof typeof shopGallery]} enhanced={enhanced}/>
 <div className={styles.info}>
 <h1 id="shop-heading" className="font-serif text-4xl font-bold leading-none text-forest-850 lg:text-5xl">ROCK-TAMA –<br/> Natural Spring Water</h1>
 <p className="mt-3 font-serif text-2xl font-semibold italic text-ink-900">Pure by Nature. African at Heart.</p>
 <p className="mt-4 text-base leading-relaxed text-ink-900">Natural spring water from Nanka, Anambra State, Nigeria. Choose your bottle size and packaging, then send your selection for an order quotation.</p>
 <div className="mt-5 border-y border-line-card py-3 text-sm text-ink-700">From Nanka, Anambra State <span aria-hidden="true" className="mx-3 text-gold-700">|</span> Product information on request</div>
 <div className="mt-5 flex flex-wrap items-baseline gap-3"><p className="font-serif text-4xl font-bold text-forest-850 lining-nums" data-shop-price>{money(variant.amount)}</p><span className="text-sm text-ink-700">({variant.detail})</span></div>
 <p className="mt-2 text-sm text-gold-700">Draft pricing approved for planning. Final price and availability are confirmed in your quotation.</p>
 <div className={styles.sizeRow}><span className={styles.label}>Size</span><div role="group" aria-label="Bottle size" className="flex flex-1 gap-3">{[{id:"750-single",label:"750 ml",size:"750"},{id:"1500-single",label:"1.5 L",size:"1500"}].map(x=><button type="button" key={x.id} disabled={!enhanced} aria-pressed={variant.size===x.size} onClick={()=>choose(x.id)} className={`${styles.size} focus-ring ${variant.size===x.size?styles.sizeActive:""}`}>{x.label}</button>)}</div></div>
 <fieldset className="mt-5"><legend className={styles.label}>Pack</legend><div className={styles.packGrid}>{options.map(v=><label key={v.id} className={`${styles.pack} ${id===v.id?styles.packActive:""}`}><input type="radio" name="shop-pack" value={v.id} disabled={!enhanced} checked={id===v.id} onChange={()=>choose(v.id)} className="mt-0.5 size-4 shrink-0 accent-forest-850 focus-ring"/><span><strong className="block text-sm">{v.label}</strong><span className="block text-xs">{v.detail}</span><strong className="mt-1 block text-sm">{money(v.amount)}</strong></span></label>)}</div></fieldset>
 <div className="mt-5"><p className={styles.label}>Purchase type</p><div className="mt-2 grid gap-3 sm:grid-cols-2"><div className="rounded-button border border-gold-700 bg-cream-200 p-3 text-sm"><span aria-hidden="true">◉ </span>One-time order request</div><Link href="/wholesale#enquiry" className="focus-ring rounded-button border border-line-card p-3 text-sm underline-offset-4 hover:underline">Ask about recurring supply</Link></div></div>
 <div className="mt-5 flex items-center gap-5"><label htmlFor="shop-quantity" className={styles.label}>Quantity</label><div className={styles.quantity}><button type="button" aria-label="Decrease quantity" disabled={!enhanced||count<=1} onClick={()=>setQuantity(String(Math.max(1,(count||1)-1)))}>−</button><input id="shop-quantity" type="number" min={1} max={10000} step={1} disabled={!enhanced} value={quantity} onChange={e=>setQuantity(e.target.value)} aria-invalid={!valid}/><button type="button" aria-label="Increase quantity" disabled={!enhanced||count>=10000} onClick={()=>setQuantity(String(Math.min(10000,(count||1)+1)))}>+</button></div></div>
 {!valid&&<p role="alert" className="mt-2 text-sm text-error">Choose a whole quantity from 1 to 10,000.</p>}
 <div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={!enhanced||!valid} type="button" onClick={add} className={`${buttonClassName("outline-light",{surface:"light"})} disabled:cursor-not-allowed disabled:opacity-50`}>Add to cart</button><Link href={href} aria-disabled={!valid} onClick={e=>{if(!valid)e.preventDefault()}} className={`${styles.request} focus-ring`}>Request order</Link></div>
 <div role="status" className="mt-2 min-h-5 text-sm text-forest-850">{notice} {notice.startsWith("Added")&&<Link href="/cart" className="underline">View basket →</Link>}</div>
 <div className="mt-4 grid gap-3 border-t border-line-card pt-4 text-sm sm:grid-cols-2"><p>Delivery arrangements confirmed with your quote.</p><Link href="/wholesale#enquiry" className="text-gold-700 underline underline-offset-4">Need larger quantities? Request wholesale pricing →</Link></div>
 <p className="mt-4 text-xs font-semibold uppercase tracking-nav text-ink-700">Order enquiry · No payment collected online</p>
 <noscript><p className="mt-4 text-sm">You can request the displayed selection using the order link. For other sizes, use the product links below.</p></noscript>
 </div></section>
}
