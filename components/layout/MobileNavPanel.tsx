import { Icon } from "@/components/icons/Icon";
import { NavLink } from "@/components/layout/NavLink";
import { headerActions, mainNav } from "@/content/navigation";
import { resolveHref, resolveNavItem } from "@/lib/navigation";

// Main rows: Cormorant Garamond, 48px+ touch targets, gold bar on the current page.
const mainRowClass = [
  "relative flex min-h-12 items-center justify-between gap-4 py-2 pl-4 font-serif text-2xl font-semibold text-on-dark",
  "before:absolute before:inset-y-2 before:left-0 before:w-0.75 before:bg-gold-500 before:opacity-0",
  "aria-[current=page]:before:opacity-100 data-pending:text-on-dark-muted",
].join(" ");

const secondaryRowClass =
  "flex min-h-12 items-center justify-between gap-4 py-2 pl-4 text-base text-on-dark data-pending:text-on-dark-muted";

// Search and account live in the drawer on mobile; the cart stays in the header.
const drawerActions = headerActions.filter((action) => action.id !== "cart");

/**
 * Drawer contents (Server Component, passed to MobileNav as children so it adds
 * no client JavaScript beyond NavLink). Uses the same data and resolvers as the
 * desktop header. Shop's nested items arrive with M2.5b (resolveNavItem guard).
 */
export function MobileNavPanel() {
  return (
    <>
      <nav aria-label="Main">
        <ul className="divide-y divide-line-dark/40 border-y border-line-dark/40">
          {mainNav.map((item) => (
            <li key={item.label}>
              <NavLink href={resolveNavItem(item)} tone="dark" pendingLabel="visible" className={mainRowClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="mt-6 divide-y divide-line-dark/40 border-y border-line-dark/40">
        {drawerActions.map((action) => (
          <li key={action.id}>
            <NavLink href={resolveHref(action.route)} tone="dark" pendingLabel="visible" className={secondaryRowClass}>
              <span className="flex items-center gap-3">
                <Icon name={action.icon} strokeWidth={1.75} className="size-5 text-gold-500" />
                {action.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  );
}
