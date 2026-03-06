"use client";

import useSWR from "swr";
import { ApiClientError, apiFetcher, shouldRetry } from "@/lib/api-client";
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
  const refreshInterval =
    args?.status === "inprogress" ? 15_000 : args?.status === "notstarted" ? 60_000 : 120_000;

  const state = useSWR<unknown>(key, apiFetcher, {
    refreshInterval,
    revalidateOnFocus: false,
    dedupingInterval: 2_000,
    shouldRetryOnError: true,
    errorRetryInterval: 5_000,
    onErrorRetry: (error, _key, _config, revalidate, options) => {
      if (!shouldRetry(error)) {
        return;
      }

      const retryDelay = error instanceof ApiClientError && error.status === 429 ? 30_000 : 5_000;
      const maxRetries = error instanceof ApiClientError && error.status === 429 ? 3 : 8;

      if (options.retryCount >= maxRetries) {
        return;
      }

      setTimeout(() => revalidate(options), retryDelay);
    },
  });

  const matches: MatchItem[] = normalizeMatches(state.data);

  return {
    ...state,
    matches,
  };
}
