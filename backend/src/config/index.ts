import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  isProduction: process.env.NODE_ENV === 'production',

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  redis: {
    url: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: '24h',
  },

  cors: {
    origin: optionalEnv('CORS_ORIGIN', 'http://localhost:3000'),
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    enabled: !!process.env.OPENAI_API_KEY,
  },

  turn: {
    urls: process.env.TURN_URLS ? process.env.TURN_URLS.split(',') : [],
    username: process.env.TURN_USERNAME || '',
    credential: process.env.TURN_CREDENTIAL || '',
    enabled: !!process.env.TURN_URLS,
  },

  sfu: {
    enabled: optionalEnv('SFU_ENABLED', 'true') === 'true',
    listenIp: optionalEnv('SFU_LISTEN_IP', '0.0.0.0'),
    announcedIp: process.env.SFU_ANNOUNCED_IP || undefined,
    minPort: parseInt(optionalEnv('SFU_MIN_PORT', '40000'), 10),
    maxPort: parseInt(optionalEnv('SFU_MAX_PORT', '49999'), 10),
  },

  cleanup: {
    intervalMinutes: parseInt(optionalEnv('CLEANUP_INTERVAL_MINUTES', '15'), 10),
    sessionTtlHours: parseInt(optionalEnv('CLEANUP_SESSION_TTL_HOURS', '24'), 10),
    roomIdleMinutes: parseInt(optionalEnv('CLEANUP_ROOM_IDLE_MINUTES', '60'), 10),
  },
} as const;
