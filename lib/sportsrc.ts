import "server-only";

const SPORTSRC_BASE_URL = "https://api.sportsrc.org/v2/";

type Primitive = string | number | boolean;

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

    throw new SportSRCError({
      status: response.status,
      statusText: response.statusText,
      endpoint,
      payload,
      message: upstreamMessage,
    });
  }

  return payload as T;
}
