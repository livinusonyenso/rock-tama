type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  /** Surface the heading sits on. */
  tone?: "light" | "dark";
};

/** Eyebrow + H2 + optional description (COMPONENT_ARCHITECTURE §5). Server Component. */
export function SectionHeading({ id, eyebrow, title, description, align = "center", tone = "light" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`text-eyebrow font-semibold uppercase tracking-eyebrow ${tone === "light" ? "text-gold-700" : "text-gold-500"}`}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-3 font-serif text-4xl font-semibold uppercase lg:text-section ${tone === "light" ? "text-ink-900" : "text-on-dark"}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg ${tone === "light" ? "text-ink-700" : "text-on-dark-muted"}`}>{description}</p>
      )}
    </div>
  );
}
