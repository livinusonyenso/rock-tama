import type {Metadata} from "next";
import Image from "next/image";
import {Container} from "@/components/ui/Container";
import {Checkout} from "@/components/shop/Checkout";
import {paymentMode} from "@/lib/server/payments/config";
export const metadata:Metadata={title:"Checkout",description:"Review your ROCK-TAMA basket, add your delivery details and pay securely online."};
export default function CheckoutPage(){return <main id="main" className="flex-1 bg-ivory-50">
 <section className="relative isolate overflow-hidden bg-forest-850 py-9 text-on-dark lg:py-11" aria-labelledby="checkout-heading">
 <Image src="/images/hero/waterfall-bg.webp" alt="" fill preload sizes="100vw" className="-z-20 object-cover object-[center_60%]"/>
 <div className="absolute inset-0 -z-10 bg-linear-to-r from-forest-950/95 via-forest-950/65 to-forest-950/20"/>
 <Container size="wide"><p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-500 sm:text-sm">ROCK TAMA NATURAL SPRING WATER</p><span className="mt-3 block h-px w-12 bg-gold-500"/><h1 id="checkout-heading" className="mt-2 font-serif text-5xl font-semibold sm:text-6xl lg:text-7xl">Checkout</h1><p className="mt-1 max-w-md font-serif text-xl italic sm:text-2xl">A few details, and we’ll help arrange your ROCK-TAMA order.</p></Container>
 </section>
 <Container size="wide" className="py-6 lg:py-8"><Checkout payment={paymentMode()}/></Container>
 <section aria-label="The ROCK-TAMA promise" className="relative isolate overflow-hidden bg-forest-850 py-8 text-on-dark"><Image src="/images/hero/waterfall-bg.webp" alt="" fill sizes="100vw" className="-z-20 object-cover object-bottom"/><div className="absolute inset-0 -z-10 bg-forest-950/90"/><Container><p className="text-center text-xs uppercase tracking-eyebrow text-gold-500">THE ROCK TAMA PROMISE</p><div className="mt-5 grid gap-5 text-center sm:grid-cols-3"><div><h2 className="font-serif text-2xl italic">Personal service</h2><p className="mt-1 text-sm">Our team reviews your requirements.</p></div><div><h2 className="font-serif text-2xl italic">Clear pricing</h2><p className="mt-1 text-sm">You see the full product total before paying.</p></div><div><h2 className="font-serif text-2xl italic">Delivery arrangements</h2><p className="mt-1 text-sm">Discuss your location and preferred timing.</p></div></div></Container></section>
 </main>}
