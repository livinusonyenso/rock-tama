import type {Metadata} from "next";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {Suspense} from "react";
import {DEMO_COOKIE,parseDemoSession} from "@/lib/account/demo";
import {currentAccount} from "@/lib/server/api";
import {DistributorAccountDashboard} from "@/components/account/DistributorAccountDashboard";
import {DistributorDashboard} from "@/components/account/DistributorDashboard";
import {AccountUnavailable} from "@/components/account/AccountUnavailable";
export const metadata:Metadata={title:"Distributor dashboard",robots:{index:false,follow:false}};
/** Real session first (Express decides, D-134); the demo cookie only where demo sign-ins are enabled. */
async function Dashboard(){
 const result=await currentAccount();
 if(result.state==="signed-in")return <DistributorAccountDashboard account={result.account}/>;
 const demo=parseDemoSession((await cookies()).get(DEMO_COOKIE)?.value);
 if(demo)return <DistributorDashboard email={demo.email}/>;
 if(result.state==="unavailable")return <AccountUnavailable/>;
 redirect("/account/login");
}
export default function DashboardPage(){return <Suspense fallback={<main id="main" className="flex-1 bg-ivory-50 p-12 text-center" aria-busy="true">Loading your dashboard…</main>}><Dashboard/></Suspense>}
