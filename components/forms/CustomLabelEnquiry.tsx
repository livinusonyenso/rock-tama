"use client";
import { useSearchParams } from "next/navigation";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

const occasions: Record<string, string> = { wedding: "Wedding", memorial: "Memorial", coronation: "Royal / coronation" };
export function CustomLabelEnquiry() {
  const requested = useSearchParams().get("occasion") ?? "";
  const occasion = Object.hasOwn(occasions, requested) ? occasions[requested] : "Custom";
  return <EnquiryForm key={occasion} defaultMessage={`${occasion} water label enquiry.\nEvent date:\nLabel wording / design ideas:\n`} />;
}
