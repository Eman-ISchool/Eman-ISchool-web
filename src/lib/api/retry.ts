/**
 * API Retry Logic with Exponential Backoff
 *
 * Retries transient failures (ECONNREFUSED, ETIMEDOUT, 5xx, 429) up to 3 times
 * (4 total attempts) using exponential backoff: 100ms, 200ms, 400ms delays.
 * Does NOT retry permanent client errors (4xx except 429).
 */

export interface RetryConfig {
  /** Maximum number of total attempts including the first (default: 4 = 1 initial + 3 retries) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 100) */
  initialDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Maximum delay cap in milliseconds (default: 5000) */
  maxDelay?: number;
  /** Whether to retry on 429 Too Many Requests (default: true) */
  retryOn429?: boolean;
  /** Whether to retry on 5xx server errors (default: true) */
  retryOn5xx?: boolean;
  /** Custom function to determine if a thrown error should be retried */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const NETWORK_ERROR_PATTERNS = [
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNRESET',
  'fetch failed',
];

function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return NETWORK_ERROR_PATTERNS.some((pattern) =>
      error.message.includes(pattern)
    );
  }
  return false;
}

function defaultShouldRetry(error: unknown, config: RetryConfig): boolean {
  return isNetworkError(error);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts = 4,
    initialDelay = 100,
    backoffMultiplier = 2,
    maxDelay = 5000,
    shouldRetry: customShouldRetry,
  } = config;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isLastAttempt = attempt === maxAttempts;
    let result: T | undefined;
    let fnError: unknown = undefined;
    let threw = false;

    try {
      result = await fn();
    } catch (err) {
      threw = true;
      fnError = err;
    }

    if (threw) {
      const canRetry =
        !isLastAttempt &&
        (customShouldRetry
          ? customShouldRetry(fnError, attempt)
          : defaultShouldRetry(fnError, config));

      if (canRetry) {
        const delayMs = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt - 1),
          maxDelay
        );
        await sleep(delayMs);
        continue;
      }

      throw fnError;
    }

    // fn() returned a value — check if it's a Response that needs retry
    if ((result as unknown) instanceof Response) {
      const response = result as unknown as Response;
      const { status } = response;

      if (status >= 200 && status < 300) {
        return result as T;
      }

      const isRetryable =
        (config.retryOn5xx !== false && status >= 500) ||
        (config.retryOn429 !== false && status === 429);

      if (isRetryable && !isLastAttempt) {
        const delayMs = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt - 1),
          maxDelay
        );
        await sleep(delayMs);
        continue;
      }

      throw new Error(`HTTP error! status: ${status}`);
    }

    return result as T;
  }

  throw new Error('Max attempts exceeded');
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  config?: RetryConfig
): Promise<Response> {
  return withRetry(() => fetch(url, options), config);
}

export async function fetchJsonWithRetry<T>(
  url: string,
  options?: RequestInit,
  config?: RetryConfig
): Promise<T> {
  const response = await fetchWithRetry(url, options, config);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const RetryPresets = {
  conservative: {
    maxAttempts: 3,
    initialDelay: 100,
    backoffMultiplier: 2,
    maxDelay: 5000,
  },
  aggressive: {
    maxAttempts: 5,
    initialDelay: 50,
    backoffMultiplier: 2,
    maxDelay: 10000,
  },
  none: {
    maxAttempts: 1,
  },
  networkOnly: {
    maxAttempts: 3,
    initialDelay: 100,
    backoffMultiplier: 2,
    maxDelay: 5000,
    retryOn429: false,
    retryOn5xx: false,
  },
} as const;
