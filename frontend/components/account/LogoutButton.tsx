"use client";
import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";

/** Ends the real session (D-134): Express deletes the session row and clears the HttpOnly cookie. */
export function LogoutButton(){
 const router=useRouter();const [pending,startTransition]=useTransition();const [error,setError]=useState("");
 const logout=()=>startTransition(async()=>{
  setError("");
  try{
   const response=await fetch("/api/v1/auth/logout",{method:"POST",headers:{Accept:"application/json"},cache:"no-store"});
   // 401: the session had already ended. Either way the browser is signed out.
   if(response.status===204||response.status===401){router.replace("/account/login");router.refresh();return;}
   setError("We couldn’t log you out. Please try again.");
  }catch{setError("We couldn’t log you out. Please try again.")}
 });
 return <div className="mt-4"><button type="button" data-logout onClick={logout} disabled={pending} className="min-h-11 w-full text-left text-sm underline underline-offset-4 focus-ring-dark disabled:opacity-70">{pending?"Logging out…":"Log out"}</button>{error&&<p role="alert" className="mt-2 text-sm text-gold-500">{error}</p>}</div>;
}
