import type { IconName } from "@/types/content";

/**
 * Admin portal navigation and copy (D-128). Only the dashboard exists so far; other sections render as
 * non-interactive "Coming soon" rows (no dead links), as on the storefront (D-026/D-027).
 */
export type AdminNavItem = { label: string; icon: IconName; href: string | null; badge?: "orders" | "enquiries"; group?: boolean };

export const adminNav: readonly AdminNavItem[] = [
  { label: "Dashboard", icon: "house", href: "/admin" },
  { label: "Orders", icon: "shopping-cart", href: null, badge: "orders" },
  { label: "Products", icon: "package", href: null },
  { label: "Inventory", icon: "layers", href: null },
  { label: "Customers", icon: "users", href: null },
  { label: "Wholesale Enquiries", icon: "handshake", href: null, badge: "enquiries" },
  { label: "Payments", icon: "credit-card", href: null },
  { label: "Reports", icon: "chart-column", href: null, group: true },
  { label: "Settings", icon: "settings", href: null, group: true },
];

export const adminCopy = {
  portal: "Admin portal",
  welcome: "Welcome back,",
  title: "Rock Tama Admin",
  subtitle: "Manage sales, orders, inventory and wholesale for Rock Tama Natural Spring Water.",
  demoNotice: "Demo data: no order database is connected yet, so these figures are illustrative.",
  comingSoon: "Coming soon",
} as const;
