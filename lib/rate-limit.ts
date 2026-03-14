import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

interface CheckRateLimitOptions {
  route: string;
  max: number;
  windowMs: number;
  bucketId?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

declare global {
  var __liveFootyRateLimitStore: Map<string, Bucket> | undefined;
}

function getStore(): Map<string, Bucket> {
  if (!globalThis.__liveFootyRateLimitStore) {
    globalThis.__liveFootyRateLimitStore = new Map<string, Bucket>();
  }

  return globalThis.__liveFootyRateLimitStore;
}

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "anonymous";
}

function maybeCleanupExpired(store: Map<string, Bucket>, now: number): void {
  if (store.size <= 2000) {
    return;
  }

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  request: Request,
  options: CheckRateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const clientId = getClientId(request);
  const key = options.bucketId
    ? `${options.route}:${clientId}:${options.bucketId}`
    : `${options.route}:${clientId}`;
  const store = getStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    store.set(key, fresh);
    maybeCleanupExpired(store, now);

    return {
      allowed: true,
      limit: options.max,
      remaining: Math.max(options.max - fresh.count, 0),
      resetAt: fresh.resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= options.max) {
    const retryAfterSeconds = Math.max(
      Math.ceil((existing.resetAt - now) / 1000),
      1,
    );

    return {
      allowed: false,
      limit: options.max,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    limit: options.max,
    remaining: Math.max(options.max - existing.count, 0),
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
  };

  if (!result.allowed) {
    headers["Retry-After"] = String(result.retryAfterSeconds);
  }

  return headers;
}
