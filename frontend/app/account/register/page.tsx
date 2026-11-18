import type {Metadata} from "next";
import {AccountShell} from "@/components/account/AccountShell";
import {DistributorAuthForm} from "@/components/account/DistributorAuthForm";
export const metadata:Metadata={title:"Distributor registration",robots:{index:false,follow:false}};
export default function DistributorRegistration(){return <AccountShell title="Become a distributor" description="Create an account and introduce your business to our team."><DistributorAuthForm mode="register"/></AccountShell>}
