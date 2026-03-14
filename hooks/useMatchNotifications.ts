"use client";

import { useEffect, useRef } from "react";

export interface MatchNotificationCandidate {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  status: string;
  league?: string;
  href: string;
}

interface UseMatchNotificationsArgs {
  permission: NotificationPermission | "unsupported";
  matches: MatchNotificationCandidate[];
}

interface MatchSnapshot {
  awayScore: string;
  homeScore: string;
  status: string;
}

export function useMatchNotifications({
  permission,
  matches,
}: UseMatchNotificationsArgs) {
  const snapshotsRef = useRef<Map<string, MatchSnapshot>>(new Map());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (permission !== "granted" || typeof window === "undefined") {
      return;
    }

    const nextSnapshots = new Map<string, MatchSnapshot>();

    for (const match of matches) {
      nextSnapshots.set(match.id, {
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      });
    }

    if (!initializedRef.current) {
      snapshotsRef.current = nextSnapshots;
      initializedRef.current = true;
      return;
    }

    for (const match of matches) {
      const previous = snapshotsRef.current.get(match.id);

      if (!previous) {
        if (match.status === "inprogress") {
          sendBrowserNotification({
            body: `${match.league ?? "Match"} is now live`,
            href: match.href,
            title: `${match.homeTeam} vs ${match.awayTeam}`,
          });
        }
        continue;
      }

      if (previous.status !== "inprogress" && match.status === "inprogress") {
        sendBrowserNotification({
          body: `${match.league ?? "Match"} is now live`,
          href: match.href,
          title: `${match.homeTeam} vs ${match.awayTeam}`,
        });
        continue;
      }

      const scoreChanged =
        previous.homeScore !== match.homeScore ||
        previous.awayScore !== match.awayScore;

      if (match.status === "inprogress" && scoreChanged) {
        sendBrowserNotification({
          body: `${match.homeScore}-${match.awayScore} in ${match.league ?? "live play"}`,
          href: match.href,
          title: `${match.homeTeam} vs ${match.awayTeam}`,
        });
      }
    }

    snapshotsRef.current = nextSnapshots;
  }, [matches, permission]);
}

function sendBrowserNotification({
  body,
  href,
  title,
}: {
  body: string;
  href: string;
  title: string;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  const notification = new Notification(title, {
    body,
    tag: `${href}:${title}`,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = href;
    notification.close();
  };
}
