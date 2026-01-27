'use client';

import { useState, useCallback } from 'react';

export interface ReelEngagementState {
  isBookmarked: boolean;
  isUnderstood: boolean;
  progress: number;
  lastPosition: number;
  replayCount: number;
}

export interface UseReelEngagementReturn {
  state: ReelEngagementState;
  toggleBookmark: () => Promise<void>;
  toggleUnderstood: () => Promise<void>;
  updateProgress: (progress: number, lastPosition: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useReelEngagement(reelId: string): UseReelEngagementReturn {
  const [state, setState] = useState<ReelEngagementState>({
    isBookmarked: false,
    isUnderstood: false,
    progress: 0,
    lastPosition: 0,
    replayCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBookmark = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/reels/${reelId}/bookmark`, {
        method: state.isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update bookmark');
      }

      setState(prev => ({
        ...prev,
        isBookmarked: !prev.isBookmarked,
      }));
    } catch (err) {
      console.error('[useReelEngagement] Error toggling bookmark:', err);
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
    } finally {
      setIsLoading(false);
    }
  }, [reelId, state.isBookmarked]);

  const toggleUnderstood = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/reels/${reelId}/understood`, {
        method: state.isUnderstood ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update understood status');
      }

      setState(prev => ({
        ...prev,
        isUnderstood: !prev.isUnderstood,
      }));
    } catch (err) {
      console.error('[useReelEngagement] Error toggling understood:', err);
      setError(err instanceof Error ? err.message : 'Failed to update understood status');
    } finally {
      setIsLoading(false);
    }
  }, [reelId, state.isUnderstood]);

  const updateProgress = useCallback(async (progress: number, lastPosition: number) => {
    try {
      // Debounce progress updates to avoid too many API calls
      // Only update if progress changed by at least 5%
      if (Math.abs(progress - state.progress) < 5) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/reels/${reelId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress,
          lastPosition,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update progress');
      }

      setState(prev => ({
        ...prev,
        progress,
        lastPosition,
      }));
    } catch (err) {
      console.error('[useReelEngagement] Error updating progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setIsLoading(false);
    }
  }, [reelId, state.progress]);

  return {
    state,
    toggleBookmark,
    toggleUnderstood,
    updateProgress,
    isLoading,
    error,
  };
}
