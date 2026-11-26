import type { ButtonVariant } from "@/types/content";

// Hover/press feedback follows docs/ANIMATION_SYSTEM.md: colour + shadow + at most a 1px lift,
// 150ms; the lift is removed with reduced motion. Shared by ButtonLink (<a>) and form <button>s.
const base =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-button font-semibold uppercase tracking-nav transition-[background-color,border-color,box-shadow,filter,translate] duration-150 ease-standard";
const interactive = "hover:-translate-y-px active:translate-y-0 motion-reduce:hover:translate-y-0";

const variants: Record<ButtonVariant, { look: string; hover: string }> = {
  primary: { look: "bg-gold-gradient text-ink-900 shadow-gold", hover: "hover:shadow-gold-hover hover:brightness-105" },
  "outline-dark": { look: "border border-gold-500 text-on-dark", hover: "hover:border-gold-400 hover:bg-gold-500/10" },
  // Reference product-card buttons: gold outline on cream; text in gold-700 for contrast.
  "outline-light": { look: "border border-gold-600 bg-transparent text-gold-700", hover: "hover:border-gold-700 hover:bg-gold-600/10" },
};

export const buttonSizes = { md: "min-h-13 px-7 text-sm lg:px-8 lg:text-lg", sm: "min-h-11 px-5 text-sm" } as const;

type Options = {
  size?: keyof typeof buttonSizes;
  /** Surface the button sits on; selects the accessible focus ring (D-047). */
  surface?: "dark" | "light";
  /** false = pending/non-interactive look (no hover, no focus ring). */
  interactive?: boolean;
};

export function buttonClassName(variant: ButtonVariant, { size = "md", surface = "dark", interactive: isInteractive = true }: Options = {}) {
  const v = variants[variant];
  const focus = surface === "dark" ? "focus-ring-dark" : "focus-ring";
  return [base, v.look, buttonSizes[size], isInteractive ? `${v.hover} ${focus} ${interactive}` : "cursor-default"].join(" ");
}
