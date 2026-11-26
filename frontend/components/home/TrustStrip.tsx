import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { claims } from "@/content/claims";
import { homePurityHighlights } from "@/content/highlights";
import styles from "./trust-strip.module.css";

export function TrustStrip() {
  return (
    <section aria-label="Purity highlights" className="border-t border-line-dark/60 bg-forest-800 text-on-dark">
      <Container size="wide" className={`${styles.layout} py-3`}>
       

        <div className={styles.viewport}>
          <div className={styles.track}>
            {[false, true].map((copy) => (
              <ul key={String(copy)} aria-hidden={copy || undefined} className={styles.group}>
                {homePurityHighlights.map(({ icon, claim }) => (
                  <li key={claim} data-claim={claim} className={`${styles.item} flex items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6`}>
                    <Icon name={icon} className="size-6 shrink-0 text-gold-500" />
                    <span className="text-sm leading-snug font-medium wrap-anywhere sm:text-base">{claims[claim].text}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
