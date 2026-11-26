import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {Suspense} from "react";
import {DEMO_COOKIE,parseDemoSession} from "@/lib/account/demo";
import {dashboardPath} from "@/lib/account/roles";
import {currentAccount} from "@/lib/server/api";
/** The header's account icon: each role to its own dashboard (D-137), everyone else to login. */
async function AccountDestination(){
 const result=await currentAccount();
 if(result.state==="signed-in")redirect(dashboardPath(result.account.role));
 const demo=parseDemoSession((await cookies()).get(DEMO_COOKIE)?.value);
 return redirect(demo?"/account/dashboard":"/account/login");
}
export default function AccountPage(){return <Suspense fallback={<main id="main" className="flex-1 p-10 text-center" aria-busy="true">Opening your account…</main>}><AccountDestination/></Suspense>}
