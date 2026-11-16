import type {Metadata} from "next";
import {Container} from "@/components/ui/Container";
import {Basket} from "@/components/shop/Basket";
export const metadata:Metadata={title:"Your basket",description:"Review your ROCK-TAMA selections and request an order quotation."};
export default function CartPage(){return <main id="main" className="flex-1 bg-ivory-50"><Container size="wide" className="py-12 lg:py-16"><h1 className="font-serif text-4xl font-bold text-forest-850">Your basket</h1><Basket/></Container></main>}
