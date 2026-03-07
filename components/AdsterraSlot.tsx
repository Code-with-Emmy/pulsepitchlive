"use client";

import { useEffect, useRef } from "react";

interface AdsterraSlotProps {
  zoneKey?: string;
  width: number;
  height: number;
  className?: string;
  host?: string;
  format?: "iframe" | "banner";
}

let adsterraLoadQueue = Promise.resolve();

export default function AdsterraSlot({
  zoneKey,
  width,
  height,
  className,
  host = "www.highperformanceformat.com",
  format = "iframe",
}: AdsterraSlotProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return;
    }

    mountNode.innerHTML = "";
    if (!zoneKey) {
      return;
    }

    let disposed = false;
    const normalizedFormat = format === "banner" ? "iframe" : format;

    adsterraLoadQueue = adsterraLoadQueue
      .catch(() => undefined)
      .then(
        () =>
          new Promise<void>((resolve) => {
            if (disposed || !mountRef.current) {
              resolve();
              return;
            }

            const nextMountNode = mountRef.current;
            nextMountNode.innerHTML = "";

            const optionsScript = document.createElement("script");
            optionsScript.type = "text/javascript";
            optionsScript.text = `
              window.atOptions = {
                key: '${zoneKey}',
                format: '${normalizedFormat}',
                height: ${height},
                width: ${width},
                params: {}
              };
            `;

            const invokeScript = document.createElement("script");
            invokeScript.type = "text/javascript";
            invokeScript.async = false;
            invokeScript.src = `https://${host}/${zoneKey}/invoke.js`;
            invokeScript.onload = () => resolve();
            invokeScript.onerror = () => resolve();

            nextMountNode.appendChild(optionsScript);
            nextMountNode.appendChild(invokeScript);
          }),
      );

    return () => {
      disposed = true;
      mountNode.innerHTML = "";
    };
  }, [zoneKey, width, height, format, host]);

  if (!zoneKey) {
    return (
      <div
        className={className}
        style={{ width, height }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-slate-600 bg-[#0f182a] text-xs text-slate-400">
          Configure Adsterra slot
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width, height }}
    />
  );
}
