"use client";
import {useMemo,useSyncExternalStore} from "react";
import {variantById,type BasketLine} from "@/content/commerce";
const KEY="rocktama.basket.v1",EVENT="rocktama:basket";
const read=()=>{try{return window.localStorage.getItem(KEY)??"[]"}catch{return "[]"}};
const server=()=>"[]";
const subscribe=(notify:()=>void)=>{const storage=(e:StorageEvent)=>{if(e.key===KEY || e.key===null)notify()};window.addEventListener("storage",storage);window.addEventListener(EVENT,notify);return()=>{window.removeEventListener("storage",storage);window.removeEventListener(EVENT,notify)}};
function parse(raw:string):BasketLine[]{try{const data=JSON.parse(raw);if(!Array.isArray(data))return [];const merged=new Map<string,number>();for(const x of data.slice(0,20)){if(x && typeof x.variantId==="string" && variantById(x.variantId) && Number.isInteger(x.quantity) && x.quantity>0 && x.quantity<=10000)merged.set(x.variantId,Math.min(10000,(merged.get(x.variantId)??0)+x.quantity))}return [...merged].map(([variantId,quantity])=>({variantId,quantity}))}catch{return []}}
export function useBasket(){const raw=useSyncExternalStore(subscribe,read,server);return useMemo(()=>parse(raw),[raw])}
export function updateBasket(lines:BasketLine[]){window.localStorage.setItem(KEY,JSON.stringify(lines));window.dispatchEvent(new Event(EVENT))}
export function addBasket(variantId:string,quantity:number){if(!variantById(variantId)||!Number.isInteger(quantity)||quantity<1||quantity>10000)throw new Error("Choose a valid quantity.");const lines=parse(read()),old=lines.find(l=>l.variantId===variantId);if(old){if(old.quantity+quantity>10000)throw new Error("The basket limit is 10,000 selections per item.");old.quantity+=quantity;}else lines.push({variantId,quantity});updateBasket(lines)}
/**
 * Adds several selections at once (D-119): all lines are validated against the current basket first and
 * written in one update, so a limit error never leaves a half-added selection.
 */
export function addBasketLines(additions:readonly BasketLine[]){
 const lines=parse(read());
 for(const {variantId,quantity} of additions){
  if(!variantById(variantId)||!Number.isInteger(quantity)||quantity<1||quantity>10000)throw new Error("Choose a valid quantity.");
  const old=lines.find(l=>l.variantId===variantId);
  if((old?.quantity??0)+quantity>10000)throw new Error("The basket limit is 10,000 selections per item.");
 }
 for(const {variantId,quantity} of additions){const old=lines.find(l=>l.variantId===variantId);if(old)old.quantity+=quantity;else lines.push({variantId,quantity})}
 updateBasket(lines);
}
