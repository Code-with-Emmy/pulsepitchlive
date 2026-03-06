"use client";

import useSWR from "swr";
import { apiFetcher, shouldRetry } from "@/lib/api-client";
import { normalizeMatchDetail } from "@/lib/normalize";

export function useMatchDetail(id: string | null) {
  const state = useSWR<unknown>(id ? `/api/match/${encodeURIComponent(id)}` : null, apiFetcher, {
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

  return {
    ...state,
    detail: normalizeMatchDetail(state.data),
  };
}
