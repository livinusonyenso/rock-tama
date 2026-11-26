import type {Metadata} from "next";
import {Suspense} from "react";
import {AccountShell} from "@/components/account/AccountShell";
import {AccountAuthForm} from "@/components/account/AccountAuthForm";
import {AccountTypePicker} from "@/components/account/AccountTypePicker";
import {accountCopy} from "@/content/accounts";
import {parseAccountType} from "@/lib/account/roles";
export const metadata:Metadata={title:"Create an account",robots:{index:false,follow:false}};
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
/** ?type=customer|driver|distributor chooses the form (D-137); it is read at request time, inside Suspense. */
async function Registration({searchParams}:Props){
 const type=parseAccountType((await searchParams).type);
 return <AccountShell title={accountCopy.register.title} description={accountCopy.register.description} panel={accountCopy.types[type].panel}><AccountAuthForm key={type} mode="register" accountType={type} typePicker={<AccountTypePicker selected={type}/>}/></AccountShell>;
}
export default function AccountRegistration(props:Props){return <Suspense fallback={<main id="main" className="flex-1 bg-ivory-50 p-12 text-center" aria-busy="true">Loading registration…</main>}><Registration {...props}/></Suspense>}
