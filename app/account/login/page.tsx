import type {Metadata} from "next";
import {AccountShell} from "@/components/account/AccountShell";
import {demoLoginEnabled} from "@/lib/account/demo";
import {DistributorAuthForm} from "@/components/account/DistributorAuthForm";
export const metadata:Metadata={title:"Distributor login",robots:{index:false,follow:false}};
export default function DistributorLogin(){return <AccountShell title="Welcome back" description="Log in to your ROCK-TAMA distributor account."><DistributorAuthForm mode="login" demoEnabled={demoLoginEnabled()}/></AccountShell>}
