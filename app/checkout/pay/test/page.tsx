import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { finishTestPayment } from "@/app/checkout/pay/test/actions";
import { getPaymentConfig } from "@/lib/server/payments/config";
import { naira, priceBasket } from "@/lib/server/payments/order";
import { readTestToken } from "@/lib/server/payments/test-gateway";

export const metadata: Metadata = { title: "Test payment", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ token?: string }> };

/** Built-in test gateway (D-122): stands in for Paystack's hosted page until PAYSTACK_SECRET_KEY is set. */
export default function TestPaymentPage({ searchParams }: Props) {
  return (
    <main id="main" className="flex-1 bg-ivory-50">
      <Container className="py-12 lg:py-16">
        <Suspense fallback={<p>Loading test payment…</p>}>
          <TestPayment searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function TestPayment({ searchParams }: Props) {
  const { token } = await searchParams;
  const config = getPaymentConfig();
  const payment = config.kind === "test" ? readTestToken(config.secret, token) : null;
  if (!payment) {
    return (
      <div className="rounded-card border border-line-card bg-cream-200 p-8">
        <h1 className="font-serif text-4xl font-bold text-forest-850">Test payment unavailable</h1>
        <p className="mt-3">This test payment link is invalid or has expired.</p>
        <Link href="/checkout" className="mt-5 inline-block text-gold-700 underline">Return to checkout</Link>
      </div>
    );
  }
  const basket = priceBasket(payment.metadata.lines);
  return (
    <div className="mx-auto max-w-xl">
      <p data-test-gateway className="rounded-button bg-gold-700 px-4 py-3 text-center text-sm font-semibold text-white">
        TEST PAYMENT — no money is charged. Add your Paystack keys to take real payments.
      </p>
      <section aria-labelledby="test-pay-heading" className="mt-6 rounded-card border border-line-card bg-cream-200 p-6 shadow-card lg:p-8">
        <h1 id="test-pay-heading" className="font-serif text-4xl font-bold text-forest-850">Pay {naira(payment.amountKobo)}</h1>
        <p className="mt-1 text-sm text-ink-700">Reference {payment.reference} · {payment.email}</p>
        <ul className="mt-5 space-y-1 border-t border-line-card pt-4 text-sm">
          {basket.lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-3"><span>{line.quantity} × {line.label} ({line.detail})</span><span className="font-semibold">{naira(line.lineKobo ?? 0)}</span></li>
          ))}
        </ul>
        <form action={finishTestPayment} className="mt-6 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="token" value={token} />
          <button name="outcome" value="success" className="min-h-12 cursor-pointer rounded-button bg-forest-850 px-4 font-semibold text-on-dark focus-ring">Simulate successful payment</button>
          <button name="outcome" value="failed" className="min-h-12 cursor-pointer rounded-button border border-error px-4 font-semibold text-error focus-ring">Simulate failed payment</button>
          <button name="outcome" value="cancel" className="min-h-12 cursor-pointer rounded-button border border-line-card px-4 text-sm focus-ring sm:col-span-2">Cancel and return to checkout</button>
        </form>
      </section>
    </div>
  );
}
