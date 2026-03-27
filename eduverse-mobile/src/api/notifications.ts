import { get } from './client';

/**
 * Notifications API module
 * Handles notification retrieval
 */

/**
 * Get all notifications for the current user
 */
export async function getNotifications(params?: { page?: number; limit?: number; unread?: boolean }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.unread !== undefined) queryParams.append('unread', params.unread.toString());

  const queryString = queryParams.toString();
  const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

// Export as object for backward compatibility
export const notificationsApi = {
  getNotifications,
};

export default notificationsApi;
