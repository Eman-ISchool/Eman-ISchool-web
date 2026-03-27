import { get, post, patch } from './client';

/**
 * Support API module
 * Handles support tickets and messaging
 */

/**
 * Get all support tickets for the current user
 */
export async function getTickets(params?: { page?: number; limit?: number; status?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/support/tickets${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

/**
 * Create a new support ticket
 */
export async function createTicket(data: {
  subject: string;
  description: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}) {
  return await post<any>('/support/tickets', data);
}

/**
 * Get support ticket by ID
 */
export async function getTicketById(id: string) {
  return await get<any>(`/support/tickets/${id}`);
}

/**
 * Update a support ticket (e.g., change status or priority)
 */
export async function updateTicket(id: string, data: {
  status?: string;
  priority?: 'low' | 'medium' | 'high';
}) {
  return await patch<any>(`/support/tickets/${id}`, data);
}

/**
 * Add a message to a support ticket thread
 */
export async function addTicketMessage(id: string, data: {
  message: string;
  attachments?: string[];
}) {
  return await post<any>(`/support/tickets/${id}/messages`, data);
}

// Export as object for backward compatibility
export const supportApi = {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  addTicketMessage,
};

export default supportApi;
