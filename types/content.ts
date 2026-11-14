/**
 * Shared types for static site content (D-005).
 * Content modules in `content/` hold plain, serialisable data typed by these
 * definitions, so it can be passed from Server to Client Components.
 */

/** Every route in the route plan (D-015). Adding one requires a `routes` entry. */
export type RouteKey =
  | "home"
  | "shop"
  | "product750ml"
  | "product15l"
  | "productCartons"
  | "wholesale"
  | "ourStory"
  | "quality"
  | "contact"
  | "search"
  | "account"
  | "cart";

/** Homepage sections that can serve as interim anchor destinations. The id is also the section's DOM id. */
export type HomeSectionId = "products" | "origin" | "quality" | "wholesale";

export type AbsolutePath = `/${string}`;

/**
 * A route is either live (its page exists) or planned. A planned route may name
 * a homepage section to use as an interim destination once that section is built (D-026).
 */
export type RouteDefinition =
  | { status: "live"; path: AbsolutePath }
  | { status: "planned"; path: AbsolutePath; interimSection?: HomeSectionId };

export type HomeSection = {
  /** Set to true only in the same change that renders the section with this id. */
  built: boolean;
};

/** Icon names map to `lucide-react` icons in the presentation layer (D-008). Strings keep content serialisable. */
export type IconName =
  | "truck"
  | "globe"
  | "search"
  | "user"
  | "shopping-cart"
  | "chevron-down"
  | "menu"
  | "x"
  | "warehouse"
  | "image";

export type NavLinkItem = {
  label: string;
  route: RouteKey;
};

export type NavItem = NavLinkItem & {
  /** Dropdown entries (e.g. Shop). */
  children?: readonly NavLinkItem[];
};

export type HeaderActionId = "search" | "account" | "cart";

export type HeaderAction = {
  id: HeaderActionId;
  /** Accessible name; these controls are icon-only. */
  label: string;
  icon: IconName;
  route: RouteKey;
};

/** 1 = shown at every screen size; higher numbers are dropped first on narrow screens. */
export type AnnouncementPriority = 1 | 2 | 3;

export type AnnouncementMessage = {
  id: string;
  text: string;
  icon?: IconName;
  /** Side of the bar on wider screens, as in the reference. */
  placement: "start" | "end";
  priority: AnnouncementPriority;
};

export type LogoAsset = {
  /** Planned path for the official file (D-020). */
  src: AbsolutePath;
  alt: string;
  /** Placeholder box size in px, estimated from the reference; replace with the SVG's real dimensions. */
  width: number;
  height: number;
  /** False until the owner supplies the official file; a same-size placeholder renders meanwhile. */
  available: boolean;
};

export type SiteConfig = {
  /** Official brand name (D-017). */
  name: string;
  /** Hero-only visual treatment without the hyphen (D-017). */
  heroDisplayName: string;
  productLine: string;
  title: string;
  description: string;
  location: {
    locality: string;
    region: string;
    country: string;
  };
  logos: {
    horizontal: LogoAsset;
    stackedLight: LogoAsset;
  };
  announcements: readonly AnnouncementMessage[];
};

/** Visual style of a call-to-action button (see components/ui/ButtonLink). */
export type ButtonVariant = "primary" | "outline-dark";

/** A call to action whose destination is resolved through the route registry (never a raw href). */
export type CallToAction = {
  label: string;
  route: RouteKey;
  icon?: IconName;
  variant: ButtonVariant;
};

/** An image slot. `src: null` renders a same-size placeholder (MediaFrame). */
export type MediaAsset = {
  /** Visible placeholder label, e.g. "Hero Product Image". */
  label: string;
  /** Alt text for the real image. */
  alt: string;
  src: AbsolutePath | null;
  /** CSS aspect-ratio, width/height, e.g. "2/5". */
  aspect: `${number}/${number}`;
  /** Placeholder outline. "bottle" = generic bottle silhouette (D-068). */
  shape?: "rect" | "bottle";
};

export type HeroContent = {
  eyebrow: string;
  heading: string;
  tagline: string;
  description: string;
  actions: readonly CallToAction[];
  media: MediaAsset;
};

/** A price in minor-unit-free major currency units. `null` on a product = "Price on request" (D-066: never invent prices). */
export type Price = { amount: number; currency: "NGN" };

export type Product = {
  /** URL segment under /shop, e.g. "750ml-glass-bottle". */
  slug: string;
  /** Route key for this product's page (content/routes.ts). */
  route: RouteKey;
  name: string;
  /** Short label for compact controls, e.g. "750 ml". */
  shortName: string;
  summary: string;
  price: Price | null;
  media: MediaAsset;
};
