"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { submitEnquiry } from "@/app/wholesale/actions";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  enquiryProductOptions,
  enquiryUnits,
  HONEYPOT_FIELD,
  type EnquiryField,
  type EnquiryFormState,
} from "@/lib/enquiry";

const initialState: EnquiryFormState = { status: "idle" };

const controlClass =
  "mt-2 block w-full rounded-button border border-ink-500 bg-white px-4 py-3 text-base text-ink-900 focus-ring aria-[invalid=true]:border-error";

type EnquiryFormProps = {
  /** Product slug to preselect (from /wholesale?product=…). */
  defaultProduct?: string;
  defaultMessage?: string;
};

/**
 * Wholesale / product enquiry form (F1). Client Component only for pending, error and success
 * states; validation and delivery happen in the submitEnquiry Server Action. Works without
 * JavaScript (progressive enhancement). Never shows success unless the enquiry was delivered.
 */
export function EnquiryForm({ defaultProduct = "", defaultMessage = "" }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    if (state.status === "error" || state.status === "success") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-card bg-forest-850 p-8 text-on-dark focus-ring-dark">
        <h2 className="font-serif text-3xl font-semibold">Thank you, your enquiry has been sent</h2>
        <p className="mt-4 text-lg">
          Your reference is <strong data-enquiry-reference>{state.reference}</strong>. We will reply to{" "}
          <strong>{state.email}</strong>.
        </p>
        <Link href="/" className="mt-6 inline-block text-gold-500 underline underline-offset-4 focus-ring-dark hover:text-gold-400">
          Back to the homepage
        </Link>
      </div>
    );
  }

  const values = state.status === "invalid" || state.status === "error" ? state.values : {};
  const value = (field: string, fallback = "") => values[field] ?? fallback;
  const error = (field: EnquiryField) => (state.status === "invalid" ? state.fieldErrors[field] : undefined);
  const describedBy = (field: EnquiryField) => (error(field) ? `${field}-error` : undefined);

  return (
    <form ref={formRef} action={formAction} noValidate className="grid gap-6 sm:grid-cols-2">
      {state.status === "error" && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="rounded-button border border-error bg-white p-4 text-error focus-ring sm:col-span-2">
          {state.message}
        </div>
      )}
      {state.status === "invalid" && (
        <p role="alert" className="text-error sm:col-span-2">
          Please correct the highlighted fields.
        </p>
      )}

      <Field label="Name or business name" field="name" error={error("name")}>
        <input id="name" name="name" autoComplete="organization" required defaultValue={value("name")} aria-invalid={Boolean(error("name"))} aria-describedby={describedBy("name")} className={controlClass} />
      </Field>
      <Field label="Email address" field="email" error={error("email")}>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={value("email")} aria-invalid={Boolean(error("email"))} aria-describedby={describedBy("email")} className={controlClass} />
      </Field>
      <Field label="Phone number" field="phone" error={error("phone")}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" required defaultValue={value("phone")} aria-invalid={Boolean(error("phone"))} aria-describedby={describedBy("phone")} className={controlClass} />
      </Field>
      <Field label="Product of interest" field="product" error={error("product")}>
        <select id="product" name="product" required defaultValue={value("product", defaultProduct)} aria-invalid={Boolean(error("product"))} aria-describedby={describedBy("product")} className={controlClass}>
          <option value="">Choose a product</option>
          {enquiryProductOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Required quantity" field="quantity" error={error("quantity")}>
        <input id="quantity" name="quantity" type="number" inputMode="numeric" min={1} step={1} required defaultValue={value("quantity")} aria-invalid={Boolean(error("quantity"))} aria-describedby={describedBy("quantity")} className={controlClass} />
      </Field>
      <Field label="Unit" field="unit" error={error("unit")}>
        <select id="unit" name="unit" required defaultValue={value("unit", "cartons")} aria-invalid={Boolean(error("unit"))} aria-describedby={describedBy("unit")} className={controlClass}>
          {enquiryUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit[0].toUpperCase() + unit.slice(1)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Delivery location" hint="City, state and country" field="location" error={error("location")} wide>
        <input id="location" name="location" autoComplete="address-level2" required defaultValue={value("location")} aria-invalid={Boolean(error("location"))} aria-describedby={[describedBy("location"), "location-hint"].filter(Boolean).join(" ")} className={controlClass} />
      </Field>
      <Field label="Additional requirements (optional)" field="message" error={error("message")} wide>
        <textarea id="message" name="message" rows={5} defaultValue={value("message", defaultMessage)} aria-invalid={Boolean(error("message"))} aria-describedby={describedBy("message")} className={controlClass} />
      </Field>

      {/* Spam trap (D-072): hidden from people and assistive technology; bots that fill it are rejected. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-base text-ink-700">
          <input type="checkbox" name="consent" value="yes" required defaultChecked={value("consent") === "yes"} aria-invalid={Boolean(error("consent"))} aria-describedby={describedBy("consent")} className="mt-1 size-5 shrink-0 accent-forest-850 focus-ring" />
          <span>I agree that ROCK-TAMA may use these details to respond to this enquiry.</span>
        </label>
        {error("consent") && (
          <p id="consent-error" className="mt-2 text-sm text-error">
            {error("consent")}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={`${buttonClassName("primary", { surface: "light" })} disabled:cursor-wait disabled:opacity-70`}>
          {pending ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = { label: string; field: EnquiryField; error?: string; hint?: string; wide?: boolean; children: ReactNode };

function Field({ label, field, error, hint, wide = false, children }: FieldProps) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={field} className="block text-base font-semibold text-ink-900">
        {label}
      </label>
      {hint && (
        <p id={`${field}-hint`} className="mt-1 text-sm text-ink-500">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${field}-error`} className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
