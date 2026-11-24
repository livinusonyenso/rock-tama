import type { Highlight } from "@/types/content";

/** The trust strip uses the exact wording from the claims register. */
export const homePurityHighlights: readonly Pick<Highlight, "icon" | "claim">[] = [
  { icon: "mountain-snow", claim: "naturalSpringWaterBottledAtSource" },
  { icon: "droplet", claim: "sensoryQuality" },
  { icon: "waves", claim: "lowTdsAndPh" },
  { icon: "flask-conical", claim: "heavyMetalsNotDetected" },
  { icon: "bug-off", claim: "pathogensAbsent" },
  { icon: "leaf", claim: "pesticidesNotDetected" },
  { icon: "clipboard-check", claim: "labTestedAndNafdacRegistered" },
];

/** Quality highlights used on the shop and product pages. */
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
