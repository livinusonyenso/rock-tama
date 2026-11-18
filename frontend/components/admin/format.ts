/** Admin number formatting (D-128): whole naira and grouped counts. */
export const naira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
export const count = (n: number) => new Intl.NumberFormat("en-NG").format(n);
/** Compact axis labels: ₦1.2M, ₦300K. */
export const nairaShort = (amount: number) =>
  amount >= 1_000_000 ? `₦${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M` : amount >= 1000 ? `₦${Math.round(amount / 1000)}K` : `₦${amount}`;
