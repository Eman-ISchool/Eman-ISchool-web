import { get, post } from './client';

/**
 * Payments API module
 * Handles payment checkout and invoice management
 */

/**
 * Create a checkout session
 */
export async function createCheckout(data: {
  courseId?: string;
  bundleId?: string;
  amount?: number;
  currency?: string;
}) {
  return await post<any>('/payments/checkout', data);
}

/**
 * Get all invoices for the current user
 */
export async function getInvoices(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/invoices${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string) {
  return await get<any>(`/invoices/${id}`);
}

// Export as object for backward compatibility
export const paymentsApi = {
  createCheckout,
  getInvoices,
  getInvoiceById,
};

export default paymentsApi;
