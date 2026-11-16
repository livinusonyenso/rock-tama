import type {Metadata} from "next";
import Link from "next/link";
import {ShopProductExperience} from "@/components/shop/ShopProductExperience";
import {Container} from "@/components/ui/Container";
import {ProductCard} from "@/components/ui/ProductCard";
import {OfferCard} from "@/components/ui/OfferCard";
import {ButtonLink} from "@/components/ui/ButtonLink";
import {MediaFrame} from "@/components/ui/MediaFrame";
import {Icon} from "@/components/icons/Icon";
import {listedProducts} from "@/content/products";
import {shop} from "@/content/shop";
import {homeProducts} from "@/content/home";
import {storefrontMedia} from "@/content/media";
import {purityHighlights} from "@/content/highlights";
import {productHref} from "@/lib/navigation";
export const metadata:Metadata={title:shop.metaTitle,description:shop.metaDescription};
const specifications=[
 ["Source","Nanka, Anambra State, Nigeria","droplet"],
 ["Type","Natural Spring Water","mountain-snow"],
 ["Available sizes","750 ml, 1.5 L","package-search"],
 ["Total Dissolved Solids (TDS)","Request current specifications","waves"],
 ["pH","Request current specifications","flask-conical"],
 ["Mineral profile","Request current specifications","layers"],
 ["Quality assurance","Request testing and certification information","clipboard-check"],
] as const;
export default function ShopPage(){return <main id="main" className="flex-1 bg-ivory-50">
 <Container size="wide">
 <nav aria-label="Breadcrumb" className="pt-6 text-sm text-ink-700"><ol className="flex flex-wrap items-center gap-3"><li><Link href="/" aria-label="Home" className="focus-ring"><Icon name="building" className="size-4"/></Link></li><li aria-hidden="true">›</li><li><Link href="/shop" className="focus-ring">Shop</Link></li><li aria-hidden="true">›</li><li>Bottled Water</li><li aria-hidden="true">›</li><li aria-current="page">ROCK-TAMA — Natural Spring Water</li></ol></nav>
 <ShopProductExperience/>
 </Container>
 <section aria-label="Water quality highlights" className="border-y border-line-dark bg-forest-850 text-on-dark"><Container size="wide"><ul className="grid grid-cols-2 gap-y-6 py-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">{purityHighlights.filter(h=>h.claim!=="heavyMetalsNotDetected").map(h=><li key={h.claim} data-claim={h.claim} className="flex flex-col items-center gap-2 border-line-dark px-4 text-center lg:border-r lg:last:border-0"><Icon name={h.icon} strokeWidth={1.5} className="size-9 text-gold-500"/><span className="whitespace-pre-line font-serif text-xl font-semibold leading-tight">{h.label}</span></li>)}</ul></Container></section>
 <Container size="wide" className="py-8 lg:py-10">
 <div className="grid gap-10 lg:grid-cols-2">
 <section aria-labelledby="shop-description-heading"><p className="text-sm font-semibold uppercase tracking-eyebrow text-gold-700">Product description</p><h2 id="shop-description-heading" className="mt-3 font-serif text-3xl font-semibold italic text-forest-850">Pure by Nature. African at Heart.</h2><p className="mt-4 leading-relaxed">ROCK-TAMA natural spring water originates from Nanka, Anambra State, Nigeria. Explore bottle and carton options for your table, workplace and special occasions. Share your requirements with our team to confirm the packaging, quantities and delivery arrangements that suit your order.</p><MediaFrame media={storefrontMedia.origin} fit="cover" className="mt-5 w-full overflow-hidden rounded-card" sizes="(min-width:1024px) 600px, 100vw"/></section>
 <section aria-labelledby="shop-specifications-heading"><h2 id="shop-specifications-heading" className="text-sm font-semibold uppercase tracking-eyebrow text-gold-700">Specifications</h2><dl className="mt-3">{specifications.map(([label,value,icon])=><div key={label} className="grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3 border-b border-line-card py-3 text-sm"><Icon name={icon} className="size-5 text-gold-700"/><dt className="font-semibold text-ink-900">{label}</dt><dd>{value}</dd></div>)}</dl><Link href="/wholesale#enquiry" className="mt-4 inline-block text-sm text-gold-700 underline underline-offset-4 focus-ring">Ask for product and quality details →</Link></section>
 </div>
 <section aria-labelledby="related-products-heading" id="all-products" className="mt-10 border-t border-line-card pt-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-eyebrow text-gold-700">You may also like</p><h2 id="related-products-heading" className="mt-2 font-serif text-3xl font-bold text-forest-850">Related Products</h2></div><Link href="/shop#all-products" className="text-sm font-semibold text-forest-850 underline focus-ring">View all products →</Link></div><ul className="mt-5 grid gap-4 md:grid-cols-2 min-[87.5rem]:grid-cols-4" data-shop-products>{listedProducts.map(p=><li key={p.slug}><ProductCard product={p} compactMedia showPackaging={false} layout="media-side" action={<ButtonLink href={productHref(p)} variant="outline-light" size="sm" surface="light">Shop now</ButtonLink>}/></li>)}<li><OfferCard title={homeProducts.distributorOffer.title} text={homeProducts.distributorOffer.text} titleStyle="italic" media={homeProducts.distributorOffer.media} compactMedia layout="media-side" action={<ButtonLink href="/wholesale" variant="outline-light" size="sm" surface="light">Request supply</ButtonLink>}/></li></ul></section>
 </Container>
 </main>}
