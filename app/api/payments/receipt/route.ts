import {verifyPayment} from "@/lib/server/payments/complete";
import {canDownloadReceipt} from "@/lib/server/payments/receipt-access";
import {receiptPdf} from "@/lib/server/payments/receipt-pdf";
/** POST avoids putting signed test tokens/customer details into another URL. No email is sent here. */
export async function POST(request:Request){
 const form=await request.formData();const reference=String(form.get("reference")??"");
 if(!/^RT-PAY-\d{8}-[A-Z0-9]{8}$/.test(reference)||!await canDownloadReceipt(reference))return Response.json({error:"Open this receipt in the browser used for your payment. The download session may have expired."},{status:403,headers:{"Cache-Control":"private, no-store"}});
 const payment=await verifyPayment(reference,String(form.get("token")??""));
 if(payment.status!=="paid")return Response.json({error:"A receipt is available only after payment is verified."},{status:403,headers:{"Cache-Control":"private, no-store"}});
 return new Response(new Uint8Array(receiptPdf(payment)),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="ROCK-TAMA-${reference}.pdf"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
}
