import Link from "next/link";
import {Container} from "@/components/ui/Container";

/** Shown when a session cookie exists but the account service cannot answer. Never treated as signed in. */
export function AccountUnavailable(){
 return <main id="main" className="flex-1 bg-ivory-50"><Container className="py-16"><section data-account-unavailable role="alert" className="mx-auto max-w-xl rounded-card border border-line-card bg-ivory-100 p-8 text-center shadow-card"><h1 className="font-serif text-3xl font-bold text-forest-heading">Account services are unavailable</h1><p className="mt-3 leading-relaxed text-ink-700">We couldn’t check your sign-in right now. Please try again in a moment.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/account/dashboard" className="inline-flex min-h-12 items-center rounded-button bg-forest-850 px-6 font-semibold text-on-dark focus-ring">Try again</Link><Link href="/shop" className="inline-flex min-h-12 items-center rounded-button border border-forest-850 px-6 font-semibold text-forest-850 focus-ring">Continue shopping</Link></div></section></Container></main>;
}
