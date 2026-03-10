import { NextResponse } from 'next/server';

/**
 * Request ID Utility
 * 
 * Generates unique request identifiers for API tracing and debugging.
 * All API responses should include a requestId for observability.
 */

/**
 * Generates a unique request ID using crypto.randomUUID()
 * 
 * @returns A UUID v4 string
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Attaches X-Request-Id response header.
 */
export function withRequestId(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('X-Request-Id', requestId);
  return response;
}

/**
 * Attaches a request ID to an error object
 * 
 * @param error - The error object to enhance
 * @param requestId - Optional request ID (generates one if not provided)
 * @returns Enhanced error object with requestId
 */
export function attachRequestId(error: Error, requestId?: string): Error & { requestId: string } {
  const id = requestId || generateRequestId();
  const enhanced = error as Error & { requestId: string };
  enhanced.requestId = id;
  return enhanced;
}

/**
 * Creates a standard error response object with request ID
 * 
 * @param message - Human-readable error message
 * @param code - Machine-readable error code
 * @param requestId - Optional request ID (generates one if not provided)
 * @returns Standard error response shape
 */
export function createErrorResponse(
  message: string,
  code: string,
  requestId?: string
): { error: string; code: string; requestId: string } {
  return {
    error: message,
    code,
    requestId: requestId || generateRequestId(),
  };
}

/**
 * Creates a standard success response object with request ID
 * 
 * @param data - The response data
 * @param requestId - Optional request ID (generates one if not provided)
 * @returns Standard success response shape
 */
export function createSuccessResponse<T>(
  data: T,
  requestId?: string
): T & { requestId: string } {
  return {
    ...data,
    requestId: requestId || generateRequestId(),
  };
}
