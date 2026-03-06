export class ApiClientError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "error" in body && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${response.status}`;

    throw new ApiClientError(message, response.status, body);
  }

  return body as T;
}

export function shouldRetry(error: unknown): boolean {
  if (error instanceof ApiClientError && error.status === 404) {
    return false;
  }

  return true;
}
