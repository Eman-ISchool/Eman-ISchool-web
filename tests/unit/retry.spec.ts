/**
 * Unit Tests for API Retry Logic
 *
 * Run with: npm test tests/unit/retry.spec.ts
 */

import { withRetry, fetchWithRetry, RetryPresets } from '@/lib/api/retry';

describe('withRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(mockFn);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on network error', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce('success');

    const result = await withRetry(mockFn);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should retry on 500 error', async () => {
    const mockFn = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 500, statusText: 'Internal Server Error' })
      )
      .mockResolvedValueOnce(
        new Response('success', { status: 200, statusText: 'OK' })
      );

    const result = await withRetry(mockFn);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(200);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should retry on 429 error', async () => {
    const mockFn = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 429, statusText: 'Too Many Requests' })
      )
      .mockResolvedValueOnce(
        new Response('success', { status: 200, statusText: 'OK' })
      );

    const result = await withRetry(mockFn);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(200);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on 400 error', async () => {
    const mockFn = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 400, statusText: 'Bad Request' })
      );

    await expect(withRetry(mockFn)).rejects.toThrow('HTTP error! status: 400');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should not retry on 404 error', async () => {
    const mockFn = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 404, statusText: 'Not Found' })
      );

    await expect(withRetry(mockFn)).rejects.toThrow('HTTP error! status: 404');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should respect maxAttempts', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(withRetry(mockFn, { maxAttempts: 2 })).rejects.toThrow(
      'ECONNREFUSED'
    );
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should use exponential backoff', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce('success');

    const startTime = Date.now();
    await withRetry(mockFn, { initialDelay: 100, backoffMultiplier: 2 });
    const elapsedTime = Date.now() - startTime;

    // Should take at least 100ms + 200ms = 300ms
    expect(elapsedTime).toBeGreaterThanOrEqual(300);
    expect(mockFn).toHaveBeenCalledTimes(3);
  }, 10000);

  it('should respect maxDelay', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce('success');

    const startTime = Date.now();
    await withRetry(mockFn, {
      initialDelay: 1000,
      backoffMultiplier: 10,
      maxDelay: 1500,
    });
    const elapsedTime = Date.now() - startTime;

    // 1000ms + 1500ms + 1500ms = 4000ms (capped at maxDelay)
    expect(elapsedTime).toBeGreaterThanOrEqual(4000);
    expect(mockFn).toHaveBeenCalledTimes(4);
  }, 15000);

  it('should use custom shouldRetry function', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Custom error'))
      .mockResolvedValueOnce('success');

    const shouldRetry = jest.fn().mockReturnValue(true);

    const result = await withRetry(mockFn, { shouldRetry });

    expect(result).toBe('success');
    expect(shouldRetry).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe('fetchWithRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as typeof fetch;
  });

  it('should fetch successfully on first attempt', async () => {
    const mockResponse = new Response('success', {
      status: 200,
      statusText: 'OK',
    });
    jest.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const result = await fetchWithRetry('https://api.example.com/data');

    expect(result).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      undefined
    );
  });

  it('should retry on network error', async () => {
    const mockResponse = new Response('success', {
      status: 200,
      statusText: 'OK',
    });
    jest
      .mocked(fetch)
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce(mockResponse);

    const result = await fetchWithRetry('https://api.example.com/data');

    expect(result).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should pass options to fetch', async () => {
    const mockResponse = new Response('success', {
      status: 200,
      statusText: 'OK',
    });
    jest.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    };

    await fetchWithRetry('https://api.example.com/data', options);

    expect(fetch).toHaveBeenCalledWith('https://api.example.com/data', options);
  });
});

describe('RetryPresets', () => {
  it('should have conservative preset', () => {
    expect(RetryPresets.conservative).toEqual({
      maxAttempts: 3,
      initialDelay: 100,
      backoffMultiplier: 2,
      maxDelay: 5000,
    });
  });

  it('should have aggressive preset', () => {
    expect(RetryPresets.aggressive).toEqual({
      maxAttempts: 5,
      initialDelay: 50,
      backoffMultiplier: 2,
      maxDelay: 10000,
    });
  });

  it('should have none preset', () => {
    expect(RetryPresets.none).toEqual({
      maxAttempts: 1,
    });
  });

  it('should have networkOnly preset', () => {
    expect(RetryPresets.networkOnly).toEqual({
      maxAttempts: 3,
      initialDelay: 100,
      backoffMultiplier: 2,
      maxDelay: 5000,
      retryOn429: false,
      retryOn5xx: false,
    });
  });
});
