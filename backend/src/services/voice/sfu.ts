import { config } from '../../config';
import { SFU_THRESHOLD } from '../../../../shared/constants';

// mediasoup types (loaded dynamically if available)
type MediasoupWorker = {
  close: () => void;
  createRouter: (opts: { mediaCodecs: MediaCodec[] }) => Promise<MediasoupRouter>;
};
type MediasoupRouter = {
  id: string;
  close: () => void;
  createWebRtcTransport: (opts: WebRtcTransportOptions) => Promise<MediasoupTransport>;
  canConsume: (opts: { producerId: string; rtpCapabilities: RtpCapabilities }) => boolean;
  rtpCapabilities: RtpCapabilities;
};
type MediasoupTransport = {
  id: string;
  close: () => void;
  iceParameters: unknown;
  iceCandidates: unknown;
  dtlsParameters: unknown;
  connect: (opts: { dtlsParameters: unknown }) => Promise<void>;
  produce: (opts: { kind: string; rtpParameters: unknown }) => Promise<MediasoupProducer>;
  consume: (opts: { producerId: string; rtpCapabilities: RtpCapabilities; paused: boolean }) => Promise<MediasoupConsumer>;
};
type MediasoupProducer = { id: string; close: () => void };
type MediasoupConsumer = { id: string; close: () => void; resume: () => Promise<void> };
type RtpCapabilities = Record<string, unknown>;
type MediaCodec = { kind: string; mimeType: string; clockRate: number; channels?: number };
type WebRtcTransportOptions = {
  listenIps: { ip: string; announcedIp?: string }[];
  enableUdp: boolean;
  enableTcp: boolean;
  preferUdp: boolean;
};

const MEDIA_CODECS: MediaCodec[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
];

// Per-room SFU state
interface RoomSfuState {
  router: MediasoupRouter;
  transports: Map<string, MediasoupTransport>; // participantId → transport
  producers: Map<string, MediasoupProducer>;    // participantId → producer
  consumers: Map<string, MediasoupConsumer[]>;  // participantId → consumers
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mediasoupModule: any = null;
let workers: MediasoupWorker[] = [];
let workerIndex = 0;
const roomStates = new Map<string, RoomSfuState>();

async function loadMediasoup(): Promise<boolean> {
  try {
    // Dynamic import — mediasoup is optional, only needed for rooms > 4
    mediasoupModule = await (Function('return import("mediasoup")')());
    return true;
  } catch {
    console.warn('[SFU] mediasoup not installed — rooms > 4 will use P2P mesh (degraded quality)');
    return false;
  }
}

export async function initializeSfu(): Promise<boolean> {
  if (!config.sfu.enabled) {
    console.log('[SFU] Disabled by configuration');
    return false;
  }

  const loaded = await loadMediasoup();
  if (!loaded || !mediasoupModule) return false;

  try {
    const numWorkers = Math.min(require('os').cpus().length, 4);
    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoupModule.createWorker({
        rtcMinPort: config.sfu.minPort,
        rtcMaxPort: config.sfu.maxPort,
        logLevel: 'warn',
      });

      worker.on('died', () => {
        console.error(`[SFU] Worker ${i} died, restarting...`);
        workers = workers.filter((w) => w !== worker);
        // Auto-restart
        mediasoupModule!.createWorker({
          rtcMinPort: config.sfu.minPort,
          rtcMaxPort: config.sfu.maxPort,
          logLevel: 'warn',
        }).then((newWorker: MediasoupWorker) => {
          workers.push(newWorker as unknown as MediasoupWorker);
        });
      });

      workers.push(worker as unknown as MediasoupWorker);
    }

    console.log(`[SFU] Initialized ${numWorkers} mediasoup workers`);
    return true;
  } catch (err) {
    console.error('[SFU] Failed to initialize:', err);
    return false;
  }
}

function getNextWorker(): MediasoupWorker | null {
  if (workers.length === 0) return null;
  const worker = workers[workerIndex % workers.length];
  workerIndex++;
  return worker;
}

export function isSfuAvailable(): boolean {
  return workers.length > 0;
}

export function shouldUseSfu(participantCount: number): boolean {
  return participantCount > SFU_THRESHOLD && isSfuAvailable();
}

export async function createRoomRouter(roomId: string): Promise<RtpCapabilities | null> {
  const worker = getNextWorker();
  if (!worker) return null;

  try {
    const router = await worker.createRouter({ mediaCodecs: MEDIA_CODECS });

    roomStates.set(roomId, {
      router,
      transports: new Map(),
      producers: new Map(),
      consumers: new Map(),
    });

    console.log(`[SFU] Created router for room ${roomId}`);
    return router.rtpCapabilities;
  } catch (err) {
    console.error(`[SFU] Failed to create router for room ${roomId}:`, err);
    return null;
  }
}

export async function createTransport(
  roomId: string,
  participantId: string,
): Promise<{
  id: string;
  iceParameters: unknown;
  iceCandidates: unknown;
  dtlsParameters: unknown;
} | null> {
  const state = roomStates.get(roomId);
  if (!state) return null;

  try {
    const transport = await state.router.createWebRtcTransport({
      listenIps: [
        {
          ip: config.sfu.listenIp,
          announcedIp: config.sfu.announcedIp,
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    state.transports.set(participantId, transport);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  } catch (err) {
    console.error(`[SFU] Failed to create transport for ${participantId} in room ${roomId}:`, err);
    return null;
  }
}

export async function connectTransport(
  roomId: string,
  participantId: string,
  dtlsParameters: unknown,
): Promise<boolean> {
  const state = roomStates.get(roomId);
  if (!state) return false;

  const transport = state.transports.get(participantId);
  if (!transport) return false;

  try {
    await transport.connect({ dtlsParameters });
    return true;
  } catch (err) {
    console.error(`[SFU] Failed to connect transport for ${participantId}:`, err);
    return false;
  }
}

export async function produce(
  roomId: string,
  participantId: string,
  kind: string,
  rtpParameters: unknown,
): Promise<string | null> {
  const state = roomStates.get(roomId);
  if (!state) return null;

  const transport = state.transports.get(participantId);
  if (!transport) return null;

  try {
    const producer = await transport.produce({ kind, rtpParameters });
    state.producers.set(participantId, producer);
    return producer.id;
  } catch (err) {
    console.error(`[SFU] Failed to produce for ${participantId}:`, err);
    return null;
  }
}

export async function consume(
  roomId: string,
  consumerParticipantId: string,
  producerParticipantId: string,
  rtpCapabilities: RtpCapabilities,
): Promise<{
  id: string;
  producerId: string;
  kind: string;
  rtpParameters: unknown;
} | null> {
  const state = roomStates.get(roomId);
  if (!state) return null;

  const producer = state.producers.get(producerParticipantId);
  if (!producer) return null;

  const transport = state.transports.get(consumerParticipantId);
  if (!transport) return null;

  if (!state.router.canConsume({ producerId: producer.id, rtpCapabilities })) {
    return null;
  }

  try {
    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: false,
    });

    const consumers = state.consumers.get(consumerParticipantId) || [];
    consumers.push(consumer);
    state.consumers.set(consumerParticipantId, consumers);

    await consumer.resume();

    return {
      id: consumer.id,
      producerId: producer.id,
      kind: 'audio',
      rtpParameters: {},
    };
  } catch (err) {
    console.error(`[SFU] Failed to consume for ${consumerParticipantId}:`, err);
    return null;
  }
}

export function removeParticipantFromSfu(roomId: string, participantId: string): void {
  const state = roomStates.get(roomId);
  if (!state) return;

  // Close producer
  const producer = state.producers.get(participantId);
  if (producer) {
    producer.close();
    state.producers.delete(participantId);
  }

  // Close consumers
  const consumers = state.consumers.get(participantId);
  if (consumers) {
    consumers.forEach((c) => c.close());
    state.consumers.delete(participantId);
  }

  // Close transport
  const transport = state.transports.get(participantId);
  if (transport) {
    transport.close();
    state.transports.delete(participantId);
  }
}

export function closeRoomSfu(roomId: string): void {
  const state = roomStates.get(roomId);
  if (!state) return;

  // Close all producers, consumers, transports
  state.producers.forEach((p) => p.close());
  state.consumers.forEach((consumers) => consumers.forEach((c) => c.close()));
  state.transports.forEach((t) => t.close());
  state.router.close();

  roomStates.delete(roomId);
  console.log(`[SFU] Closed router for room ${roomId}`);
}

export function shutdownSfu(): void {
  for (const [roomId] of roomStates) {
    closeRoomSfu(roomId);
  }
  workers.forEach((w) => w.close());
  workers = [];
  console.log('[SFU] Shutdown complete');
}
