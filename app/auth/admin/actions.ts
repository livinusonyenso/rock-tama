"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, endAdminSession, startAdminSession } from "@/lib/server/admin/auth";
import { isRateLimited } from "@/lib/server/rate-limit";

export type LoginState = { status: "idle" | "error"; message?: string; email?: string };

/** Admin sign-in (D-128): rate-limited, constant-time check, signed httpOnly session, then /admin. */
export async function loginAdmin(_previous: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").slice(0, 200);
  const password = String(form.get("password") ?? "").slice(0, 200);
  const h = await headers();
  const client = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (isRateLimited(`admin-login:${client}`, 5, 15 * 60 * 1000)) {
    return { status: "error", email, message: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  }
  if (!email || !password || !checkCredentials(email, password)) {
    // One generic message: never reveal whether the email or the password was wrong.
    return { status: "error", email, message: "Incorrect email or password." };
  }
  await startAdminSession(email);
  redirect("/admin");
}

export async function logoutAdmin() {
  await endAdminSession();
  redirect("/auth/admin");
}
