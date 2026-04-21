'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWithRetry } from '@/lib/fetch-with-retry';

interface UseMeetingHeartbeatProps {
    lessonId: string;
    enabled?: boolean;
    heartbeatIntervalMs?: number; // Default 30000ms (30s)
}

/**
 * Hook to manage meeting join/leave actions and automated heartbeat polling.
 * Useful for automated attendance tracking in live sessions.
 */
export function useMeetingHeartbeat({
    lessonId,
    enabled = true,
    heartbeatIntervalMs = 30000
}: UseMeetingHeartbeatProps) {
    const [hasJoined, setHasJoined] = useState(false);
    const [status, setStatus] = useState<'idle' | 'joining' | 'active' | 'leaving' | 'error'>('idle');
    const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

    const joinMeeting = useCallback(async () => {
        if (!lessonId) return;
        setStatus('joining');

        try {
            const res = await fetchWithRetry(`/api/lessons/${lessonId}/join`, {
                method: 'POST',
            });

            if (res.ok) {
                setHasJoined(true);
                setStatus('active');
                startHeartbeat();
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Failed to join meeting', error);
            setStatus('error');
        }
    }, [lessonId]);

    const leaveMeeting = useCallback(async (endLesson = false) => {
        if (!lessonId || !hasJoined) return;

        setStatus('leaving');
        stopHeartbeat();

        try {
            await fetchWithRetry(`/api/lessons/${lessonId}/leave`, {
                method: 'POST',
                body: JSON.stringify({ endLesson }),
            });
            setHasJoined(false);
            setStatus('idle');
        } catch (error) {
            console.error('Failed to leave meeting', error);
            setStatus('error');
        }
    }, [lessonId, hasJoined]);

    const sendHeartbeat = useCallback(async () => {
        if (!lessonId) return;

        try {
            await fetch(`/api/lessons/${lessonId}/heartbeat`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Heartbeat failed', error);
        }
    }, [lessonId]);

    const startHeartbeat = useCallback(() => {
        if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
        heartbeatTimer.current = setInterval(sendHeartbeat, heartbeatIntervalMs);
    }, [sendHeartbeat, heartbeatIntervalMs]);

    const stopHeartbeat = useCallback(() => {
        if (heartbeatTimer.current) {
            clearInterval(heartbeatTimer.current);
            heartbeatTimer.current = null;
        }
    }, []);

    // Ensure heartbeat stops on unmount
    useEffect(() => {
        return () => {
            stopHeartbeat();
            // Optionally fire leave event on unmount, but reliable beacon API is better for real world
        };
    }, [stopHeartbeat]);

    // Handle page unload / visibility change
    useEffect(() => {
        if (!enabled || !hasJoined) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Pausing or slowing down heartbeat when hidden could be done here
            } else {
                // Immediate heartbeat on return
                sendHeartbeat();
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Best effort to leave using beacon (navigator.sendBeacon)
            navigator.sendBeacon(`/api/lessons/${lessonId}/leave`, JSON.stringify({}));
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [enabled, hasJoined, lessonId, sendHeartbeat]);

    return {
        joinMeeting,
        leaveMeeting,
        status,
        hasJoined
    };
}
