import { get, post, del } from './client';
import type { 
  ReelFeedResponse, 
  ReelDetailResponse, 
  UpdateReelProgressRequest,
  UpdateReelProgressResponse,
  BookmarkReelResponse,
  MarkUnderstoodResponse,
  ReelFeedParams 
} from '@/types/api';

/**
 * Reels API module
 * Handles video reels feed, progress tracking, and interactions
 */

/**
 * Get reels feed with pagination
 */
export async function getReelsFeed(params?: ReelFeedParams): Promise<ReelFeedResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.subject) queryParams.append('subject', params.subject);
  if (params?.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel);
  
  const queryString = queryParams.toString();
  const endpoint = `/reels${queryString ? `?${queryString}` : ''}`;
  
  return await get<ReelFeedResponse>(endpoint);
}

/**
 * Get reel details by ID
 */
export async function getReelById(reelId: string): Promise<ReelDetailResponse> {
  return await get<ReelDetailResponse>(`/reels/${reelId}`);
}

/**
 * Update watch progress for a reel
 */
export async function updateReelProgress(
  reelId: string,
  watchedSeconds: number
): Promise<UpdateReelProgressResponse> {
  return await post<UpdateReelProgressResponse>(`/reels/${reelId}/progress`, { watchedSeconds });
}

/**
 * Get watch progress for a reel
 */
export async function getReelProgress(reelId: string): Promise<UpdateReelProgressResponse> {
  return await get<UpdateReelProgressResponse>(`/reels/${reelId}/progress`);
}

/**
 * Bookmark/unbookmark a reel
 */
export async function toggleReelBookmark(reelId: string): Promise<BookmarkReelResponse> {
  return await post<BookmarkReelResponse>(`/reels/${reelId}/bookmark`);
}

/**
 * Mark reel as understood
 */
export async function markReelUnderstood(reelId: string): Promise<MarkUnderstoodResponse> {
  return await post<MarkUnderstoodResponse>(`/reels/${reelId}/understood`);
}

/**
 * Get bookmarked reels
 */
export async function getBookmarkedReels(params?: ReelFeedParams): Promise<ReelFeedResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/reels/bookmarked${queryString ? `?${queryString}` : ''}`;
  
  return await get<ReelFeedResponse>(endpoint);
}

/**
 * Get completed reels
 */
export async function getCompletedReels(params?: ReelFeedParams): Promise<ReelFeedResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/reels/completed${queryString ? `?${queryString}` : ''}`;
  
  return await get<ReelFeedResponse>(endpoint);
}

/**
 * Report a reel
 */
export async function reportReel(reelId: string, reason: string): Promise<void> {
  await post<void>(`/reels/${reelId}/report`, { reason });
}

// Export as object for backward compatibility
export const reelsApi = {
  getFeed: getReelsFeed,
  getReelById,
  updateProgress: updateReelProgress,
  getProgress: getReelProgress,
  toggleBookmark: toggleReelBookmark,
  markUnderstood: markReelUnderstood,
  getBookmarkedReels,
  getCompletedReels,
  reportReel,
};

export default reelsApi;
