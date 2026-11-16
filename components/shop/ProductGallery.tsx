"use client";
import Image from "next/image";
import {useEffect,useRef,useState,type RefObject} from "react";
import type {GalleryImage} from "@/content/shop-gallery";
import styles from "./shop-experience.module.css";
function Picture({image,priority=false,zoom=false}:{image:GalleryImage;priority?:boolean;zoom?:boolean}){return <>
 {image.scene && <Image src="/images/hero/waterfall-bg.webp" alt="" fill preload={priority} sizes={zoom?"90vw":"(min-width: 1024px) 50vw, 100vw"} className="object-cover" />}
 <Image src={image.src} alt={image.alt} fill preload={priority} sizes={zoom?"(min-width: 1024px) 700px, 90vw":"(min-width: 1024px) 550px, 90vw"} className={image.detail?styles.detail:image.scene?styles.bottle:styles.contain} style={image.detail?{objectPosition:image.detail==="top"?"center top":"center 58%"}:undefined} />
 </>}
export function ProductGallery({images,enhanced}:{images:GalleryImage[];enhanced:boolean}){
 const [index,setIndex]=useState(0);const dialog=useRef<HTMLDialogElement>(null);const stage=useRef<HTMLDivElement>(null);const token=useRef(0);
 const select=async(i:number)=>{const n=++token.current;const img=stage.current?.querySelector<HTMLImageElement>(`[data-gallery-frame="${i}"] img:last-child`);if(img){img.loading="eager";await img.decode().catch(()=>{})}if(token.current===n)setIndex(i)};
 useEffect(()=>()=>{token.current++},[]);
 const image=images[index];
 return <div>
 <div className={styles.gallery}>
 <div className={styles.thumbs} role="group" aria-label="Product images">{images.map((x,i)=><button key={i} disabled={!enhanced} type="button" aria-label={`Show ${x.label}`} aria-pressed={i===index} onClick={()=>{void select(i)}} className={`${styles.thumb} focus-ring ${i===index?styles.selected:""}`}><Image src={x.src} alt="" fill sizes="80px" className="object-contain" /></button>)}</div>
 <div ref={stage} className={styles.stage}>
 {images.map((x,i)=><div key={i} data-gallery-frame={i} className={styles.frame} aria-hidden={i!==index} inert={i!==index} style={{visibility:i===index?"visible":"hidden"}}><Picture image={x} priority={i===0} /></div>)}
 <button type="button" disabled={!enhanced} className={`${styles.zoomButton} focus-ring`} aria-label="Enlarge product image" onClick={()=>dialog.current?.showModal()}><span aria-hidden="true">＋</span></button>
 </div></div>
 <p className="mt-2 min-h-10 text-xs text-ink-500">{image.concept?"Proposed packaging artwork — confirm packaging in your quotation.":"Product imagery for illustration."}</p>
 <Zoom dialog={dialog} image={image}/>
 </div>
}
function Zoom({dialog,image}:{dialog:RefObject<HTMLDialogElement|null>;image:GalleryImage}){return <dialog ref={dialog} data-product-zoom aria-label="Enlarged product image" className={styles.zoom} onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close()}}><form method="dialog"><button autoFocus className={`${styles.close} focus-ring`} aria-label="Close enlarged image">✕</button></form><div className={styles.zoomStage}><Picture image={image} zoom /></div></dialog>}
