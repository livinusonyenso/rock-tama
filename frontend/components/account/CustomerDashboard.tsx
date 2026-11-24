import Link from "next/link";
import {Icon} from "@/components/icons/Icon";
import type {Account} from "@/lib/server/api";
import {AccountDashboardLayout,ProfileCard,formatAddress,rows} from "./AccountDashboardLayout";
import styles from "./dashboard.module.css";

/**
 * Customer dashboard (D-137). Everything shown comes from GET /api/v1/auth/me. Orders are not stored against
 * accounts yet, so the orders card says so plainly instead of showing invented data.
 */
export function CustomerDashboard({account}:{account:Account}){
 return <AccountDashboardLayout account={account} portal="My account"
  links={[{href:"#dashboard-overview",label:"Overview",icon:"layers"},{href:"#my-orders",label:"My orders",icon:"package"},{href:"#account-profile",label:"My profile",icon:"user"},{href:"/shop",label:"Shop",icon:"shopping-cart"},{href:"/contact",label:"Help & support",icon:"message-circle"}]}
  help={{text:"Questions about an order or delivery?",link:{href:"/contact",label:"Contact us",icon:"message-circle"}}}>
  <section id="dashboard-overview" className="scroll-mt-8"><p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-700">YOUR ROCK-TAMA ACCOUNT</p><h1 className="mt-2 font-serif text-3xl font-bold text-forest-heading sm:text-4xl">Welcome, {account.name}</h1>
  <div data-account-status={account.status} role="status" className={`${styles.card} mt-6 p-5 sm:p-6`}><div className="flex items-center gap-3"><Icon name="clipboard-check" className="size-6 text-gold-700"/><h2 className="font-serif text-2xl font-bold text-forest-heading">Your customer account is ready</h2></div>
  <p className="mt-3 leading-relaxed text-ink-700">Order ROCK-TAMA natural spring water for your home or business. Choose your products, then complete checkout with your delivery details.</p>
  <div className="mt-5 flex flex-wrap gap-3"><Link href="/shop" className={styles.primary}><Icon name="shopping-cart" className="size-5"/>Shop now</Link><Link href="/contact" className="flex min-h-12 items-center rounded-button border border-forest-850 px-5 text-sm font-semibold text-forest-850 focus-ring">Contact us</Link></div></div></section>
  <section id="my-orders" className={`${styles.card} mt-6 scroll-mt-8 p-5 sm:p-6`} aria-labelledby="orders-heading"><div className="flex items-center gap-3"><Icon name="package" className="text-gold-700"/><h2 id="orders-heading" className="font-serif text-2xl font-bold text-forest-heading">My orders</h2></div>
  <p className="mt-3 leading-relaxed text-ink-700">Your orders and their delivery status will appear here soon.</p></section>
  <ProfileCard rows={rows([["Name",account.name],["Email",account.email],["Phone",account.phone??"Not provided"],["Delivery address",formatAddress(account.profile.address)??account.location],["Account type","Customer"]])}/>
 </AccountDashboardLayout>;
}
