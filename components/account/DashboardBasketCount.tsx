"use client";
import {useBasket} from "@/lib/basket";
export function DashboardBasketCount(){const lines=useBasket();return <strong data-dashboard-basket>{lines.reduce((n,line)=>n+line.quantity,0)}</strong>}
