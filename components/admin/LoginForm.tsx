"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { loginAdmin, type LoginState } from "@/app/auth/admin/actions";
import { Icon } from "@/components/icons/Icon";

const idle: LoginState = { status: "idle" };

/** Admin sign-in form (D-128): server action, generic error, password reveal toggle, focus to the error. */
export function LoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(loginAdmin, idle);
  const [reveal, setReveal] = useState(false);
  const alertRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (state.status === "error") alertRef.current?.focus(); }, [state]);
  const field = "min-h-12 w-full rounded-button border border-ink-500 bg-white px-3 text-base focus-ring";
  return (
    <form action={action} className="grid gap-4" aria-label="Admin sign in">
      {state.status === "error" && <p ref={alertRef} tabIndex={-1} role="alert" className="rounded-button border border-error p-3 text-sm text-error focus-ring">{state.message}</p>}
      <label className="grid gap-1 text-sm font-semibold" htmlFor="admin-email">Email
        <input id="admin-email" name="email" type="email" autoComplete="username" required defaultValue={state.email ?? defaultEmail} className={field} />
      </label>
      <label className="grid gap-1 text-sm font-semibold" htmlFor="admin-password">Password
        <span className="relative">
          <input id="admin-password" name="password" type={reveal ? "text" : "password"} autoComplete="current-password" required className={`${field} pr-12`} />
          <button type="button" onClick={() => setReveal((v) => !v)} aria-label={reveal ? "Hide password" : "Show password"} aria-pressed={reveal}
            className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-ink-700 focus-ring"><Icon name={reveal ? "eye-off" : "eye"} className="size-5" /></button>
        </span>
      </label>
      <button type="submit" disabled={pending} className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-button bg-forest-850 px-5 font-semibold uppercase tracking-nav text-on-dark focus-ring disabled:opacity-60">
        <Icon name="lock" className="size-5 text-gold-500" />{pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
