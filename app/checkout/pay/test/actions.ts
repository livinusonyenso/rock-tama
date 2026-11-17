"use server";
import { redirect } from "next/navigation";
import { getPaymentConfig } from "@/lib/server/payments/config";
import { notifyPaidOrder, verifyPayment } from "@/lib/server/payments/complete";
import { createTestToken, readTestToken } from "@/lib/server/payments/test-gateway";

/** Test gateway outcome (D-122). Plays the role of Paystack + its webhook; no money moves. */
export async function finishTestPayment(form: FormData) {
  const config = getPaymentConfig();
  const payment = config.kind === "test" ? readTestToken(config.secret, String(form.get("token") ?? "")) : null;
  const outcome = form.get("outcome");
  if (!payment || config.kind !== "test") redirect("/checkout/complete?reference=invalid");
  if (outcome === "cancel") redirect("/checkout");
  const { expires: _expires, ...rest } = payment;
  void _expires;
  const token = createTestToken(config.secret, { ...rest, outcome: outcome === "success" ? "success" : "failed" });
  const verified = await verifyPayment(payment.reference, token, config);
  if (verified.status === "paid") await notifyPaidOrder(verified);
  redirect(`/checkout/complete?reference=${encodeURIComponent(payment.reference)}&token=${encodeURIComponent(token)}`);
}
