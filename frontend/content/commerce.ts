/** Owner-approved draft prices from the shop reference. No payment/stock commitment. */
export type ShopSize = "750" | "1500";
export type ShopVariant = { id: string; label: string; detail: string; product: string; size: ShopSize; pack: "single" | "pack12" | "pack24" | "carton"; amount: number | null; bottles: number; unit: "bottles" | "cartons" };
/** Every pack the business offers. `amount: null` = no price yet. */
const allVariants: readonly ShopVariant[] = [
  {id:"750-single",label:"Single bottle",detail:"750 ml",product:"750ml-glass-bottle",size:"750",pack:"single",amount:650,bottles:1,unit:"bottles"},
  {id:"750-pack12",label:"Pack of 12",detail:"12 × 750 ml",product:"750ml-glass-bottle",size:"750",pack:"pack12",amount:7500,bottles:12,unit:"bottles"},
  // D-118: owner-supplied 24 × 750 ml tray artwork; sold on request only, no price invented.
  {id:"750-pack24",label:"Pack of 24",detail:"24 × 750 ml",product:"750ml-glass-bottle",size:"750",pack:"pack24",amount:null,bottles:24,unit:"bottles"},
  {id:"1500-single",label:"Single bottle",detail:"1.5 L · price on request",product:"1-5l-bottle",size:"1500",pack:"single",amount:null,bottles:1,unit:"bottles"},
  {id:"1500-carton",label:"Carton",detail:"12 × 1.5 L · draft configuration",product:"carton-packs",size:"1500",pack:"carton",amount:14500,bottles:1,unit:"cartons"},
];
/**
 * D-123: shop orders are always paid online, so only priced packs are sold. A pack without a price stays
 * hidden everywhere (shop, cart, checkout) until its `amount` is set above. "On request" pricing is only for
 * custom labels (weddings, memorials, events) via the custom-labels enquiry.
 */
export const shopVariants: readonly ShopVariant[] = allVariants.filter(v=>v.amount!==null);
export const variantById = (id: string) => shopVariants.find(v=>v.id===id);
/** Lowest price among the packs sold for a catalogue product, or null when none is sold online yet. */
export const fromPrice = (product: string) => {
  const amounts = shopVariants.filter(v=>v.product===product).map(v=>v.amount as number);
  return amounts.length ? Math.min(...amounts) : null;
};
export const money = (amount: number | null) => amount === null ? "Price on request" : new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:2,maximumFractionDigits:2}).format(amount);
export type BasketLine = {variantId:string;quantity:number};
export function selectionHref(lines: readonly BasketLine[]) {
  const valid=lines.flatMap(line=>{const v=variantById(line.variantId);return v?[{...line,v}]:[]});
  const q=new URLSearchParams({product:valid.length===1?valid[0].v.product:"mixed"});
  q.set("message",["Shop order enquiry — draft prices, subject to confirmation.",...valid.map(({v,quantity})=>`${quantity} × ${v.label} (${v.detail}) — ${money(v.amount)} per selection`),"Please confirm availability, final pricing and delivery. No payment has been made."].join("\n"));
  if(valid.length===1){q.set("quantity",String(valid[0].quantity*valid[0].v.bottles));q.set("unit",valid[0].v.unit);}
  return `/wholesale?${q.toString()}#enquiry`;
}

/** Size of each catalogue product URL (D-125). */
const productSize: Record<string, ShopSize> = { "750ml-glass-bottle": "750", "1-5l-bottle": "1500", "carton-packs": "1500" };
/**
 * Pack a product URL opens with (D-125): its own first pack on sale, else the first pack on sale in the same
 * size (the 1.5 L single has no price yet, so /shop/1-5l-bottle opens the 1.5 L carton), else the first pack.
 */
export const defaultVariantFor = (product: string) =>
  shopVariants.find(v=>v.product===product) ?? shopVariants.find(v=>v.size===productSize[product]) ?? shopVariants[0];
