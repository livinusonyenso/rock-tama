import { NextResponse, type NextRequest } from "next/server";
import { getPaymentConfig } from "@/lib/server/payments/config";
import { notifyPaidOrder, verifyPayment } from "@/lib/server/payments/complete";
import { isValidWebhookSignature } from "@/lib/server/payments/paystack";

/**
 * Paystack webhook (D-122): set https://<your-domain>/api/payments/paystack/webhook in the Paystack dashboard.
 * Confirms payments even if the customer never returns to the site. The signature proves the request came from
 * Paystack; the payment itself is still re-verified through the API (the payload is never trusted alone).
 */
export async function POST(request: NextRequest) {
  const config = getPaymentConfig();
  if (config.kind !== "paystack") return NextResponse.json({ error: "Paystack is not configured." }, { status: 404 });
  const raw = await request.text();
  if (!isValidWebhookSignature(config.secretKey, raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }
  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  if (event.event === "charge.success" && event.data?.reference) {
    const payment = await verifyPayment(event.data.reference, null, config);
    // 500 makes Paystack retry later if the notification could not be delivered.
    if (payment.status === "paid" && !(await notifyPaidOrder(payment))) return NextResponse.json({ error: "Notification failed." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
