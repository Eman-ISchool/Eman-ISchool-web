import prisma from '../../lib/prisma';
import { getRedis } from '../../lib/redis';
import { config } from '../../config';
import { RedisKeys } from '../../../../shared/constants';
import { closeRoomSfu } from '../voice/sfu';

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export function startCleanupJob(): void {
  if (cleanupInterval) return;

  const intervalMs = config.cleanup.intervalMinutes * 60 * 1000;

  // Run immediately on start, then on interval
  runCleanup().catch((err) => console.error('[Cleanup] Initial run failed:', err));

  cleanupInterval = setInterval(() => {
    runCleanup().catch((err) => console.error('[Cleanup] Scheduled run failed:', err));
  }, intervalMs);

  console.log(`[Cleanup] Job started, running every ${config.cleanup.intervalMinutes} minutes`);
}

export function stopCleanupJob(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[Cleanup] Job stopped');
  }
}

async function runCleanup(): Promise<void> {
  const startTime = Date.now();
  let expiredSessions = 0;
  let orphanedRooms = 0;
  let staleParticipants = 0;
  let staleQueueEntries = 0;

  try {
    // 1. Clean expired guest sessions
    const sessionCutoff = new Date();
    const result = await prisma.guestSession.deleteMany({
      where: {
        expiresAt: { lt: sessionCutoff },
      },
    });
    expiredSessions = result.count;

    // 2. Close rooms that have been idle too long (no active participants)
    const roomIdleCutoff = new Date(Date.now() - config.cleanup.roomIdleMinutes * 60 * 1000);
    const idleRooms = await prisma.room.findMany({
      where: {
        status: { in: ['ACTIVE', 'WAITING'] },
        createdAt: { lt: roomIdleCutoff },
      },
      select: { id: true },
    });

    for (const room of idleRooms) {
      const activeParticipants = await prisma.roomParticipant.count({
        where: { roomId: room.id, leftAt: null },
      });

      if (activeParticipants === 0) {
        await prisma.room.update({
          where: { id: room.id },
          data: { status: 'CLOSED', closedAt: new Date() },
        });

        // Clean Redis state
        const redis = getRedis();
        await redis.del(RedisKeys.room(room.id));
        await redis.del(RedisKeys.roomParticipants(room.id));
        await redis.del(RedisKeys.roomTurn(room.id));
        await redis.srem(RedisKeys.activeRooms(), room.id);

        // Clean SFU state
        closeRoomSfu(room.id);

        orphanedRooms++;
      }
    }

    // 3. Mark stale participants as left (connected but no heartbeat for > grace period)
    const staleParticipantCutoff = new Date(Date.now() - 5 * 60 * 1000); // 5 min stale
    const staleResult = await prisma.roomParticipant.updateMany({
      where: {
        leftAt: null,
        joinedAt: { lt: staleParticipantCutoff },
        room: { status: 'CLOSED' },
      },
      data: { leftAt: new Date() },
    });
    staleParticipants = staleResult.count;

    // 4. Clean stale matching queue entries in Redis
    const redis = getRedis();
    const queueKeys = await redis.keys(RedisKeys.matchingQueueAll());
    for (const key of queueKeys) {
      const entries = await redis.lrange(key, 0, -1);
      for (const entry of entries) {
        try {
          const parsed = JSON.parse(entry);
          const waitTime = (Date.now() - new Date(parsed.joinedQueueAt).getTime()) / 1000;
          if (waitTime > 300) { // 5 minutes stale
            await redis.lrem(key, 1, entry);
            staleQueueEntries++;
          }
        } catch {
          // Malformed entry, remove it
          await redis.lrem(key, 1, entry);
          staleQueueEntries++;
        }
      }

      // Remove empty queue keys
      const remaining = await redis.llen(key);
      if (remaining === 0) {
        await redis.del(key);
      }
    }

    // 5. Clean stale active rooms set in Redis
    const activeRoomIds = await redis.smembers(RedisKeys.activeRooms());
    for (const roomId of activeRoomIds) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { status: true },
      });
      if (!room || room.status === 'CLOSED') {
        await redis.srem(RedisKeys.activeRooms(), roomId);
      }
    }

    const durationMs = Date.now() - startTime;
    if (expiredSessions + orphanedRooms + staleParticipants + staleQueueEntries > 0) {
      console.log(
        `[Cleanup] Completed in ${durationMs}ms: ` +
        `${expiredSessions} expired sessions, ` +
        `${orphanedRooms} orphaned rooms, ` +
        `${staleParticipants} stale participants, ` +
        `${staleQueueEntries} stale queue entries`,
      );
    }
  } catch (err) {
    console.error('[Cleanup] Error during cleanup:', err);
  }
}

// Export for testing
export { runCleanup };
