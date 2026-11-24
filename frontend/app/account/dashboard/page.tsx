import type {Metadata} from "next";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {Suspense} from "react";
import {DEMO_COOKIE,parseDemoSession} from "@/lib/account/demo";
import {dashboardPath} from "@/lib/account/roles";
import {currentAccount,isDistributor} from "@/lib/server/api";
import {CustomerDashboard} from "@/components/account/CustomerDashboard";
import {DistributorAccountDashboard} from "@/components/account/DistributorAccountDashboard";
import {DistributorDashboard} from "@/components/account/DistributorDashboard";
import {AccountUnavailable} from "@/components/account/AccountUnavailable";
export const metadata:Metadata={title:"My account",robots:{index:false,follow:false}};
/** Customers and distributors (D-137). Express decides who is signed in (D-134); other roles go to their own dashboard. */
async function Dashboard(){
 const result=await currentAccount();
 if(result.state==="signed-in"){
  const {account}=result;
  if(isDistributor(account))return <DistributorAccountDashboard account={account}/>;
  if(account.role==="customer")return <CustomerDashboard account={account}/>;
  redirect(dashboardPath(account.role));
 }
 const demo=parseDemoSession((await cookies()).get(DEMO_COOKIE)?.value);
 if(demo)return <DistributorDashboard email={demo.email}/>;
 if(result.state==="unavailable")return <AccountUnavailable/>;
 redirect("/account/login");
}
export default function DashboardPage(){return <Suspense fallback={<main id="main" className="flex-1 bg-ivory-50 p-12 text-center" aria-busy="true">Loading your dashboard…</main>}><Dashboard/></Suspense>}
