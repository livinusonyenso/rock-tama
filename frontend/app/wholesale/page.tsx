import type { Metadata } from "next";
import { WholesaleLanding } from "@/components/wholesale/WholesaleLanding";
import { wholesale } from "@/content/wholesale";

export const metadata: Metadata = {
  title: wholesale.metaTitle,
  description: wholesale.metaDescription,
};

/** /wholesale: product showcase + working enquiry flow (F1, D-066, D-076). */
export default function WholesalePage() {
  return <WholesaleLanding />;
}
