import {allowReceiptDownload} from "@/lib/server/payments/receipt-access";
import { NextResponse, type NextRequest } from "next/server";
import { notifyPaidOrder, verifyPayment } from "@/lib/server/payments/complete";
import { PENDING_ORDER_COOKIE } from "@/lib/server/payments/order-session";

/**
 * Paystack returns the customer here (callback_url) with ?reference=… (D-122). Verify with Paystack's API,
 * send the paid-order notification once, then show the confirmation page (which verifies again, read-only).
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref") ?? "";
  const payment = await verifyPayment(reference);
  if (payment.status === "paid") {
    await notifyPaidOrder(payment);
    await allowReceiptDownload(payment.reference);
  }
  const target = new URL("/checkout/complete", request.nextUrl.origin);
  target.searchParams.set("reference", reference);
  const response = NextResponse.redirect(target, 303);
  if (payment.status === "paid") response.cookies.delete(PENDING_ORDER_COOKIE); // order complete (D-124)
  return response;
}
