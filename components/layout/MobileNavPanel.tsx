import { Icon } from "@/components/icons/Icon";
import { NavLink } from "@/components/layout/NavLink";
import { headerActions, mainNav } from "@/content/navigation";
import { resolveHref, resolveNavChildren, resolveNavItem } from "@/lib/navigation";

// Main rows: Cormorant Garamond, 48px+ touch targets, gold bar on the current page.
const mainRowClass = [
  "relative flex min-h-12 items-center justify-between gap-4 py-2 pl-4 font-serif text-2xl font-semibold text-on-dark",
  "before:absolute before:inset-y-2 before:left-0 before:w-0.75 before:bg-gold-500 before:opacity-0",
  "aria-[current=page]:before:opacity-100 data-pending:text-on-dark-muted",
].join(" ");

// Indented dropdown children (e.g. Shop products): sans, 18px, 44px rows, gold bar for the current page.
const childRowClass = [
  "relative flex min-h-11 items-center py-1.5 pl-4 font-sans text-lg text-on-dark",
  "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-gold-500 before:opacity-0 aria-[current=page]:before:opacity-100",
].join(" ");

const secondaryRowClass =
  "flex min-h-12 items-center justify-between gap-4 py-2 pl-4 text-base text-on-dark data-pending:text-on-dark-muted";

// Account lives in the drawer on mobile; the cart stays in the header.
const drawerActions = headerActions.filter((action) => action.id !== "cart");

/**
 * Drawer contents (Server Component, passed to MobileNav as children so it adds
 * no client JavaScript beyond NavLink). Uses the same data and resolvers as the
 * desktop header. Dropdown items (Shop) render their available children as an indented list (F2).
 */
export function MobileNavPanel() {
  return (
    <>
      <nav aria-label="Main">
        <ul className="divide-y divide-line-dark/40 border-y border-line-dark/40">
          {mainNav.map((item) => {
            const children = resolveNavChildren(item);
            if (item.children && children.length > 0) {
              // Dropdown items become a labelled group with an indented list of their available links.
              return (
                <li key={item.label}>
                  <p id={`mobile-${item.label}`} className={`${mainRowClass} cursor-default`}>
                    {item.label}
                  </p>
                  <ul aria-labelledby={`mobile-${item.label}`} className="pb-3 pl-8">
                    {children.map((child) => (
                      <li key={child.href}>
                        <NavLink href={child.href} tone="dark" className={childRowClass}>
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }
            return (
              <li key={item.label}>
                <NavLink href={resolveNavItem(item)} tone="dark" pendingLabel="visible" className={mainRowClass}>
                  {item.label}
                </NavLink>
              </li>
            );
          })}
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
