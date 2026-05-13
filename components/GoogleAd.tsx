"use client";

import { useEffect } from "react";

interface GoogleAdProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  responsive?: "true" | "false";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Google AdSense Component
 * 
 * Usage:
 * <GoogleAd slot="1234567890" format="auto" responsive="true" />
 */
export default function GoogleAd({
  slot,
  format = "auto",
  responsive = "true",
  className,
  style,
}: GoogleAdProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [slot]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return (
    <div className={`google-ad-container ${className || ""}`} style={{ overflow: "hidden", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...(style || {}) }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
