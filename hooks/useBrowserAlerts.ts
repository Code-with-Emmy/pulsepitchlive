"use client";

import { useCallback, useEffect, useState } from "react";

export type BrowserAlertsPermission = NotificationPermission | "unsupported";

function getPermission(): BrowserAlertsPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function useBrowserAlerts() {
  const [permission, setPermission] =
    useState<BrowserAlertsPermission>("unsupported");

  useEffect(() => {
    setPermission(getPermission());

    function syncPermission() {
      setPermission(getPermission());
    }

    window.addEventListener("focus", syncPermission);
    document.addEventListener("visibilitychange", syncPermission);

    return () => {
      window.removeEventListener("focus", syncPermission);
      document.removeEventListener("visibilitychange", syncPermission);
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
  }, []);

  return {
    permission,
    requestPermission,
  };
}
