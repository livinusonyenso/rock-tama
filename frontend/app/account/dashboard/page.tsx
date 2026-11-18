import type {Metadata} from "next";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {Suspense} from "react";
import {DEMO_COOKIE,parseDemoSession} from "@/lib/account/demo";
import {DistributorDashboard} from "@/components/account/DistributorDashboard";
export const metadata:Metadata={title:"Distributor dashboard — demo",robots:{index:false,follow:false}};
async function Dashboard(){const session=parseDemoSession((await cookies()).get(DEMO_COOKIE)?.value);if(!session)redirect("/account/login");return <DistributorDashboard email={session.email}/>}
export default function DashboardPage(){return <Suspense fallback={<main id="main" className="flex-1 bg-ivory-50 p-12 text-center" aria-busy="true">Loading your dashboard…</main>}><Dashboard/></Suspense>}
