/**
 * Jest global setup — mocks Next.js server APIs that require a request context.
 */

// Mock next/headers so API route tests can run outside the Next.js request lifecycle
jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Map()),
  cookies: jest.fn(() => ({
    get: jest.fn(() => null),
    getAll: jest.fn(() => []),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(() => false),
  })),
}));
