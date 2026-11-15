import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { buttonClassName, buttonSizes } from "@/components/ui/button-styles";
import { navigationCopy } from "@/content/navigation";
import type { ButtonVariant, IconName } from "@/types/content";

type ButtonLinkProps = {
  /** From resolveHref(). null = destination not available: renders non-interactive (D-027). */
  href: string | null;
  variant: ButtonVariant;
  size?: keyof typeof buttonSizes;
  surface?: "dark" | "light";
  icon?: IconName;
  /** Icon after the label (e.g. "chevron-right" on card CTAs). */
  trailingIcon?: IconName;
  className?: string;
  children: ReactNode;
};

/** A link styled as a button (navigates; never performs an action). Server Component. */
export function ButtonLink({ href, variant, size = "md", surface = "dark", icon, trailingIcon, className = "", children }: ButtonLinkProps) {
  const content = (
    <>
      {icon && <Icon name={icon} strokeWidth={1.75} className="size-5 shrink-0 lg:size-6" />}
      <span>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} strokeWidth={2} className="-ml-1.5 size-4 shrink-0" />}
    </>
  );

  if (href === null) {
    // Transitional only: commercial CTAs must not ship in this state (D-067).
    return (
      <span data-pending="" className={`${buttonClassName(variant, { size, interactive: false })} ${className}`}>
        {content}
        <span className="sr-only normal-case"> ({navigationCopy.comingSoon})</span>
      </span>
    );
  }

  return (
    <Link href={href} className={`${buttonClassName(variant, { size, surface })} ${className}`}>
      {content}
    </Link>
  );
}
