"use client";
import Link from "next/link";
import type {ReactNode} from "react";
import {useBasket} from "@/lib/basket";
export function CartIndicator({icon,label}:{icon:ReactNode;label:string}){const count=useBasket().reduce((n,l)=>n+l.quantity,0);return <Link href="/cart" className="focus-ring relative flex text-forest-heading hover:text-gold-700">{icon}<span aria-hidden="true" data-cart-count className="absolute -top-3.5 -right-2.5 flex size-6 items-center justify-center rounded-full bg-gold-700 text-xs font-semibold text-white">{count>99?"99+":count}</span><span className="sr-only" aria-live="polite">{label}, {count} {count===1?"item":"items"}</span></Link>}
