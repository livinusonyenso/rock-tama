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
  | "customLabels"
  | "wholesale"
  | "franchise"
  | "ourStory"
  | "quality"
  | "contact"
  | "search"
  | "account"
  | "checkout"
  | "deliveryReturns"
  | "faqs"
  | "terms"
  | "privacy";

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
  | "image"
  | "bed"
  | "building"
  | "store"
  | "calendar"
  | "package-search"
  | "file-text"
  | "handshake"
  | "arrow-right"
  | "droplet"
  | "mountain-snow"
  | "waves"
  | "flask-conical"
  | "bug-off"
  | "clipboard-check"
  | "pause"
  | "play"
  | "chevron-right"
  | "map-pin"
  | "leaf"
  | "layers"
  | "mail"
  | "message-circle"
  | "quote"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "youtube"
  | "house"
  | "package"
  | "users"
  | "credit-card"
  | "chart-column"
  | "settings"
  | "bell"
  | "coins"
  | "triangle-alert"
  | "log-out"
  | "boxes"
  | "trending-up"
  | "trending-down"
  | "lock"
  | "eye"
  | "eye-off";

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
  /** Served logo derivative; source provenance lives in docs/assets. */
  src: AbsolutePath;
  alt: string;
  /** Intrinsic image dimensions (also reserve the fallback aspect ratio). */
  width: number;
  height: number;
  /** False when no supplied artwork is available; not a statement of client approval. */
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
    stacked: LogoAsset;
  };
  announcements: readonly AnnouncementMessage[];
};

/** Visual style of a call-to-action button (see components/ui/ButtonLink). */
export type ButtonVariant = "primary" | "outline-dark" | "outline-light";

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
  /** Optional crop focal point for photographic/illustrated landscape slots. */
  objectPosition?: string;
  fit?: "contain" | "cover";
  /** Evidence-dependent wording printed on supplied artwork; never implies verification. */
  claims?: readonly import("@/content/claims").ClaimId[];
};

export type HeroContent = {
  eyebrow: string;
  heading: string;
  tagline: string;
};

/** A short highlight (icon + label) backed by an entry in content/claims.ts. */
export type Highlight = {
  icon: IconName;
  /** Visible label; "\n" marks the reference's line break on wide screens. */
  label: string;
  claim: import("@/content/claims").ClaimId;
};

/** A price in minor-unit-free major currency units. `null` on a product = "Price on request" (D-066: never invent prices). */
export type Price = { amount: number; currency: "NGN" };

/**
 * standard = established ROCK-TAMA products; custom = customised/event water offerings;
 * future = possible future products (e.g. sachet water).
 */
export type ProductKind = "standard" | "custom" | "future";

/** Only "available" products are listed, sold or offered in forms (D-081). */
export type ProductStatus = "available" | "unconfirmed";

export type Product = {
  /** URL segment under /shop, e.g. "750ml-glass-bottle". */
  slug: string;
  kind: ProductKind;
  status: ProductStatus;
  /** Route key for this product's page (content/routes.ts); null when the product has no page. */
  route: RouteKey | null;
  name: string;
  /** Short label for compact controls, e.g. "750 ml". */
  shortName: string;
  /** Packaging description; only confirmed facts (pack sizes pending from the client). */
  packaging: string;
  summary: string;
  price: Price | null;
  media: MediaAsset;
  /** Optional image for the hero carousel frame (e.g. the reference's 2:5 hero bottle). */
  heroMedia?: MediaAsset;
};

/** A non-product offer shown as a card (e.g. Distributor Supply, a wholesale service). */
export type ServiceOffer = {
  title: string;
  text: string;
  media: MediaAsset;
  cta: { label: string; route: RouteKey };
  /** The reference shows this card's title in italics. */
  titleStyle?: "italic";
};

export type HomeProductsContent = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  /** Catalogue products in reference order, with their card CTA label. */
  products: readonly { slug: string; ctaLabel: string }[];
  distributorOffer: ServiceOffer;
};

/** Homepage origin data; geographic coordinate denotes the town, not the spring site. */
export type HomeOriginContent = {
  eyebrow: string;
  heading: string;
  description: string;
  media: MediaAsset;
  location: { latitude: number; longitude: number };
  indicators: readonly { icon: IconName; label: string; claim?: import("@/content/claims").ClaimId }[];
};
