import rateLimit from 'express-rate-limit';

// Shared options: skip rate limiting when IP is not available (test environment)
const sharedOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false as const },
  // Use IP or fallback to a key that won't collide across tests
  keyGenerator: (req: { ip?: string }) => req.ip || 'unknown',
  skip: (req: { ip?: string }) => !req.ip,
};

// General API rate limit: 100 requests per minute per IP
export const generalLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});

// Session creation: 10 per 15 minutes per IP (prevent abuse)
export const sessionLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many sessions created, please try again later' },
});

// Queue join: 20 per minute (prevent queue spam)
export const queueLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many queue requests, please try again later' },
});

// Room creation: 5 per 10 minutes per IP
export const roomCreationLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many rooms created, please try again later' },
});

// Socket.IO connection tracking per IP
const socketConnectionCounts = new Map<string, { count: number; resetAt: number }>();
const SOCKET_MAX_CONNECTIONS_PER_IP = 10;
const SOCKET_WINDOW_MS = 60 * 1000;

export function checkSocketRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = socketConnectionCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    socketConnectionCounts.set(ip, { count: 1, resetAt: now + SOCKET_WINDOW_MS });
    return true;
  }

  if (entry.count >= SOCKET_MAX_CONNECTIONS_PER_IP) {
    return false;
  }

  entry.count++;
  return true;
}

// Periodic cleanup of stale socket rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of socketConnectionCounts) {
    if (now > entry.resetAt) {
      socketConnectionCounts.delete(ip);
    }
  }
}, 60 * 1000);
