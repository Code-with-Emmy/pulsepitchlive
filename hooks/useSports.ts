"use client";

import useSWR from "swr";
import { apiFetcher } from "@/lib/api-client";
import { normalizeSports } from "@/lib/normalize";
import type { SportItem } from "@/lib/types";

export function useSports() {
  const state = useSWR<unknown>("/api/sports", apiFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  const sports: SportItem[] = normalizeSports(state.data);

  return {
    ...state,
    sports,
  };
}
