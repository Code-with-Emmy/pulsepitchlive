"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { runEzoic } from "@/lib/ezoic";

/**
 * Handles SPA navigation for Ezoic by triggering a re-scan of the page
 * whenever the pathname changes.
 */
export default function EzoicRouteHandler() {
  const pathname = usePathname();

  useEffect(() => {
    runEzoic(() => {
      // Clear existing placeholders and show new ones on route change
      window.ezstandalone?.destroyPlaceholders?.();
      requestAnimationFrame(() => {
        window.ezstandalone?.showAds?.();
      });
    });
  }, [pathname]);

  return null;
}
