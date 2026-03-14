"use client";

import { useEffect } from "react";

interface AdsterraSocialBarProps {
  code?: string;
  delayMs?: number;
}

export default function AdsterraSocialBar({
  code,
  delayMs = 8000,
}: AdsterraSocialBarProps) {
  useEffect(() => {
    const socialBarCode = code?.trim();
    if (!socialBarCode) {
      return;
    }

    let injected = false;
    let timerId = 0;

    const mountSocialBar = () => {
      if (injected) {
        return;
      }

      const template = document.createElement("template");
      template.innerHTML = socialBarCode;

      const nodes = Array.from(template.content.childNodes);

      for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
          continue;
        }

        if (node.nodeName === "SCRIPT") {
          const sourceScript = node as HTMLScriptElement;
          const scriptSrc = sourceScript.getAttribute("src");

          if (
            scriptSrc &&
            document.querySelector(
              `script[data-adsterra-social-bar="true"][src="${scriptSrc}"]`,
            )
          ) {
            injected = true;
            continue;
          }

          const script = document.createElement("script");

          for (const { name, value } of Array.from(sourceScript.attributes)) {
            script.setAttribute(name, value);
          }

          script.dataset.adsterraSocialBar = "true";
          script.async = true;
          script.textContent = sourceScript.textContent;
          document.body.appendChild(script);
          continue;
        }

        const element = node.cloneNode(true);
        if (element instanceof HTMLElement) {
          element.dataset.adsterraSocialBar = "true";
        }
        document.body.appendChild(element);
      }

      injected = true;
    };

    const triggerMount = () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
      mountSocialBar();
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener("pointerdown", triggerMount);
      window.removeEventListener("keydown", triggerMount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerMount();
      }
    };

    timerId = window.setTimeout(() => {
      triggerMount();
    }, delayMs);

    window.addEventListener("pointerdown", triggerMount, { once: true });
    window.addEventListener("keydown", triggerMount, { once: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timerId);
      cleanupListeners();
    };
  }, [code, delayMs]);

  return null;
}
