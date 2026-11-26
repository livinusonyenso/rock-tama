import type { ReactNode } from "react";

const widths = {
  content: "max-w-content", // 1200px: hero, origin
  wide: "max-w-wide", // 1320px: announcement bar, header, product grid, banner, footer
} as const;

type ContainerProps = {
  size?: keyof typeof widths;
  className?: string;
  children: ReactNode;
};

/** Centres content at a design-system max width with responsive side gutters (16 / 24 / 32px). */
export function Container({ size = "content", className, children }: ContainerProps) {
  return (
    <div
      className={["mx-auto w-full px-4 md:px-6 lg:px-8", widths[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
