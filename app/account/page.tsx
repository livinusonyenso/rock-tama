import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {Suspense} from "react";
import {DEMO_COOKIE,parseDemoSession} from "@/lib/account/demo";
async function AccountDestination(){const session=parseDemoSession((await cookies()).get(DEMO_COOKIE)?.value);return redirect(session?"/account/dashboard":"/account/login")}
export default function AccountPage(){return <Suspense fallback={<main id="main" className="flex-1 p-10 text-center" aria-busy="true">Opening your account…</main>}><AccountDestination/></Suspense>}
