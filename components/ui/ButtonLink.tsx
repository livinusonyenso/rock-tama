import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { navigationCopy } from "@/content/navigation";
import type { ButtonVariant, IconName } from "@/types/content";

// Hover/press feedback follows docs/ANIMATION_SYSTEM.md: colour + shadow + at most a 1px
// lift, 150ms; the lift is removed with reduced motion.
const base =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-button font-semibold uppercase tracking-nav transition-[background-color,border-color,box-shadow,filter,translate] duration-150 ease-standard";
const interactive = "hover:-translate-y-px active:translate-y-0 motion-reduce:hover:translate-y-0";

const variants: Record<ButtonVariant, { look: string; hover: string; focus: string }> = {
  primary: {
    look: "bg-gold-gradient text-ink-900 shadow-gold",
    hover: "hover:shadow-gold-hover hover:brightness-105",
    focus: "focus-ring-dark", // used on dark-green surfaces (hero, wholesale banner)
  },
  "outline-dark": {
    look: "border border-gold-500 text-on-dark",
    hover: "hover:border-gold-400 hover:bg-gold-500/10",
    focus: "focus-ring-dark",
  },
};

const sizes = {
  md: "min-h-13 px-7 text-sm lg:px-8 lg:text-lg",
} as const;

type ButtonLinkProps = {
  /** From resolveHref(). null = destination not available: renders non-interactive (D-027). */
  href: string | null;
  variant: ButtonVariant;
  size?: keyof typeof sizes;
  icon?: IconName;
  className?: string;
  children: ReactNode;
};

/** A link styled as a button (navigates; never performs an action). Server Component. */
export function ButtonLink({ href, variant, size = "md", icon, className = "", children }: ButtonLinkProps) {
  const v = variants[variant];
  const content = (
    <>
      {icon && <Icon name={icon} strokeWidth={1.75} className="size-5 shrink-0 lg:size-6" />}
      <span>{children}</span>
    </>
  );

  if (href === null) {
    // Transitional only: commercial CTAs must not ship in this state (D-067).
    return (
      <span data-pending="" className={`${base} ${v.look} ${sizes[size]} cursor-default ${className}`}>
        {content}
        <span className="sr-only normal-case"> ({navigationCopy.comingSoon})</span>
      </span>
    );
  }

  return (
    <Link href={href} className={`${base} ${v.look} ${v.hover} ${v.focus} ${interactive} ${sizes[size]} ${className}`}>
      {content}
    </Link>
  );
}
