import type { Highlight } from "@/types/content";

/**
 * Homepage purity / trust strip (UI_BREAKDOWN §04), in reference order. Every item is a claim
 * (content/claims.ts) that needs evidence before publication.
 */
export const purityHighlights: readonly Highlight[] = [
  { icon: "droplet", label: "Ultra Pure", claim: "ultraPure" },
  { icon: "mountain-snow", label: "Bottled\nat Source", claim: "bottledAtSource" },
  { icon: "waves", label: "Low TDS\n(6–8 mg/L)", claim: "lowTds" },
  { icon: "flask-conical", label: "Heavy Metals\nNot Detected", claim: "heavyMetalsNotDetected" },
  { icon: "bug-off", label: "Pathogens\nAbsent", claim: "pathogensAbsent" },
  { icon: "clipboard-check", label: "Lab Tested", claim: "labTested" },
];
