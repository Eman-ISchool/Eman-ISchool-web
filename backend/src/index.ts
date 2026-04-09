import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { config } from './config';
import { connectRedis, disconnectRedis } from './lib/redis';
import prisma from './lib/prisma';
import routes from './api/routes';
import { setupSocketServer } from './api/socket';
import { startMatchingLoop, stopMatchingLoop } from './services/matching';
import { cleanupAllTimers } from './services/voice';
import { initializeSfu, shutdownSfu } from './services/voice/sfu';
import { startCleanupJob, stopCleanupJob } from './services/cleanup';
import { generalLimiter } from './lib/rate-limit';
import { metricsMiddleware, metricsEndpoint } from './lib/metrics';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(generalLimiter);
app.use(metricsMiddleware);

// Metrics endpoint (not rate limited)
app.get('/metrics', metricsEndpoint);

// Routes
app.use(routes);

// Socket.IO
const io = setupSocketServer(httpServer);

// Startup
async function start(): Promise<void> {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL');

    // Connect to Redis
    await connectRedis();
    console.log('[Redis] Connected');

    // Initialize SFU (non-blocking, graceful if mediasoup not available)
    const sfuReady = await initializeSfu();
    console.log(`[SFU] ${sfuReady ? 'Ready' : 'Not available (P2P only)'}`);

    // Start matching loop
    startMatchingLoop();

    // Start cleanup job
    startCleanupJob();

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`[Server] Running on port ${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
      console.log(`[Server] AI available: ${config.openai.enabled}`);
      console.log(`[Server] SFU available: ${sfuReady}`);
      console.log(`[Server] TURN configured: ${config.turn.enabled}`);
      console.log(`[Server] Metrics: http://localhost:${config.port}/metrics`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(): Promise<void> {
  console.log('[Server] Shutting down...');

  stopMatchingLoop();
  stopCleanupJob();
  cleanupAllTimers();
  shutdownSfu();

  io.close();
  httpServer.close();

  await disconnectRedis();
  await prisma.$disconnect();

  console.log('[Server] Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
