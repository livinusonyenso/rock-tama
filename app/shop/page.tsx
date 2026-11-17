import type {Metadata} from "next";
import {ShopStorefront} from "@/components/shop/ShopStorefront";
import {shop} from "@/content/shop";

export const metadata:Metadata={title:shop.metaTitle,description:shop.metaDescription};

/** /shop — All Products (D-125: the same storefront as each product URL). */
export default function ShopPage(){return <ShopStorefront/>;}
