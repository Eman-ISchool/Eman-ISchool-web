import { get, post } from './client';
import type { AnnouncementResponse, AnnouncementsResponse, PaginationParams } from '@/types/api';

/**
 * Announcements API module
 * Handles announcements and notifications
 */

export const announcementsApi = {
  /**
   * Get all announcements with pagination
   */
  async getAnnouncements(params?: PaginationParams): Promise<AnnouncementsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/announcements${queryString ? `?${queryString}` : ''}`;
    
    return await get<AnnouncementsResponse>(endpoint);
  },

  /**
   * Get unread announcements
   */
  async getUnreadAnnouncements(): Promise<AnnouncementsResponse> {
    return await get<AnnouncementsResponse>('/announcements/unread');
  },

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(announcementId: string): Promise<AnnouncementResponse> {
    return await get<AnnouncementResponse>(`/announcements/${announcementId}`);
  },

  /**
   * Mark announcement as read
   */
  async markAsRead(announcementId: string): Promise<void> {
    await post<void>(`/announcements/${announcementId}/read`);
  },

  /**
   * Mark all announcements as read
   */
  async markAllAsRead(): Promise<void> {
    await post<void>('/announcements/read-all');
  },

  /**
   * Dismiss announcement
   */
  async dismissAnnouncement(announcementId: string): Promise<void> {
    await post<void>(`/announcements/${announcementId}/dismiss`);
  },
};

export default announcementsApi;
