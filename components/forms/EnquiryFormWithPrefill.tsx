"use client";

import { useSearchParams } from "next/navigation";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { enquiryProductOptions } from "@/lib/enquiry";

/** Reads ?product=<slug> (from product pages) and preselects it when it's a known product. */
export function EnquiryFormWithPrefill() {
  const requested = useSearchParams().get("product") ?? "";
  const known = enquiryProductOptions.some((option) => option.value === requested);
  return <EnquiryForm defaultProduct={known ? requested : ""} />;
}
