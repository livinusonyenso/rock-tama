import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClearBasket } from "@/components/shop/ClearBasket";
import { Container } from "@/components/ui/Container";
import { verifyPayment } from "@/lib/server/payments/complete";
import { naira } from "@/lib/server/payments/order";

export const metadata: Metadata = { title: "Payment status", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ reference?: string; token?: string }> };

/** Payment confirmation (D-122): shows only what the provider verified. Never "successful" on the browser's word. */
export default function PaymentCompletePage({ searchParams }: Props) {
  return (
    <main id="main" className="flex-1 bg-ivory-50">
      <Container className="py-12 lg:py-16">
        <Suspense fallback={<p role="status">Checking your payment…</p>}>
          <PaymentResult searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function PaymentResult({ searchParams }: Props) {
  const { reference = "", token } = await searchParams;
  const payment = await verifyPayment(reference, token);
  if (payment.status === "paid") {
    return (
      <section data-payment-status="paid" aria-labelledby="payment-heading" className="mx-auto max-w-2xl rounded-card bg-forest-850 p-8 text-on-dark">
        <ClearBasket />
        {payment.test && <p className="mb-4 rounded-button bg-gold-700 px-3 py-2 text-sm font-semibold">Test payment — no money was charged.</p>}
        <h1 id="payment-heading" className="font-serif text-4xl font-bold">Payment successful</h1>
        <p className="mt-3">Thank you, {payment.metadata.customer.name}. We’ve received {naira(payment.amountKobo)} for your order.</p>
        <p className="mt-2">Reference: <strong data-payment-reference>{payment.reference}</strong></p>
        <ul className="mt-5 space-y-1 border-t border-line-dark/50 pt-4 text-sm">
          {payment.basket.lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-3"><span>{line.quantity} × {line.label} ({line.detail})</span><span>{naira(line.lineKobo ?? 0)}</span></li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-on-dark-muted">Our team will contact you at {payment.metadata.customer.email} to arrange delivery. Any delivery fee is agreed with you separately.</p>
        <Link href="/shop" className="mt-6 inline-block text-gold-500 underline">Continue shopping</Link>
      </section>
    );
  }
  const message = {
    failed: "Your payment was not completed and you have not been charged. Your basket has been kept.",
    pending: "We couldn’t confirm your payment yet. If money left your account, don’t pay again: contact us with your reference and we’ll check it.",
    invalid: payment.status === "invalid" ? payment.reason : "",
  }[payment.status];
  return (
    <section data-payment-status={payment.status} aria-labelledby="payment-heading" className="mx-auto max-w-2xl rounded-card border border-line-card bg-cream-200 p-8">
      <h1 id="payment-heading" className="font-serif text-4xl font-bold text-forest-850">{payment.status === "failed" ? "Payment not completed" : "Payment not confirmed"}</h1>
      <p className="mt-3">{message}</p>
      {payment.reference && payment.status !== "invalid" && <p className="mt-2 text-sm">Reference: {payment.reference}</p>}
      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/checkout" className="rounded-button bg-forest-850 px-5 py-3 font-semibold text-on-dark focus-ring">Return to checkout</Link>
        <Link href="/contact" className="py-3 text-gold-700 underline">Contact us</Link>
      </div>
    </section>
  );
}
