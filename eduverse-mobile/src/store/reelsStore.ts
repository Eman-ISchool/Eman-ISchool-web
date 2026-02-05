/**
 * Zustand reels store
 * Manages reels feed state, progress tracking, and bookmarks
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ReelFeedItem } from '@/types/api';

interface ReelsStore {
  reels: ReelFeedItem[];
  currentReelId: string | null;
  watchedReels: Set<string>;
  bookmarkedReels: Set<string>;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  limit: number;
  
  // Actions
  setReels: (reels: ReelFeedItem[]) => void;
  setCurrentReel: (reelId: string | null) => void;
  addWatchedReel: (reelId: string) => void;
  addBookmarkedReel: (reelId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  fetchReels: (refresh?: boolean) => Promise<void>;
  fetchMoreReels: () => Promise<void>;
}

// Create persist storage for Zustand
const storage = createJSONStorage(() => ({
  getItem: (name) => {
    // For now, use a simple storage approach
    // In production, this would use AsyncStorage
    return Promise.resolve(null);
  },
  setItem: (name, value) => {
    // For now, use a simple storage approach
    // In production, this would use AsyncStorage
    return Promise.resolve();
  },
  removeItem: (name) => {
    // For now, use a simple storage approach
    // In production, this would use AsyncStorage
    return Promise.resolve();
  },
}));

// Create reels store
export const useReelsStore = create<ReelsStore>()(
  persist(
    (set, get) => ({
      reels: [],
      currentReelId: null,
      watchedReels: new Set(),
      bookmarkedReels: new Set(),
      isLoading: false,
      error: null,
      hasMore: false,
      page: 1,
      limit: 20,

      setReels: (reels) => set({ reels }),
      
      setCurrentReel: (reelId) => set({ currentReelId: reelId }),
      
      addWatchedReel: (reelId) => {
        const watched = get().watchedReels;
        const newWatched = new Set(watched);
        newWatched.add(reelId);
        set({ watchedReels: newWatched });
      },
      
      addBookmarkedReel: (reelId) => {
        const bookmarked = get().bookmarkedReels;
        const newBookmarked = new Set(bookmarked);
        newBookmarked.add(reelId);
        set({ bookmarkedReels: newBookmarked });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setHasMore: (hasMore) => set({ hasMore }),
      
      setPage: (page) => set({ page }),
      
      fetchReels: async (refresh = false) => {
        set({ isLoading: true, error: null });
        
        try {
          // This will be implemented when API is ready
          // For now, just simulate a fetch
          await new Promise<void>((resolve) => setTimeout(resolve, 1000));
          
          // TODO: Call reels API to fetch reels
          // const response = await reelsApi.getFeed({ page: get().page, limit: get().limit });
          // setReels(response.data);
          // setHasMore(response.pagination.hasMore);
        } catch (err: any) {
          console.error('Failed to fetch reels:', err);
          set({ error: err.message || 'Failed to load reels' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchMoreReels: async () => {
        if (get().isLoading || get().hasMore) {
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const nextPage = get().page + 1;
          // TODO: Call reels API to fetch more reels
          // const response = await reelsApi.getFeed({ page: nextPage, limit: get().limit });
          // setReels([...get().reels, ...response.data]);
          // setHasMore(response.pagination.hasMore);
          // setPage(nextPage);
          await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        } catch (err: any) {
          console.error('Failed to fetch more reels:', err);
          set({ error: err.message || 'Failed to load more reels' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'reels-storage',
      storage,
    }
  )
);

// Selector hooks for convenience
export const useReels = () => useReelsStore(state => state.reels);
export const useCurrentReel = () => useReelsStore(state => state.currentReelId);
export const useIsLoadingReels = () => useReelsStore(state => state.isLoading);
export const useReelsError = () => useReelsStore(state => state.error);
export const useHasMoreReels = () => useReelsStore(state => state.hasMore);
