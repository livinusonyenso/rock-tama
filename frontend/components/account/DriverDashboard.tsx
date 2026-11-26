import {Icon} from "@/components/icons/Icon";
import {availabilities,vehicleTypes} from "@/content/accounts";
import type {Account} from "@/lib/server/api";
import {AccountDashboardLayout,ProfileCard,formatAddress,optionLabel,rows} from "./AccountDashboardLayout";
import styles from "./dashboard.module.css";

/**
 * Driver / logistics dashboard (D-137). Pending drivers see their application status only; approved drivers see
 * their deliveries. Delivery assignment arrives in the next step (mock data first), so the list is empty for now.
 */
export function DriverDashboard({account}:{account:Account}){
 const approved=account.status==="approved";
 const {profile}=account;
 // Only the ID type and last four characters ever reach the site (D-138).
 const id=profile.idType&&profile.idLast4?`${profile.idType==="nin"?"NIN":"Driver’s licence"} •••• ${profile.idLast4}`:null;
 return <AccountDashboardLayout identity={account} portal="Driver portal"
  links={[{href:"#dashboard-overview",label:"Overview",icon:"layers"},{href:"#my-deliveries",label:"My deliveries",icon:"truck"},{href:"#account-profile",label:"My profile",icon:"user"},{href:"/contact",label:"Help & support",icon:"message-circle"}]}
  help={{text:"Questions about your application or a delivery?",link:{href:"/contact",label:"Contact logistics team",icon:"message-circle"}}}>
  <section id="dashboard-overview" className="scroll-mt-8"><p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-700">ROCK-TAMA LOGISTICS</p><h1 className="mt-2 font-serif text-3xl font-bold text-forest-heading sm:text-4xl">Welcome, {account.name}</h1>
  <div data-account-status={account.status} role="status" className={`${styles.card} mt-6 p-5 sm:p-6`}><div className="flex items-center gap-3"><Icon name={approved?"clipboard-check":"calendar"} className="size-6 text-gold-700"/><h2 className="font-serif text-2xl font-bold text-forest-heading">{approved?"You are an approved driver":"Application under review"}</h2></div>
  <p className="mt-3 leading-relaxed text-ink-700">{approved?"Deliveries assigned to you will appear below with the customer’s area and the order details.":"Thank you for applying to deliver with ROCK-TAMA. Our logistics team reviews every driver before deliveries are assigned and will contact you by phone or email."}</p></div></section>
  <section id="my-deliveries" className={`${styles.card} mt-6 scroll-mt-8 p-5 sm:p-6`} aria-labelledby="deliveries-heading"><div className="flex items-center gap-3"><Icon name="truck" className="text-gold-700"/><h2 id="deliveries-heading" className="font-serif text-2xl font-bold text-forest-heading">My deliveries</h2></div>
  <p data-deliveries-empty className="mt-3 leading-relaxed text-ink-700">{approved?"No deliveries are assigned to you yet.":"Deliveries are assigned after your application is approved."}</p></section>
  <ProfileCard rows={rows([["Name",account.name],["Email",account.email],["Phone",account.phone??"Not provided"],["Home address",formatAddress(profile.address)??account.location],["ID",id],["Licence expiry",profile.licenceExpiry],["Vehicle",optionLabel(vehicleTypes,account.vehicleType)],["Plate number",profile.plateNumber],["Delivery areas",profile.operatingArea],["Availability",optionLabel(availabilities,profile.availability)],["Account status",approved?"Approved driver":"Pending review"]])}/>
 </AccountDashboardLayout>;
}
