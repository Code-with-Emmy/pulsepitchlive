import "server-only";
import { mockFetchSportSRC } from "./mock-data";

const SPORTSRC_BASE_URL = "https://api.sportsrc.org/v2/";

type Primitive = string | number | boolean;

interface CachedEntry {
  expiresAt: number;
  payload: unknown;
}

declare global {
  var __liveFootySportSRCCache: Map<string, CachedEntry> | undefined;
  var __liveFootySportSRCInflight:
    | Map<string, Promise<unknown>>
    | undefined;
}

export class SportSRCError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly endpoint: string;
  readonly payload: unknown;

  constructor(options: {
    status: number;
    statusText: string;
    endpoint: string;
    payload: unknown;
    message: string;
  }) {
    super(options.message);
    this.name = "SportSRCError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.endpoint = options.endpoint;
    this.payload = options.payload;
  }
}

function buildEndpoint(params: Record<string, Primitive | undefined>): string {
  const url = new URL(SPORTSRC_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function getSportSRCCache(): Map<string, CachedEntry> {
  if (!globalThis.__liveFootySportSRCCache) {
    globalThis.__liveFootySportSRCCache = new Map<string, CachedEntry>();
  }

  return globalThis.__liveFootySportSRCCache;
}

function getSportSRCInflight(): Map<string, Promise<unknown>> {
  if (!globalThis.__liveFootySportSRCInflight) {
    globalThis.__liveFootySportSRCInflight = new Map<string, Promise<unknown>>();
  }

  return globalThis.__liveFootySportSRCInflight;
}

function readCachedPayload(endpoint: string): unknown | null {
  const cache = getSportSRCCache();
  const cached = cache.get(endpoint);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    cache.delete(endpoint);
    return null;
  }

  return cached.payload;
}

function writeCachedPayload(
  endpoint: string,
  payload: unknown,
  revalidateSeconds: number,
): void {
  getSportSRCCache().set(endpoint, {
    payload,
    expiresAt: Date.now() + revalidateSeconds * 1000,
  });
}

export function parseSportSRCError(error: unknown): {
  status: number;
  message: string;
  detail: unknown;
} {
  if (error instanceof SportSRCError) {
    return {
      status: error.status,
      message: error.message,
      detail: {
        endpoint: error.endpoint,
        upstreamStatusText: error.statusText,
        payload: error.payload,
      },
    };
  }

  const fallbackMessage = error instanceof Error ? error.message : "Unexpected server error";

  return {
    status: 500,
    message: fallbackMessage,
    detail: null,
  };
}

export async function fetchSportSRC<T>(
  params: Record<string, Primitive | undefined>,
  revalidate: number,
): Promise<T> {
  const apiKey = process.env.SPORTSRC_API_KEY;

  if (!apiKey) {
    throw new Error("SPORTSRC_API_KEY is not set on the server");
  }

  const endpoint = buildEndpoint(params);
  const cachedPayload = readCachedPayload(endpoint);
  if (cachedPayload !== null) {
    return cachedPayload as T;
  }

  const inflight = getSportSRCInflight();
  const activeRequest = inflight.get(endpoint);
  if (activeRequest) {
    return (await activeRequest) as T;
  }

  const requestPromise = (async () => {
  const response = await fetch(endpoint, {
    headers: {
      "X-API-KEY": apiKey,
    },
    next: { revalidate },
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const upstreamMessage =
      typeof payload === "object" && payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : `SportSRC upstream error (${response.status})`;

    if (response.status === 429 && process.env.NODE_ENV === "development") {
      console.warn(`SportSRC Rate limit (429) hit for ${endpoint}. Using mock data.`);
      const mockPayload = mockFetchSportSRC(params);
      writeCachedPayload(endpoint, mockPayload, 60);
      return mockPayload as T;
    }

    throw new SportSRCError({
      status: response.status,
      statusText: response.statusText,
      endpoint,
      payload,
      message: upstreamMessage,
    });
  }

    writeCachedPayload(endpoint, payload, revalidate);

    return payload as T;
  })();

  inflight.set(endpoint, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inflight.delete(endpoint);
  }
}
