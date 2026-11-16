export type GalleryImage={src:string;alt:string;label:string;scene?:boolean;detail?:"top"|"label";concept?:boolean};
const bottle=(src:string,size:string):GalleryImage[]=>[
 {src,alt:`Proposed ROCK-TAMA ${size} packaging concept`,label:"Bottle",scene:true,concept:true},
 {src,alt:`Gold cap detail of proposed ROCK-TAMA ${size} bottle`,label:"Cap detail",detail:"top",concept:true},
 {src,alt:`Label detail of proposed ROCK-TAMA ${size} bottle`,label:"Label detail",detail:"label",concept:true},
 {src:"/images/origin/origin-landscape.webp",alt:"Illustrated landscape with trees, hills and a stream",label:"Origin illustration"},
];
export const shopGallery={
 "750ml-glass-bottle":[bottle("/images/hero/bottle-750ml-rock-tama.webp","750 ml")[0],{src:"/images/products/750ml-glass-bottle.webp",alt:"ROCK-TAMA catalogue glass bottle",label:"Glass bottle"},...bottle("/images/hero/bottle-750ml-rock-tama.webp","750 ml").slice(1)],
 "1-5l-bottle":bottle("/images/hero/bottle-1-5l.webp","1.5 L"),
 "carton-packs":[{src:"/images/products/carton-closed-front.webp",alt:"Proposed ROCK-TAMA carton packaging",label:"Closed carton",concept:true},{src:"/images/products/carton-closed-angle.webp",alt:"Alternative view of proposed carton",label:"Side view",concept:true},{src:"/images/products/carton-open-row.webp",alt:"Proposed open multi-bottle pack",label:"Open pack",concept:true}],
} satisfies Record<string,GalleryImage[]>;
