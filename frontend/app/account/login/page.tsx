import type {Metadata} from "next";
import {AccountShell} from "@/components/account/AccountShell";
import {AccountAuthForm} from "@/components/account/AccountAuthForm";
import {accountCopy} from "@/content/accounts";
import {demoLoginEnabled} from "@/lib/account/demo";
export const metadata:Metadata={title:"Log in",robots:{index:false,follow:false}};
export default function AccountLogin(){return <AccountShell title={accountCopy.login.title} description={accountCopy.login.description} panel={accountCopy.login.panel}><AccountAuthForm mode="login" demoEnabled={demoLoginEnabled()}/></AccountShell>}
