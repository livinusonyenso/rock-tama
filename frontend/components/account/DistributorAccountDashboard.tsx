import Link from "next/link";
import {Container} from "@/components/ui/Container";
import {Icon} from "@/components/icons/Icon";
import type {DistributorAccount} from "@/lib/server/api";
import {businessTypes,monthlyVolumes} from "@/content/accounts";
import {formatAddress,optionLabel,rows} from "./AccountDashboardLayout";
import {LogoutButton} from "./LogoutButton";
import styles from "./dashboard.module.css";

/**
 * Dashboard for a real, database-backed distributor account (D-134). Everything shown comes from
 * GET /api/v1/auth/me. Pending accounts see the review state only; nothing here grants distributor permissions.
 */
export function DistributorAccountDashboard({account}:{account:DistributorAccount}){
 const approved=account.canAccessDistributorFeatures;
 const details=account.profile;
 const yesNo=(value:boolean|undefined)=>value===undefined?null:value?"Yes":"No";
 // Accounts registered before D-138 have no profile details; those rows are simply left out.
 const profile=rows([["Contact person",account.name],["Position",details.position],["Business",account.company],["Type of business",optionLabel(businessTypes,details.businessType)],["CAC number",details.cacNumber],["Email",account.email],["Phone",account.phone??"Not provided"],["Business address",formatAddress(details.address)??account.location??"Not provided"],["Areas to supply",details.supplyAreas],["Expected monthly volume",optionLabel(monthlyVolumes,details.monthlyVolume)],["Storage space",yesNo(details.hasStorage)],["Own delivery vehicle",yesNo(details.hasVehicle)],["Account status",approved?"Approved distributor":"Pending review"]]);
 return <main id="main" className="flex-1 bg-ivory-50"><Container size="wide" className="py-6 lg:py-10"><div className={styles.layout}>
 <aside className={styles.sidebar} aria-label="Distributor dashboard navigation"><div className="flex items-center gap-3 border-b border-line-dark p-6"><span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold-600 bg-forest-700 font-serif text-2xl text-gold-500" aria-hidden="true">{(account.name[0]??"D").toUpperCase()}</span><div className="min-w-0"><p className="font-serif text-xl font-semibold">Distributor portal</p><p className="mt-1 truncate text-xs uppercase tracking-widest text-gold-500">{account.company}</p></div></div>
 <nav aria-label="Dashboard" className="grid gap-1 p-3"><a href="#dashboard-overview" className={styles.active}><Icon name="layers"/>Overview</a><a href="#account-profile"><Icon name="user"/>My profile</a><Link href="/shop"><Icon name="shopping-cart"/>Browse products</Link><Link href="/contact"><Icon name="message-circle"/>Help & support</Link></nav>
 <div className={styles.sidebarFooter}><p className="text-sm leading-relaxed text-on-dark-muted">Questions about your application or supply?</p><Link href="/wholesale#enquiry" className="mt-4 flex min-h-11 items-center justify-center rounded-button border border-gold-600 px-3 text-sm text-gold-500 focus-ring-dark">Contact supply team</Link><LogoutButton/></div></aside>
 <div className="min-w-0">
 <section id="dashboard-overview" className="scroll-mt-8"><p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-700">YOUR ROCK-TAMA ACCOUNT</p><h1 className="mt-2 font-serif text-3xl font-bold text-forest-heading sm:text-4xl">Welcome, {account.name}</h1>
 <div data-account-status={account.status} role="status" className={`${styles.card} mt-6 p-5 sm:p-6`}><div className="flex items-center gap-3"><Icon name={approved?"clipboard-check":"calendar"} className="size-6 text-gold-700"/><h2 className="font-serif text-2xl font-bold text-forest-heading">{approved?"Distributor account approved":"Application pending review"}</h2></div>
 <p className="mt-3 leading-relaxed text-ink-700">{approved?"Your business is approved as a ROCK-TAMA distributor. Distributor ordering tools are being prepared; until then, browse products or contact our supply team.":`Thank you for applying, ${account.company}. Our team reviews every distributor application before distributor access is granted, and will contact you by email or phone. You can still shop as a guest in the meantime.`}</p>
 <div className="mt-5 flex flex-wrap gap-3"><Link href="/shop" className={styles.primary}><Icon name="shopping-cart" className="size-5"/>Browse products</Link><Link href="/wholesale#enquiry" className="flex min-h-12 items-center rounded-button border border-forest-850 px-5 text-sm font-semibold text-forest-850 focus-ring">Contact supply team</Link></div></div></section>
 <section id="account-profile" className={`${styles.card} mt-6 scroll-mt-8 p-5 sm:p-6`} aria-labelledby="profile-heading"><div className="flex items-center gap-3"><Icon name="user" className="text-gold-700"/><h2 id="profile-heading" className="font-serif text-2xl font-bold text-forest-heading">My profile</h2></div><dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">{profile.map(([label,value])=><div key={label}><dt className="text-ink-500">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}</dl><p className="mt-5 border-t border-line-card pt-4 text-xs leading-relaxed text-ink-500">To change these details, contact our team.</p></section>
 </div></div></Container></main>;
}
