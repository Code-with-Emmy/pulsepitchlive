"use client";

import useSWR from "swr";
import { apiFetcher, shouldRetry } from "@/lib/api-client";
import { normalizeMatches } from "@/lib/normalize";
import type { MatchItem, MatchStatus } from "@/lib/types";

interface UseMatchesArgs {
  sport: string;
  status: MatchStatus;
  date: string;
}

export function useMatches(args: UseMatchesArgs | null) {
  const key =
    args && args.sport
      ? `/api/matches?sport=${encodeURIComponent(args.sport)}&status=${encodeURIComponent(args.status)}&date=${encodeURIComponent(args.date)}`
      : null;

  const state = useSWR<unknown>(key, apiFetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
    dedupingInterval: 2_000,
    shouldRetryOnError: true,
    errorRetryInterval: 5_000,
    onErrorRetry: (error, _key, _config, revalidate, options) => {
      if (!shouldRetry(error) || options.retryCount >= 8) {
        return;
      }

      setTimeout(() => revalidate(options), 5_000);
    },
  });

  const matches: MatchItem[] = normalizeMatches(state.data);

  return {
    ...state,
    matches,
  };
}
