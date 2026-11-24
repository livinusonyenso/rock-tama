import Link from "next/link";
import {Icon} from "@/components/icons/Icon";
import {accountCopy,accountTypes,type AccountType} from "@/content/accounts";

/**
 * Account type choice on /account/register (D-137). Plain links (?type=…), so every type has a shareable URL,
 * works without JavaScript and keeps the browser's back button meaningful. Admin is never offered.
 */
export function AccountTypePicker({selected}:{selected:AccountType}){
 return <nav aria-label={accountCopy.register.pickerLabel} className="mb-6">
  <p className="mb-3 text-sm font-semibold text-ink-900">{accountCopy.register.pickerLabel}</p>
  <ul className="grid gap-3 sm:grid-cols-3">{accountTypes.map(type=>{
   const copy=accountCopy.types[type];const current=type===selected;
   return <li key={type}><Link href={`/account/register?type=${type}`} data-account-type-option={type} aria-current={current?"page":undefined} scroll={false}
    className={`focus-ring flex h-full flex-col sm:min-h-24 gap-1 rounded-button border-2 p-3 text-left transition-colors ${current?"border-forest-850 bg-cream-200":"border-line-card bg-ivory-50 hover:border-gold-600"}`}>
    <span className="flex items-center gap-2 font-semibold text-forest-heading"><Icon name={copy.icon} className={`size-5 shrink-0 ${current?"text-gold-700":"text-ink-500"}`}/>{copy.label}</span>
    <span className="text-xs leading-snug text-ink-700">{copy.summary}</span>
   </Link></li>;
  })}</ul>
 </nav>;
}
