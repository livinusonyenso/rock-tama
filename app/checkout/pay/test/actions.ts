"use server";
import {allowReceiptDownload} from "@/lib/server/payments/receipt-access";
import { redirect } from "next/navigation";
import { getPaymentConfig } from "@/lib/server/payments/config";
import { notifyPaidOrder, verifyPayment } from "@/lib/server/payments/complete";
import { createTestToken, readTestToken } from "@/lib/server/payments/test-gateway";
import { clearPendingOrder } from "@/lib/server/payments/order-session";

/** Test gateway outcome (D-122). Plays the role of Paystack + its webhook; no money moves. */
export async function finishTestPayment(form: FormData) {
  const config = getPaymentConfig();
  const payment = config.kind === "test" ? readTestToken(config.secret, String(form.get("token") ?? "")) : null;
  const outcome = form.get("outcome");
  if (!payment || config.kind !== "test") redirect("/checkout/complete?reference=invalid");
  if (outcome === "cancel") redirect("/checkout/pay");
  const token = createTestToken(config.secret, { reference: payment.reference, amountKobo: payment.amountKobo, email: payment.email, metadata: payment.metadata, outcome: outcome === "success" ? "success" : "failed" });
  const verified = await verifyPayment(payment.reference, token, config);
  if (verified.status === "paid") {
    await notifyPaidOrder(verified);
    await clearPendingOrder();
    await allowReceiptDownload(payment.reference);
  }
  redirect(`/checkout/complete?reference=${encodeURIComponent(payment.reference)}&token=${encodeURIComponent(token)}`);
}
