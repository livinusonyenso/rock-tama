import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";
import type { AnnouncementPriority } from "@/types/content";

// Content declares importance; this component decides where each level appears.
// Lower-priority messages are hidden on narrow screens so the bar stays one line.
// If the user enlarges text beyond what fits, items wrap rather than truncate,
// so no content is lost (WCAG 1.4.4).
const visibilityByPriority: Record<AnnouncementPriority, string> = {
  1: "flex", // all sizes
  2: "hidden sm:flex", // from 640px
  3: "hidden xl:flex", // from 1280px
};

const divider = "before:h-3 before:w-px before:shrink-0 before:bg-line-dark-strong lg:before:h-4";
const itemLayout = "flex min-w-0 items-center gap-2.5 lg:gap-3";

/** Top-of-page store information strip (UI_BREAKDOWN §01). Server Component. */
export function AnnouncementBar() {
  const start = site.announcements.filter((message) => message.placement === "start");
  const end = site.announcements.filter((message) => message.placement === "end");
  const messages = [...start, ...end];

  return (
    <aside aria-label="Store information" className="bg-forest-950 text-on-dark">
      {/* xl:pl-bar-inset: fluid left inset, 32px at 1280 → 88px at 1440 as measured in the reference (V-008) */}
      <Container size="wide" className="xl:pl-bar-inset">
        <ul className="flex min-h-announcement flex-wrap items-center justify-center gap-x-3.5 gap-y-1 py-2 text-sm sm:justify-start lg:gap-x-4 lg:text-base">
          {messages.map((message, index) => {
            const content = (
              <>
                {message.icon && (
                  <Icon
                    name={message.icon}
                    strokeWidth={1.75}
                    className="size-4 shrink-0 text-gold-500 lg:size-6"
                  />
                )}
                <span>{message.text}</span>
              </>
            );

            return (
              <li
                key={message.id}
                className={[
                  visibilityByPriority[message.priority],
                  "items-center gap-2.5 lg:gap-3",
                  index > 0 && divider,
                  message === end[0] && "sm:ml-auto",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {message.href ? (
                  <a href={message.href} className={`${itemLayout} focus-ring-dark underline underline-offset-2 hover:text-gold-500`}>
                    {content}
                  </a>
                ) : (
                  <span className={itemLayout}>{content}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </aside>
  );
}
