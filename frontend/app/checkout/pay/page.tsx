import {Suspense} from "react";
import type {Metadata} from "next";
import Link from "next/link";
import {PaymentOptions} from "@/components/shop/PaymentOptions";
import {Container} from "@/components/ui/Container";
import {payment} from "@/content/payment";
import {paymentMode} from "@/lib/server/payments/config";
import {naira,priceBasket} from "@/lib/server/payments/order";
import {readPendingOrder} from "@/lib/server/payments/order-session";

export const metadata:Metadata={title:"Payment",robots:{index:false,follow:false}};

/** /checkout/pay (D-124): choose card (Paystack) or bank transfer for the pending order. */
export default function PaymentPage(){
 return <main id="main" className="flex-1 bg-ivory-50"><Container className="py-10 lg:py-14">
  <Suspense fallback={<p role="status">Loading your order…</p>}><Payment/></Suspense>
 </Container></main>;
}

async function Payment(){
 const order=await readPendingOrder();
 if(!order)return <section data-payment-page="expired" className="mx-auto max-w-xl rounded-card border border-line-card bg-cream-200 p-8">
  <h1 className="font-serif text-4xl font-bold text-forest-850">Your checkout session has expired</h1>
  <p className="mt-3">For your security, payment details are kept for one hour. Please continue from checkout again.</p>
  <Link href="/checkout" className="mt-5 inline-block rounded-button bg-forest-850 px-5 py-3 font-semibold text-on-dark focus-ring">Return to checkout</Link>
 </section>;
 const basket=priceBasket(order.lines);
 return <div data-payment-page="ready" className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
  <section aria-labelledby="payment-heading" className="rounded-card border border-line-card bg-white/60 p-6 shadow-card lg:p-8">
   <p className="text-sm font-semibold uppercase tracking-eyebrow text-gold-700">Step 2 of 2</p>
   <h1 id="payment-heading" className="mt-1 font-serif text-5xl font-bold text-forest-850">{payment.title}</h1>
   <p className="mt-2 text-ink-700">{payment.intro}</p>
   <div className="mt-6"><PaymentOptions amount={naira(basket.totalKobo)} orderRef={order.orderRef} mode={paymentMode()} card={payment.card} transfer={payment.transfer} bank={payment.transfer} receiptAccept={payment.receipt.accept}/></div>
  </section>
  <aside aria-labelledby="pay-summary-heading" className="rounded-card bg-forest-850 p-6 text-on-dark lg:p-8">
   <h2 id="pay-summary-heading" className="font-serif text-3xl font-semibold">Order {order.orderRef}</h2>
   <ul className="mt-4 space-y-2 border-t border-line-dark/50 pt-4 text-sm">{basket.lines.map(l=><li key={l.variantId} className="flex justify-between gap-3"><span>{l.quantity} × {l.label} <span className="text-on-dark-muted">({l.detail})</span></span><span className="shrink-0">{naira(l.lineKobo??0)}</span></li>)}</ul>
   <p className="mt-4 flex justify-between border-t border-line-dark/50 pt-4 font-serif text-2xl font-bold"><span>Total</span><span data-pay-total>{naira(basket.totalKobo)}</span></p>
   <p className="mt-2 text-xs text-on-dark-muted">Products only: delivery is arranged and charged separately.</p>
   <p className="mt-4 text-sm">Delivering to {order.customer.city}, {order.customer.state} · <Link href="/checkout" className="text-gold-500 underline">Change details</Link></p>
  </aside>
 </div>;
}
