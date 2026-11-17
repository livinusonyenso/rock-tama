import {Suspense} from "react";
import type {Metadata} from "next";
import Link from "next/link";
import {ClearBasket} from "@/components/shop/ClearBasket";
import {Container} from "@/components/ui/Container";
import {payment} from "@/content/payment";

export const metadata:Metadata={title:"Transfer submitted",robots:{index:false,follow:false}};
type Props={searchParams:Promise<{reference?:string}>};

/** Bank transfer submitted (D-124): honest "awaiting confirmation", never "paid". Shows only the reference. */
export default function TransferSubmittedPage({searchParams}:Props){
 return <main id="main" className="flex-1 bg-ivory-50"><Container className="py-12 lg:py-16"><Suspense fallback={null}><Submitted searchParams={searchParams}/></Suspense></Container></main>;
}

async function Submitted({searchParams}:Props){
 const {reference=""}=await searchParams;
 const valid=/^RT-ORD-\d{8}-[A-Z0-9]{6}$/.test(reference);
 return <section data-transfer-status="submitted" aria-labelledby="transfer-heading" className="mx-auto max-w-2xl rounded-card bg-forest-850 p-8 text-on-dark">
  {valid&&<ClearBasket/>}
  {payment.transfer.placeholder&&<p className="mb-4 rounded-button bg-gold-700 px-3 py-2 text-sm font-semibold">Demo: no real transfer was expected.</p>}
  <h1 id="transfer-heading" className="font-serif text-4xl font-bold">Transfer details received</h1>
  <p className="mt-3">Thank you. Your order is <strong>awaiting payment confirmation</strong>. {payment.transfer.pendingNote}</p>
  {valid&&<p className="mt-2">Order reference: <strong data-transfer-reference>{reference}</strong></p>}
  <p className="mt-4 text-sm text-on-dark-muted">Our team will contact you once your payment is confirmed. Keep your receipt until then.</p>
  <Link href="/shop" className="mt-6 inline-block text-gold-500 underline">Continue shopping</Link>
 </section>;
}
