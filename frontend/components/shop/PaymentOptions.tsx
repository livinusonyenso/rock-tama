"use client";
import Link from "next/link";
import {useActionState,useEffect,useRef,useState} from "react";
import {payWithCard,submitTransfer,type PayState} from "@/app/checkout/pay/actions";
import {Icon} from "@/components/icons/Icon";
import type {PaymentMode} from "@/lib/server/payments/config";

type Bank={bankName:string;accountName:string;accountNumber:string;placeholder:boolean;placeholderNotice:string;pendingNote:string};
type Props={amount:string;orderRef:string;mode:PaymentMode;card:{title:string;text:string};transfer:{title:string;text:string};bank:Bank;receiptAccept:string};
const idle:PayState={status:"idle"};
const MODE_NOTE:Partial<Record<PaymentMode,string>>={test:"Demo: card payments open a test page; no money is charged.","paystack-test":"Paystack test mode: use Paystack test cards; no real money."};

/**
 * Payment method choice (D-124): card via Paystack (or the test gateway) and bank transfer with a transaction
 * ID and/or receipt. Both forms are server actions; amounts are re-priced on the server.
 */
export function PaymentOptions({amount,orderRef,mode,card,transfer,bank,receiptAccept}:Props){
 const [method,setMethod]=useState<"card"|"transfer">("card");
 const [cardState,cardAction,cardPending]=useActionState(payWithCard,idle);
 const [transferState,transferAction,transferPending]=useActionState(submitTransfer,idle);
 const alertRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(cardState.status==="error"||transferState.status==="error")alertRef.current?.focus()},[cardState,transferState]);
 const option=(id:"card"|"transfer",title:string,text:string,icon:"shopping-cart"|"building")=>(
  <label data-method={id} className={`flex cursor-pointer gap-4 rounded-button border p-4 ${method===id?"border-forest-850 bg-cream-200 shadow-[inset_0_0_0_1px_var(--color-forest-850)]":"border-line-card"}`}>
   <input type="radio" name="method" value={id} checked={method===id} onChange={()=>setMethod(id)} className="mt-1 size-4 shrink-0 accent-forest-850 focus-ring"/>
   <span><span className="flex items-center gap-2 font-serif text-xl font-bold"><Icon name={icon} className="size-5 text-gold-700"/>{title}</span><span className="mt-1 block text-sm text-ink-700">{text}</span></span>
  </label>);
 const error=method==="card"?cardState:transferState;
 return <div>
  <fieldset className="grid gap-3"><legend className="sr-only">Payment method</legend>{option("card",card.title,card.text,"shopping-cart")}{option("transfer",transfer.title,transfer.text,"building")}</fieldset>
  {error.status==="error"&&<div ref={alertRef} tabIndex={-1} role="alert" className="mt-4 rounded-button border border-error p-3 text-sm text-error focus-ring">{error.message}{error.message?.includes("expired")&&<> <Link href="/checkout" className="underline">Return to checkout</Link></>}</div>}
  {method==="card"?(
   <form action={cardAction} data-card-form className="mt-6">
    {MODE_NOTE[mode]&&<p data-mode-note className="mb-3 rounded-button bg-gold-700 px-3 py-2 text-sm font-semibold text-white">{MODE_NOTE[mode]}</p>}
    <button type="submit" disabled={cardPending||mode==="unavailable"} className="flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-button bg-forest-850 px-5 font-semibold uppercase tracking-nav text-on-dark focus-ring disabled:cursor-not-allowed disabled:opacity-60">{cardPending?"Opening secure card payment…":`Pay ${amount} with card`}<Icon name="arrow-right" className="size-5 text-gold-500"/></button>
    {mode==="unavailable"&&<p className="mt-2 text-sm text-gold-700">Card payment is temporarily unavailable. Please pay by bank transfer or contact us.</p>}
    <p className="mt-2 text-center text-xs text-ink-700">You’ll enter your card details on Paystack’s secure page, then return here.</p>
   </form>
  ):(
   <div data-transfer-panel className="mt-6">
    {bank.placeholder&&<p data-bank-placeholder className="mb-3 rounded-button border border-gold-700 bg-cream-200 px-3 py-2 text-sm font-semibold text-gold-700">{bank.placeholderNotice}</p>}
    <dl className="grid gap-2 rounded-button border border-line-card bg-ivory-50 p-4 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
     <dt className="font-semibold">Amount</dt><dd data-transfer-amount className="font-serif text-2xl font-bold text-forest-850">{amount}</dd>
     <dt className="font-semibold">Bank</dt><dd>{bank.bankName}</dd>
     <dt className="font-semibold">Account name</dt><dd>{bank.accountName}</dd>
     <dt className="font-semibold">Account number</dt><dd data-account-number className="font-mono text-lg tracking-wider">{bank.accountNumber}</dd>
     <dt className="font-semibold">Narration / reference</dt><dd data-order-ref className="font-mono">{orderRef}</dd>
    </dl>
    <p className="mt-3 text-sm text-ink-700">Transfer the exact amount and use <strong>{orderRef}</strong> as the narration. Then send us the transaction ID or your receipt below.</p>
    <form action={transferAction} data-transfer-form className="mt-4 grid gap-4" noValidate>
     <label className="grid gap-1 text-sm font-semibold" htmlFor="transfer-id">Transaction ID / session ID <span className="font-normal text-ink-700">(from your bank app or SMS)</span>
      <input id="transfer-id" name="transactionId" maxLength={60} autoComplete="off" aria-invalid={transferState.field==="transactionId"} className="min-h-11 rounded-button border border-ink-500 bg-white px-3 font-normal focus-ring"/></label>
     <label className="grid gap-1 text-sm font-semibold" htmlFor="transfer-receipt">Receipt <span className="font-normal text-ink-700">(image or PDF, up to 4 MB)</span>
      <input id="transfer-receipt" name="receipt" type="file" accept={receiptAccept} aria-invalid={transferState.field==="receipt"} className="rounded-button border border-ink-500 bg-white p-2 font-normal focus-ring"/></label>
     <p className="text-xs text-ink-700">Provide at least one: the transaction ID or the receipt.</p>
     <button type="submit" disabled={transferPending} className="flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-button bg-forest-850 px-5 font-semibold uppercase tracking-nav text-on-dark focus-ring disabled:cursor-not-allowed disabled:opacity-60">{transferPending?"Sending…":"I’ve made the transfer"}</button>
     <p className="text-xs text-ink-700">{bank.pendingNote}</p>
    </form>
   </div>
  )}
 </div>;
}
