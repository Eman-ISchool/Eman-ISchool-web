import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Initialize default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ prefix: 'coffee_gathering_' });

// ─── Custom Metrics ──────────────────────────────────────────────

// HTTP request duration
export const httpRequestDuration = new client.Histogram({
  name: 'coffee_gathering_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

// HTTP requests total
export const httpRequestsTotal = new client.Counter({
  name: 'coffee_gathering_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Active socket connections
export const activeSocketConnections = new client.Gauge({
  name: 'coffee_gathering_active_socket_connections',
  help: 'Number of active Socket.IO connections',
});

// Active rooms
export const activeRoomsGauge = new client.Gauge({
  name: 'coffee_gathering_active_rooms',
  help: 'Number of currently active rooms',
  labelNames: ['type'],
});

// Participants per room (histogram)
export const participantsPerRoom = new client.Histogram({
  name: 'coffee_gathering_participants_per_room',
  help: 'Number of participants per room when room closes',
  buckets: [1, 2, 3, 4, 5, 6, 8, 10, 12],
});

// Room lifecycle events
export const roomLifecycleEvents = new client.Counter({
  name: 'coffee_gathering_room_lifecycle_total',
  help: 'Room lifecycle events',
  labelNames: ['event'], // created, joined, left, closed
});

// AI suggestion latency
export const aiSuggestionLatency = new client.Histogram({
  name: 'coffee_gathering_ai_suggestion_duration_seconds',
  help: 'Duration of AI suggestion generation',
  buckets: [0.1, 0.25, 0.5, 1, 2, 5],
});

// AI suggestion outcomes
export const aiSuggestionOutcome = new client.Counter({
  name: 'coffee_gathering_ai_suggestion_outcome_total',
  help: 'AI suggestion outcomes',
  labelNames: ['outcome'], // success, fallback, error
});

// STT latency
export const sttLatency = new client.Histogram({
  name: 'coffee_gathering_stt_duration_seconds',
  help: 'Duration of speech-to-text processing',
  buckets: [0.1, 0.25, 0.5, 1, 2, 5],
});

// Moderation events
export const moderationEvents = new client.Counter({
  name: 'coffee_gathering_moderation_events_total',
  help: 'Content moderation events',
  labelNames: ['severity', 'flagged'],
});

// Turn transitions
export const turnTransitions = new client.Counter({
  name: 'coffee_gathering_turn_transitions_total',
  help: 'Turn transitions',
  labelNames: ['type'], // requested, started, ended, timeout
});

// Turn transition latency
export const turnTransitionLatency = new client.Histogram({
  name: 'coffee_gathering_turn_transition_duration_seconds',
  help: 'Duration of turn transitions',
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1],
});

// Matching queue depth
export const matchingQueueDepth = new client.Gauge({
  name: 'coffee_gathering_matching_queue_depth',
  help: 'Number of entries in the matching queue',
  labelNames: ['drink_type'],
});

// Matching latency (time from join queue to match)
export const matchingLatency = new client.Histogram({
  name: 'coffee_gathering_matching_duration_seconds',
  help: 'Time from joining queue to being matched',
  buckets: [1, 3, 5, 10, 20, 30, 60, 120],
});

// ─── Express Middleware ──────────────────────────────────────────

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/metrics') {
    next();
    return;
  }

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationSec = durationNs / 1e9;

    // Normalize route pattern (replace UUIDs with :id)
    const route = req.route?.path || req.path.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ':id',
    );

    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      durationSec,
    );
    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
  });

  next();
}

// ─── Metrics Endpoint ────────────────────────────────────────────

export async function metricsEndpoint(_req: Request, res: Response): Promise<void> {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end('Error generating metrics');
  }
}

// ─── Helper Functions ────────────────────────────────────────────

export function trackSocketConnection(): void {
  activeSocketConnections.inc();
}

export function trackSocketDisconnection(): void {
  activeSocketConnections.dec();
}

export function trackRoomCreated(type: string): void {
  activeRoomsGauge.inc({ type });
  roomLifecycleEvents.inc({ event: 'created' });
}

export function trackRoomClosed(type: string, participantCount: number): void {
  activeRoomsGauge.dec({ type });
  roomLifecycleEvents.inc({ event: 'closed' });
  participantsPerRoom.observe(participantCount);
}

export function trackRoomJoin(): void {
  roomLifecycleEvents.inc({ event: 'joined' });
}

export function trackRoomLeave(): void {
  roomLifecycleEvents.inc({ event: 'left' });
}

export function trackAISuggestion(durationMs: number, outcome: 'success' | 'fallback' | 'error'): void {
  aiSuggestionLatency.observe(durationMs / 1000);
  aiSuggestionOutcome.inc({ outcome });
}

export function trackSTT(durationMs: number): void {
  sttLatency.observe(durationMs / 1000);
}

export function trackModeration(severity: string, flagged: boolean): void {
  moderationEvents.inc({ severity, flagged: String(flagged) });
}

export function trackTurnTransition(type: 'requested' | 'started' | 'ended' | 'timeout', durationMs?: number): void {
  turnTransitions.inc({ type });
  if (durationMs !== undefined) {
    turnTransitionLatency.observe(durationMs / 1000);
  }
}

export function trackMatchingQueueDepth(drinkType: string, depth: number): void {
  matchingQueueDepth.set({ drink_type: drinkType }, depth);
}

export function trackMatchingLatency(durationMs: number): void {
  matchingLatency.observe(durationMs / 1000);
}
