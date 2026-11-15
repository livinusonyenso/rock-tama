import type { ComponentType, SVGProps } from "react";
import {
  ArrowRight,
  MapPin,
  Leaf,
  Layers,
  BedDouble,
  BugOff,
  ClipboardCheck,
  Droplet,
  FlaskConical,
  MountainSnow,
  Pause,
  Play,
  Waves,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileText,
  Handshake,
  ImageIcon,
  Menu,
  PackageSearch,
  Search,
  ShoppingCart,
  Store,
  Truck,
  User,
  Warehouse,
  X,
} from "lucide-react";
import { GlobeFilled } from "@/components/icons/GlobeFilled";
import type { IconName } from "@/types/content";

// Lucide icons and custom SVG icons (e.g. GlobeFilled) share this shape.
type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number | string }>;

// Record<IconName, …> makes the map exhaustive: adding a name to IconName
// without an icon here is a compile error.
const icons: Record<IconName, IconComponent> = {
  "map-pin": MapPin,
  leaf: Leaf,
  layers: Layers,
  truck: Truck,
  globe: GlobeFilled, // filled to match the reference (V-001; Heroicons, MIT)
  search: Search,
  user: User,
  "shopping-cart": ShoppingCart,
  "chevron-down": ChevronDown,
  menu: Menu,
  x: X,
  warehouse: Warehouse,
  image: ImageIcon,
  bed: BedDouble,
  building: Building2,
  store: Store,
  calendar: CalendarDays,
  "package-search": PackageSearch,
  "file-text": FileText,
  handshake: Handshake,
  "arrow-right": ArrowRight,
  droplet: Droplet,
  "mountain-snow": MountainSnow,
  waves: Waves,
  "flask-conical": FlaskConical,
  "bug-off": BugOff, // approximation of the reference's crossed-out microbe
  "clipboard-check": ClipboardCheck,
  pause: Pause,
  play: Play,
  "chevron-right": ChevronRight,
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
