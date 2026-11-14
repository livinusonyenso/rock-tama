import { ChevronDown, Globe, Search, ShoppingCart, Truck, User, type LucideIcon } from "lucide-react";
import type { IconName } from "@/types/content";

// Record<IconName, …> makes the map exhaustive: adding a name to IconName
// without an icon here is a compile error.
const icons: Record<IconName, LucideIcon> = {
  truck: Truck,
  globe: Globe,
  search: Search,
  user: User,
  "shopping-cart": ShoppingCart,
  "chevron-down": ChevronDown,
};

type IconProps = {
  name: IconName;
  className?: string;
  strokeWidth?: number;
};

/**
 * Renders a content icon name as a Lucide icon (D-008). Always decorative:
 * every icon in this design sits beside visible text or inside a control
 * that carries its own accessible name.
 */
export function Icon({ name, className, strokeWidth = 1.5 }: IconProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" className={className} strokeWidth={strokeWidth} />;
}
