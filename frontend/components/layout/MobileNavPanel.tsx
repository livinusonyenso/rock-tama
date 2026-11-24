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
 * desktop header. Shop uses a native disclosure for its product links.
 */
export function MobileNavPanel() {
  return (
    <>
      <nav aria-label="Main">
        <ul className="divide-y divide-line-dark/40 border-y border-line-dark/40">
          {mainNav.map((item) => {
            const children = resolveNavChildren(item);
            if (item.children && children.length > 0) {
              const labelId = `mobile-${item.route}-label`;
              return (
                <li key={item.label}>
                  <details className="group">
                    <summary id={labelId} className={`${mainRowClass} focus-ring-dark cursor-pointer list-none pr-3 hover:text-gold-500 [&::-webkit-details-marker]:hidden`}>
                      {item.label}
                      <Icon name="chevron-down" strokeWidth={2} className="size-5 shrink-0 text-gold-500 group-open:rotate-180 motion-safe:transition-transform" />
                    </summary>
                    <ul aria-labelledby={labelId} className="ml-4 border-l border-line-dark/40 pb-2 pl-3">
                      {children.map((child) => (
                        <li key={child.href}>
                          <NavLink href={child.href} tone="dark" className={childRowClass}>
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </details>
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
