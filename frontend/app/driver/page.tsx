import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {Suspense} from "react";
import {dashboardPath} from "@/lib/account/roles";
import {currentAccount} from "@/lib/server/api";
import {AccountUnavailable} from "@/components/account/AccountUnavailable";
import {DriverDashboard} from "@/components/account/DriverDashboard";
export const metadata:Metadata={title:"Driver dashboard",robots:{index:false,follow:false}};
/** Driver / logistics dashboard (D-137). Only driver accounts see it; Express re-checks the session on every request. */
async function Driver(){
 const result=await currentAccount();
 if(result.state==="unavailable")return <AccountUnavailable/>;
 if(result.state==="signed-out")redirect("/account/login");
 if(result.account.role!=="driver")redirect(dashboardPath(result.account.role));
 return <DriverDashboard account={result.account}/>;
}
export default function DriverPage(){return <Suspense fallback={<main id="main" className="flex-1 bg-ivory-50 p-12 text-center" aria-busy="true">Loading your dashboard…</main>}><Driver/></Suspense>}
