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

/** §7 reference wording remains evidence-dependent and production-blocking. */
export const qualityIndicators: readonly Highlight[] = [
  { icon: "droplet", label: "Low TDS\n6–8 mg/L", claim: "lowTds" },
  { icon: "waves", label: "Undistilled\n(Natural State)", claim: "undistilled" },
  { icon: "leaf", label: "Odourless & Tasteless\nat Source", claim: "odourlessTastelessAtSource" },
  { icon: "flask-conical", label: "Lab\nTested", claim: "labTested" },
];
