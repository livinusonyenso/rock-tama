type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  /** Surface the heading sits on. */
  tone?: "light" | "dark";
  /** Short gold rules on both sides of the eyebrow (reference §5). */
  eyebrowLines?: boolean;
  /** Description in italic serif (reference §5 subtitle) instead of sans. */
  descriptionStyle?: "sans" | "serif-italic";
};

/** Eyebrow + H2 + optional description (COMPONENT_ARCHITECTURE §5). Server Component. */
export function SectionHeading({ id, eyebrow, title, description, align = "center", tone = "light", eyebrowLines = false, descriptionStyle = "sans" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p
        className={`font-semibold uppercase tracking-eyebrow ${tone === "light" ? "text-gold-700" : "text-gold-500"} ${eyebrowLines ? "flex items-center justify-center gap-3 text-base" : "text-eyebrow"}`}
      >
        {eyebrowLines && <span aria-hidden="true" className="h-px w-12 bg-gold-600" />}
        {eyebrow}
        {eyebrowLines && <span aria-hidden="true" className="h-px w-12 bg-gold-600" />}
      </p>
      <h2
        id={id}
        className={`${eyebrowLines ? "mt-1.5" : "mt-3"} font-serif text-4xl font-bold uppercase lg:text-section ${tone === "light" ? "text-ink-900" : "text-on-dark"}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`${descriptionStyle === "serif-italic" ? "mt-1 font-serif text-xl font-medium italic lg:text-subtitle" : "mt-4 text-lg"} ${tone === "light" ? "text-ink-700" : "text-on-dark-muted"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
