import Link from "next/link";
import type {ReactNode} from "react";
import {Container} from "@/components/ui/Container";
import {Icon} from "@/components/icons/Icon";
import type {Account} from "@/lib/server/api";
import type {IconName} from "@/types/content";
import {LogoutButton} from "./LogoutButton";
import styles from "./dashboard.module.css";

export type DashboardLink={href:string;label:string;icon:IconName};

/** Sidebar + content frame shared by the customer and driver dashboards (D-137), styled like the distributor portal. */
export function AccountDashboardLayout({account,portal,links,help,children}:{account:Account;portal:string;links:DashboardLink[];help:{text:string;link:DashboardLink};children:ReactNode}){
 return <main id="main" className="flex-1 bg-ivory-50" data-dashboard-role={account.role}><Container size="wide" className="py-6 lg:py-10"><div className={styles.layout}>
 <aside className={styles.sidebar} aria-label={`${portal} navigation`}><div className="flex items-center gap-3 border-b border-line-dark p-6"><span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold-600 bg-forest-700 font-serif text-2xl text-gold-500" aria-hidden="true">{(account.name[0]??"R").toUpperCase()}</span><div className="min-w-0"><p className="font-serif text-xl font-semibold">{portal}</p><p className="mt-1 truncate text-xs uppercase tracking-widest text-gold-500">{account.name}</p></div></div>
 <nav aria-label="Dashboard" className="grid gap-1 p-3">{links.map((link,index)=><Link key={link.href} href={link.href} className={index===0?styles.active:undefined}><Icon name={link.icon}/>{link.label}</Link>)}</nav>
 <div className={styles.sidebarFooter}><p className="text-sm leading-relaxed text-on-dark-muted">{help.text}</p><Link href={help.link.href} className="mt-4 flex min-h-11 items-center justify-center rounded-button border border-gold-600 px-3 text-sm text-gold-500 focus-ring-dark">{help.link.label}</Link><LogoutButton/></div></aside>
 <div className="min-w-0">{children}</div>
 </div></Container></main>;
}

/** The "My profile" card: label/value pairs from the real account. */
export function ProfileCard({rows}:{rows:[string,string][]}){
 return <section id="account-profile" className={`${styles.card} mt-6 scroll-mt-8 p-5 sm:p-6`} aria-labelledby="profile-heading"><div className="flex items-center gap-3"><Icon name="user" className="text-gold-700"/><h2 id="profile-heading" className="font-serif text-2xl font-bold text-forest-heading">My profile</h2></div><dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">{rows.map(([label,value])=><div key={label}><dt className="text-ink-500">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}</dl><p className="mt-5 border-t border-line-card pt-4 text-xs leading-relaxed text-ink-500">To change these details, contact our team.</p></section>;
}
