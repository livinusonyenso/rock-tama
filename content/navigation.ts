import type { HeaderAction, NavItem } from "@/types/content";

/** Main header navigation, in reference order. Labels are title case; uppercase is applied in CSS. */
export const mainNav: readonly NavItem[] = [
  { label: "Home", route: "home" },
  {
    label: "Shop",
    route: "shop",
    children: [
      { label: "All Products", route: "shop" },
      { label: "750 ml Glass Bottle", route: "product750ml" },
      { label: "1.5 L Bottle", route: "product15l" },
      { label: "Carton Packs", route: "productCartons" },
    ],
  },
  { label: "Wholesale", route: "wholesale" },
  { label: "Our Story", route: "ourStory" },
  { label: "Quality", route: "quality" },
  { label: "Contact", route: "contact" },
];

/** Available header actions. Keep Search out until its planned route has a working page. */
export const headerActions: readonly HeaderAction[] = [
  { id: "account", label: "Distributor account", icon: "user", route: "account" },
  { id: "cart", label: "Cart", icon: "shopping-cart", route: "checkout" },
];

/** Shared copy for navigation states. */
export const navigationCopy = {
  /** Accessible suffix for items whose destination isn't available yet (D-027). */
  comingSoon: "Coming soon",
  /** Mobile menu button and drawer name. */
  menu: "Menu",
  closeMenu: "Close menu",
} as const;
