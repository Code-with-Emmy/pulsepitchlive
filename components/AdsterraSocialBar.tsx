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
    if (!code?.trim()) {
      return;
    }

    const mountSocialBar = () => {
      const container = document.createElement("div");
      container.dataset.adsterraSocialBar = "true";
      document.body.appendChild(container);

      const template = document.createElement("template");
      template.innerHTML = code.trim();

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

      return container;
    };

    let container: HTMLDivElement | null = null;
    const timerId = window.setTimeout(() => {
      container = mountSocialBar();
    }, delayMs);

    return () => {
      window.clearTimeout(timerId);
      container?.remove();
    };
  }, [code, delayMs]);

  return null;
}
