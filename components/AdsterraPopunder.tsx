"use client";

import { useEffect } from "react";

const POPUNDER_TRIGGER_EVENT = "adsterra:popunder-trigger";

interface AdsterraPopunderProps {
  code?: string;
  storageKey?: string;
  cooldownMs?: number;
}

export default function AdsterraPopunder({
  code,
  storageKey = "adsterra_popunder_last_shown_at",
  cooldownMs = 24 * 60 * 60 * 1000,
}: AdsterraPopunderProps) {
  useEffect(() => {
    const popunderCode = code?.trim() ?? "";
    if (!popunderCode) {
      return;
    }

    function shouldShowPopunder(): boolean {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
          return true;
        }

        const lastShownAt = Number.parseInt(raw, 10);
        if (!Number.isFinite(lastShownAt)) {
          return true;
        }

        return Date.now() - lastShownAt >= cooldownMs;
      } catch {
        return true;
      }
    }

    function markShown(): void {
      try {
        window.localStorage.setItem(storageKey, String(Date.now()));
      } catch {}
    }

    function injectPopunder(): void {
      const container = document.createElement("div");
      container.dataset.adsterraPopunder = "true";
      document.body.appendChild(container);

      const template = document.createElement("template");
      template.innerHTML = popunderCode;

      const nodes = Array.from(template.content.childNodes);

      for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
          continue;
        }

        if (node.nodeName === "SCRIPT") {
          const sourceScript = node as HTMLScriptElement;
          const script = document.createElement("script");

          for (const { name, value } of Array.from(sourceScript.attributes)) {
            script.setAttribute(name, value);
          }

          script.async = false;
          script.textContent = sourceScript.textContent;
          container.appendChild(script);
          continue;
        }

        container.appendChild(node.cloneNode(true));
      }
    }

    function handleTriggeredPopunder(): void {
      if (!shouldShowPopunder()) {
        return;
      }

      markShown();
      injectPopunder();
      cleanup();
    }

    function cleanup(): void {
      window.removeEventListener(
        POPUNDER_TRIGGER_EVENT,
        handleTriggeredPopunder,
      );
    }

    window.addEventListener(POPUNDER_TRIGGER_EVENT, handleTriggeredPopunder);

    return cleanup;
  }, [code, cooldownMs, storageKey]);

  return null;
}
