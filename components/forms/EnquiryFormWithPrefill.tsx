"use client";

import { useSearchParams } from "next/navigation";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { enquiryProductOptions } from "@/lib/enquiry";

/** Reads ?product=<slug> (from product pages) and preselects it when it's a known product. */
export function EnquiryFormWithPrefill() {
  const params = useSearchParams();
  const requested = params.get("product") ?? "";
  const quantity = Number(params.get("quantity"));
  const defaultQuantity = Number.isInteger(quantity) && quantity>=1 && quantity<=1000000 ? String(quantity) : "";
  const defaultUnit = params.get("unit")==="bottles" ? "bottles" : "cartons";
  const defaultMessage = (params.get("message")??"").slice(0,2000);
  const known = enquiryProductOptions.some((option) => option.value === requested);
  return <EnquiryForm key={`${requested}:${defaultQuantity}:${defaultUnit}:${defaultMessage}`} defaultProduct={known ? requested : ""} defaultQuantity={defaultQuantity} defaultUnit={defaultUnit} defaultMessage={defaultMessage} />;
}
