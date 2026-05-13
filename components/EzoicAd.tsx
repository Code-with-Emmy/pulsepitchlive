"use client";

import { useEffect, useState } from "react";
import { runEzoic } from "@/lib/ezoic";

interface EzoicAdProps {
  id: number;
}

/**
 * Manages the lifecycle of a single Ezoic ad slot.
 * Ensures ads are displayed on mount and destroyed on unmount.
 */
export default function EzoicAd({ id }: EzoicAdProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
    runEzoic(() => {
      window.ezstandalone?.showAds?.(id);
    });

    return () => {
      runEzoic(() => {
        window.ezstandalone?.destroyPlaceholders?.(id);
      });
    };
  }, [id]);

  return (
    <div className="ezoic-ad-container my-4 flex justify-center">
      {isRendered && <div id={`ezoic-pub-ad-placeholder-${id}`} />}
    </div>
  );
}
