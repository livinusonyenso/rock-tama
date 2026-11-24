import Image from "next/image";
import Link from "next/link";
import type {ReactNode} from "react";
import {Container} from "@/components/ui/Container";
import {Icon} from "@/components/icons/Icon";
import type {AccountPanel} from "@/content/accounts";

/** Login and registration layout: the account type's panel on the left, the form on the right (D-137). */
export function AccountShell({title,description,panel,children}:{title:string;description:string;panel:AccountPanel;children:ReactNode}){
 return <main id="main" className="flex-1 bg-ivory-50"><Container size="wide" className="py-8 lg:py-12"><nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-700"><Link href="/" className="focus-ring hover:underline">Home</Link><span aria-hidden="true" className="mx-3 text-gold-700">›</span><span aria-current="page">Account</span></nav><div className="grid overflow-hidden rounded-card border border-line-card bg-ivory-100 shadow-card lg:grid-cols-[.9fr_1.1fr]">
 <section data-account-panel className="relative isolate overflow-hidden bg-forest-850 p-6 text-on-dark sm:p-8 lg:p-12"><Image src="/images/hero/waterfall-bg.webp" alt="" fill sizes="(min-width:1024px) 45vw, 100vw" className="-z-20 object-cover object-center"/><div className="absolute inset-0 -z-10 bg-linear-to-b from-forest-950/95 via-forest-950/90 to-forest-950/75"/><Icon name={panel.icon} className="hidden size-10 text-gold-500 lg:block"/><p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-500 lg:mt-6">{panel.eyebrow}</p><h2 className="mt-3 max-w-md font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:mt-4 lg:text-5xl">{panel.heading}</h2><p className="mt-5 hidden max-w-md leading-relaxed text-on-dark-muted lg:block">{panel.text}</p><ul className="mt-8 hidden gap-5 text-sm lg:grid">{panel.points.map(point=><li key={point.text} className="flex items-center gap-3"><Icon name={point.icon} className="size-5 shrink-0 text-gold-500"/>{point.text}</li>)}</ul><p className="mt-8 hidden border-t border-line-dark pt-5 text-xs leading-relaxed text-on-dark-muted lg:block">{panel.note}</p></section>
 <section className="min-w-0 p-6 sm:p-10 lg:p-12" aria-labelledby="account-heading"><h1 id="account-heading" className="font-serif text-3xl font-bold text-forest-heading sm:text-4xl">{title}</h1><p className="mt-3 mb-3 leading-relaxed text-ink-700">{description}</p>{children}</section>
 </div></Container></main>
}
