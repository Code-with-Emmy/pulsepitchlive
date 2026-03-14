"use client";

import { useEffect, useRef } from "react";

interface AdsterraNativeSlotProps {
  code?: string;
  className?: string;
  height?: number;
}

export default function AdsterraNativeSlot({
  code,
  className,
  height = 320,
}: AdsterraNativeSlotProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const nativeCode = code?.trim() ?? "";

    if (!iframe || !nativeCode) {
      return;
    }

    const document = iframe.contentWindow?.document;
    if (!document) {
      return;
    }

    document.open();
    document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: transparent;
      }
    </style>
  </head>
  <body>${nativeCode}</body>
</html>`);
    document.close();

    return () => {
      document.open();
      document.write(
        "<!DOCTYPE html><html><body style='margin:0;background:transparent'></body></html>",
      );
      document.close();
    };
  }, [code]);

  if (!code?.trim()) {
    return (
      <div
        className={className}
        style={{ height }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-slate-600 bg-[#0f182a] text-xs text-slate-400">
          Configure Adsterra native slot
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title="Sponsored native content"
      className={className}
      style={{ width: "100%", height }}
      scrolling="no"
      frameBorder="0"
    />
  );
}
