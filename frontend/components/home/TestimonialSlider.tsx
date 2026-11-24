"use client";

import {Children, useEffect, useState, useSyncExternalStore, type ReactNode} from "react";
import styles from "./testimonial-marquee.module.css";

type Props = {label:string;slideLabels:readonly string[];children:ReactNode};
const subscribe = () => () => {};
const scrollKeys = new Set(["ArrowLeft","ArrowRight","Home","End"]);
const subscribeMotion = (notify:()=>void) => {
  const query=window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change",notify);
  return ()=>query.removeEventListener("change",notify);
};

/** Two equal groups translate one group width rightwards; the duplicate is visual only. */
export function TestimonialSlider({label,slideLabels,children}:Props){
  const enhanced=useSyncExternalStore(subscribe,()=>true,()=>false);
  const reduced=useSyncExternalStore(subscribeMotion,()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches,()=>true);
  const [stopped,setStopped]=useState(false);
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const [hidden,setHidden]=useState(false);
  const items=Children.toArray(children);
  const enabled=enhanced&&!reduced&&items.length>1;
  const rotating=enabled&&!stopped&&!hovered&&!focused&&!hidden;
  useEffect(()=>{
    const visibility=()=>setHidden(document.visibilityState==="hidden");
    visibility();document.addEventListener("visibilitychange",visibility);
    return ()=>document.removeEventListener("visibilitychange",visibility);
  },[]);
  return <div role="region" aria-roledescription="carousel" aria-label={label}
    className={styles.root} data-marquee-enabled={enabled||undefined}
    data-carousel-rotating={rotating||undefined} data-carousel-stopped={stopped||undefined}
    onPointerEnter={e=>{if(e.pointerType!=="touch")setHovered(true)}} onPointerLeave={()=>setHovered(false)}
    onFocus={()=>setFocused(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
    {enabled&&<button type="button" className="sr-only focus:not-sr-only focus-ring rounded-button border border-gold-700 px-4 py-3" onClick={()=>setStopped(value=>!value)}>{stopped?"Resume testimonial movement":"Pause testimonial movement"}</button>}
    <div tabIndex={0} aria-label={`${label}. Focus or touch to pause movement.`} className={`${styles.viewport} focus-ring`}
      onPointerDown={()=>setStopped(true)}
      // Only a sideways scroll is the visitor taking control. A vertical wheel or trackpad scroll that passes
      // over the cards is just page scrolling (e.g. after the Our Story link jumps to #origin, just above).
      onWheel={e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY))setStopped(true)}}
      // Keys that move the cards; Tab (leaving the carousel) and other keys keep it moving.
      onKeyDown={e=>{if(scrollKeys.has(e.key))setStopped(true)}}>
      <div data-testimonial-track className={styles.track} style={{animationDuration:`${Math.max(1,items.length)*12}s`,animationPlayState:rotating?"running":"paused"}}>
        {[false,true].map(copy=><ul key={String(copy)} className={styles.group} aria-hidden={copy||undefined} inert={copy||undefined} data-testimonial-copy={copy||undefined}>
          {items.map((item,index)=><li key={slideLabels[index]??index} className={styles.card} aria-label={copy?undefined:`${index+1} of ${items.length}: ${slideLabels[index]}`}>{item}</li>)}
        </ul>)}
      </div>
    </div>
  </div>;
}
