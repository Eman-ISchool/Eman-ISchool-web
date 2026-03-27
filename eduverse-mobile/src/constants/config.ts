// Environment configuration for API endpoints
// In production, this should be set via environment variables or build config
export const API_CONFIG = {
  // The Next.js backend that serves the API routes
  baseUrl: __DEV__ ? 'http://localhost:3000/api' : 'https://futurelab.school/api',
  timeout: 30000,
} as const;
