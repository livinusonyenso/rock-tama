import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminCopy } from "@/content/admin";
import { adminCredentials } from "@/lib/server/admin/auth";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

/** /auth/admin (D-128): admin sign-in. Shows the demo login only while no real credentials are configured. */
export default function AdminLoginPage() {
  const credentials = adminCredentials();
  return (
    <main id="main" className="relative isolate flex min-h-screen items-center justify-center bg-forest-950 px-4 py-10">
      <Image src="/images/hero/waterfall-bg.webp" alt="" aria-hidden="true" fill preload loading="eager" sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-forest-950/70" />
      <section aria-labelledby="login-heading" className="w-full max-w-md rounded-card bg-ivory-50 p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <Logo variant="footer" className="h-20" eager />
          <p className="mt-4 text-xs font-semibold uppercase tracking-eyebrow text-gold-700">{adminCopy.portal}</p>
          <h1 id="login-heading" className="mt-1 font-serif text-4xl font-bold text-forest-850">Sign in</h1>
          <p className="mt-1 text-sm text-ink-700">Manage sales, orders, inventory and wholesale.</p>
        </div>
        <div className="mt-6">
          {credentials ? <LoginForm /> : <p role="alert" className="rounded-button border border-error p-3 text-sm text-error">Admin sign-in isn’t configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.</p>}
        </div>
        {credentials?.demo && (
          <div data-demo-login className="mt-5 rounded-button border border-gold-700/50 bg-cream-200 p-3 text-sm">
            <p className="font-semibold text-gold-800">Demo login (development and staging only)</p>
            <p className="mt-1">Email: <code className="font-mono">{credentials.email}</code></p>
            <p>Password: <code className="font-mono">{credentials.password}</code></p>
          </div>
        )}
        <p className="mt-6 text-center text-sm"><Link href="/" className="text-gold-700 underline">← Back to the shop</Link></p>
      </section>
    </main>
  );
}
