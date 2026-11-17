export type GalleryImage={src:string;alt:string;label:string;scene?:boolean;detail?:"top"|"label";concept?:boolean};
const bottle=(src:string,size:string):GalleryImage[]=>[
 {src,alt:`Proposed ROCK-TAMA ${size} packaging concept`,label:"Bottle",scene:true,concept:true},
 {src,alt:`Gold cap detail of proposed ROCK-TAMA ${size} bottle`,label:"Cap detail",detail:"top",concept:true},
 {src,alt:`Label detail of proposed ROCK-TAMA ${size} bottle`,label:"Label detail",detail:"label",concept:true},
 {src:"/images/origin/origin-landscape.webp",alt:"Illustrated landscape with trees, hills and a stream",label:"Origin illustration"},
];
export const shopGallery={
 "750-pack12":[{src:"/images/products/carton-packs.webp",alt:"ROCK-TAMA pack of twelve 750 ml bottles",label:"Pack of 12",concept:true}],
 "750ml-glass-bottle":[bottle("/images/hero/bottle-750ml-rock-tama.webp","750 ml")[0],{src:"/images/products/750ml-glass-bottle.webp",alt:"ROCK-TAMA catalogue glass bottle",label:"Glass bottle"},...bottle("/images/hero/bottle-750ml-rock-tama.webp","750 ml").slice(1)],
 "1-5l-bottle":bottle("/images/hero/bottle-1-5l.webp","1.5 L"),
 // D-118: owner-supplied tray artwork, 24 × 750 ml.
 "750-pack24":[{src:"/images/products/carton-open-angle.webp",alt:"Proposed ROCK-TAMA shrink-wrapped tray of twenty-four 750 ml bottles, angled view",label:"Tray of 24, angled",concept:true},{src:"/images/products/carton-open-row.webp",alt:"Proposed ROCK-TAMA shrink-wrapped tray of twenty-four 750 ml bottles, front view",label:"Tray of 24, front",concept:true}],
 // D-118: 12 × 1.5 L carton views only (the 24 × 750 ml tray previously shown here moved to Pack of 24).
 "carton-packs":[{src:"/images/products/carton-closed-front.webp",alt:"Proposed ROCK-TAMA carton of twelve 1.5 L bottles, front view",label:"Carton, front",concept:true},{src:"/images/products/carton-closed-angle.webp",alt:"Proposed ROCK-TAMA carton of twelve 1.5 L bottles, angled view",label:"Carton, angled",concept:true},{src:"/images/products/carton-closed-side.webp",alt:"Proposed ROCK-TAMA carton of twelve 1.5 L bottles, side view",label:"Carton, side",concept:true},{src:"/images/products/carton-closed-wide.webp",alt:"Proposed ROCK-TAMA carton of twelve 1.5 L bottles, wide view",label:"Carton, wide",concept:true},{src:"/images/products/closed-carton.webp",alt:"Alternative ROCK-TAMA Africa carton design concept for twelve 1.5 L bottles",label:"Alternative design",concept:true}],
} satisfies Record<string,GalleryImage[]>;
