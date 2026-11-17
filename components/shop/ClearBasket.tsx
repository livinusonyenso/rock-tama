"use client";
import { useEffect } from "react";
import { updateBasket } from "@/lib/basket";

/** Empties the saved basket once a payment has been verified (D-122). Renders nothing. */
export function ClearBasket() {
  useEffect(() => {
    try {
      updateBasket([]);
    } catch {
      // Storage unavailable: nothing to clear.
    }
  }, []);
  return null;
}
