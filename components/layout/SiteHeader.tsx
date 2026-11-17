import { CartIndicator } from "@/components/shop/CartIndicator";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/icons/Icon";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileNavPanel } from "@/components/layout/MobileNavPanel";
import { NavLink } from "@/components/layout/NavLink";
import { ShopMenu } from "@/components/layout/ShopMenu";
import { Container } from "@/components/ui/Container";
import { headerActions, mainNav, navigationCopy } from "@/content/navigation";
import { site } from "@/content/site";
import { resolveHref, resolveNavChildren, resolveNavItem } from "@/lib/navigation";
import type { HeaderAction } from "@/types/content";

type SiteHeaderProps = {
  /** Runtime cart size (D-029). Supplied by the caller; the cart feature will provide it later. */
  cartCount: number;
};

// Nav item: uppercase Source Sans 3, with the gold active underline drawn by
// ::after so it never shifts layout. Compact spacing at lg, reference spacing at xl.
const navItemClass = [
  "relative inline-flex items-center gap-1 py-2 text-sm font-medium uppercase tracking-nav text-ink-900 xl:text-base",
  "after:absolute after:inset-x-0 after:bottom-1 after:h-0.75 after:bg-gold-700 after:opacity-0",
  "aria-[current=page]:after:opacity-100 data-current:after:opacity-100",
].join(" ");

/**
 * Main site header (UI_BREAKDOWN §02). Server Component; NavLink and MobileNav
 * are the only client islands. Below lg: logo · cart · menu button (D-053).
 */
export function SiteHeader({ cartCount }: SiteHeaderProps) {
  const homeHref = resolveHref("home");
  const logo = <Logo variant="header" className="h-12 xl:h-16" />;

  return (
    <header className="border-b border-line-light bg-ivory-100">
      {/* xl:pl-header-inset: fluid left inset, 32px at 1280 → 92px at 1440 as measured in the reference (V-008) */}
      <Container size="wide" className="flex h-header-sm items-center justify-between gap-6 lg:h-header xl:pl-header-inset">
        {homeHref ? (
          <Link href={homeHref} aria-label={`${site.name} home`} className="focus-ring shrink-0">
            {logo}
          </Link>
        ) : (
          logo
        )}

        <div className="flex items-center">
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-12">
              {mainNav.map((item) => {
                const children = resolveNavChildren(item);
                const parentHref = resolveHref(item.route);
                const chevron = <Icon name="chevron-down" strokeWidth={2} className="size-3.5" />;
                return (
                  <li key={item.label}>
                    {item.children && children.length > 0 && parentHref ? (
                      <ShopMenu label={item.label} parentHref={parentHref} items={children} triggerClassName={navItemClass} chevron={chevron} />
                    ) : (
                      <NavLink href={resolveNavItem(item)} className={navItemClass}>
                        {item.label}
                        {item.children && chevron}
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <span aria-hidden="true" className="hidden h-7 w-0.5 bg-gold-600 lg:ml-8 lg:mr-6 lg:block xl:ml-10 xl:mr-9" />

          <ul className="flex items-center gap-5 xl:mr-2 xl:gap-7">
            {headerActions.map((action) => (
              // Search and account move into the mobile drawer below lg; the cart stays.
              <li key={action.id} className={action.id === "cart" ? undefined : "hidden lg:block"}>
                <HeaderActionItem action={action} href={resolveHref(action.route)} cartCount={cartCount} />
              </li>
            ))}
          </ul>

          <div className="ml-4 lg:hidden">
            <MobileNav
              label={navigationCopy.menu}
              closeLabel={navigationCopy.closeMenu}
              openIcon={<Icon name="menu" strokeWidth={1.75} className="size-7" />}
              closeIcon={<Icon name="x" strokeWidth={1.75} className="size-7" />}
            >
              <MobileNavPanel />
            </MobileNav>
          </div>
        </div>
      </Container>
    </header>
  );
}

type HeaderActionItemProps = {
  action: HeaderAction;
  href: string | null;
  cartCount: number;
};

/** Icon-only action. Links when its route resolves; otherwise non-interactive with "coming soon" text. */
function HeaderActionItem({ action, href, cartCount }: HeaderActionItemProps) {
  const isCart = action.id === "cart";
  if (isCart && href) return <CartIndicator href={href} label={action.label} icon={<Icon name={action.icon} strokeWidth={1.75} className="size-6 xl:size-6.5" />} />;
  const name = isCart ? `${action.label}, ${cartCount} ${cartCount === 1 ? "item" : "items"}` : action.label;

  const content = (
    <>
      <Icon name={action.icon} strokeWidth={1.75} className="size-6 xl:size-6.5" />
      {isCart && (
        <span
          aria-hidden="true"
          className="absolute -top-3.5 -right-2.5 flex size-6 items-center justify-center rounded-full bg-gold-700 text-xs font-semibold text-white"
        >
          {cartCount}
        </span>
      )}
      <span className="sr-only">{href ? name : `${name} (${navigationCopy.comingSoon})`}</span>
    </>
  );

  const base = "relative flex text-forest-heading";

  return href ? (
    <Link href={href} className={`focus-ring hover:text-gold-700 ${base}`}>
      {content}
    </Link>
  ) : (
    <span className={`cursor-default ${base}`}>{content}</span>
  );
}
