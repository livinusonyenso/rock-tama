/**
 * Payment page copy and bank-transfer details (D-124).
 * PLACEHOLDER bank details until the owner supplies the real account: replace the values and set
 * `placeholder: false`. While `placeholder` is true the page labels them as demo details and strict
 * production launches are blocked (content/launch.ts).
 */
export const payment = {
  title: "Payment",
  intro: "Choose how you’d like to pay for your order.",
  card: {
    title: "Pay with card",
    text: "Visa, Mastercard and Verve. Your card is processed securely by Paystack; card details never touch this site.",
  },
  transfer: {
    title: "Bank transfer",
    text: "Transfer the exact amount to our account, then send us the transaction ID or your receipt.",
    placeholder: true,
    placeholderNotice: "Demo account details: the real bank account will be added before launch. Don’t transfer money to this account.",
    bankName: "Demo Bank",
    accountName: "ROCK-TAMA (demo account)",
    accountNumber: "0000000000",
    pendingNote: "We’ll confirm your transfer with our bank before preparing your order. This usually takes a few working hours.",
  },
  /** Receipt uploads: images or PDF, up to 4 MB (Vercel limits request bodies to 4.5 MB). */
  receipt: { maxBytes: 4 * 1024 * 1024, accept: "image/png,image/jpeg,image/webp,application/pdf" },
} as const;
