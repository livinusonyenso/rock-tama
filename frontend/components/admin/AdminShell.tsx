import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAdmin } from "@/app/auth/admin/actions";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/icons/Icon";
import { adminCopy, adminNav } from "@/content/admin";
import { badges } from "@/content/admin-demo";

/**
 * Admin layout (D-128): forest sidebar with the waterfall artwork, header with greeting, search, notifications
 * and sign-out. Server Component. Only the Dashboard is a link; unbuilt sections are marked "Coming soon".
 */
export function AdminShell({ children, account }: { children: ReactNode; account: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ivory-50 text-ink-900">
      <aside aria-label="Admin navigation" className="isolate hidden w-56 shrink-0 flex-col overflow-hidden bg-forest-950 text-on-dark md:sticky md:top-0 md:flex md:h-screen lg:w-64">
        {/* Own absolute layer: next/image `fill` needs a relative/absolute parent, and the sidebar itself is sticky (D-129). */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image src="/images/hero/waterfall-bg.webp" alt="" fill loading="eager" sizes="256px" className="object-cover object-[70%_100%] opacity-90" />
          <div className="absolute inset-0 bg-linear-to-b from-forest-950 from-55% via-forest-950/80 to-forest-950/10" />
        </div>
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <Link href="/admin" aria-label="Rock Tama admin dashboard" className="focus-ring-dark"><Logo variant="footer" className="h-16 lg:h-20" eager /></Link>
          <p className="mt-3 flex w-full items-center gap-3 text-xs font-semibold uppercase tracking-eyebrow text-gold-500"><span aria-hidden="true" className="h-px flex-1 bg-gold-500/70" />{adminCopy.portal}<span aria-hidden="true" className="h-px flex-1 bg-gold-500/70" /></p>
        </div>
        <nav className="px-3">
          <ul className="space-y-1">
            {adminNav.map((item) => {
              const count = item.badge ? badges[item.badge] : null;
              const inner = (
                <>
                  <Icon name={item.icon} className="size-6 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {count !== null && <span className="rounded-full bg-gold-500 px-2 text-xs font-bold text-forest-950">{count}<span className="sr-only"> (demo)</span></span>}
                  {item.group && <Icon name="chevron-down" className="size-4 opacity-70" />}
                </>
              );
              return (
                <li key={item.label}>
                  {item.href ? (
                    <Link href={item.href} aria-current="page" className="flex min-h-12 items-center gap-3 rounded-button bg-gold-gradient px-4 font-semibold text-forest-950 shadow-card focus-ring-dark">{inner}</Link>
                  ) : (
                    <span data-coming-soon className="flex min-h-12 cursor-default items-center gap-3 rounded-button px-4 text-on-dark/85">{inner}<span className="sr-only"> ({adminCopy.comingSoon})</span></span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative isolate overflow-hidden border-b border-line-card bg-cream-200/60">
          <Image src="/images/origin/origin-landscape.webp" alt="" aria-hidden="true" fill preload loading="eager" sizes="(min-width: 768px) 75vw, 100vw" className="-z-20 object-cover object-[70%_40%]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-ivory-50 from-45% via-ivory-50/85 to-ivory-50/20" />
          <div className="flex items-start justify-between gap-4 px-4 py-5 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-700 sm:text-sm">{adminCopy.welcome}</p>
              <h1 className="font-serif text-3xl font-bold text-forest-850 sm:text-4xl">{adminCopy.title}</h1>
              <p className="mt-1 max-w-xl font-serif text-base italic text-ink-700 sm:text-lg">{adminCopy.subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <span data-coming-soon className="hidden size-11 items-center justify-center text-forest-850 sm:flex" title={adminCopy.comingSoon}><Icon name="search" className="size-6" /><span className="sr-only">Search ({adminCopy.comingSoon})</span></span>
              <span className="relative flex size-11 items-center justify-center text-forest-850" title="Notifications (demo)"><Icon name="bell" className="size-6" /><span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-gold-700 text-[0.7rem] font-bold text-white" aria-hidden="true">{badges.notifications}</span><span className="sr-only">{badges.notifications} notifications (demo)</span></span>
              {account}
              <form action={logoutAdmin}>
                <button type="submit" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-button border border-forest-850/30 bg-ivory-50/80 px-3 text-sm font-semibold text-forest-850 focus-ring"><Icon name="log-out" className="size-5" /><span className="hidden sm:inline">Log out</span><span className="sr-only sm:hidden">Log out</span></button>
              </form>
            </div>
          </div>
        </header>
        {/* Phones (below md): the sidebar is hidden, so the same navigation as a scrollable strip. */}
        {/* relative: the sr-only "(Coming soon)" spans are absolutely positioned; without a positioned ancestor they
            escape this strip's scroll clipping and widen the whole page on phones. */}
        <nav aria-label="Admin navigation (compact)" className="relative overflow-x-auto border-b border-line-card bg-forest-950 md:hidden">
          <ul className="flex gap-1 px-3 py-2 text-sm whitespace-nowrap text-on-dark">
            {adminNav.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link href={item.href} aria-current="page" className="flex min-h-11 items-center gap-2 rounded-button bg-gold-gradient px-3 font-semibold text-forest-950 focus-ring-dark"><Icon name={item.icon} className="size-5" />{item.label}</Link>
                ) : (
                  <span data-coming-soon className="flex min-h-11 cursor-default items-center gap-2 px-3 text-on-dark/80"><Icon name={item.icon} className="size-5" />{item.label}<span className="sr-only"> ({adminCopy.comingSoon})</span></span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" className="flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
