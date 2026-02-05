import { get, post, put } from './client';
import type { UserResponse, UpdateProfileRequest } from '@/types/api';

/**
 * Users API module
 * Handles user profile operations
 */

/**
 * Get current user profile
 */
export async function getProfile(): Promise<UserResponse> {
  return await get<UserResponse>('/users/me');
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserResponse> {
  return await get<UserResponse>(`/users/${userId}`);
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
  return await put<UserResponse>('/users/me', data);
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(fileUri: string): Promise<UserResponse> {
  const formData = new FormData();
  formData.append('avatar', {
    uri: fileUri,
    type: 'image/jpeg',
    name: 'avatar.jpg',
  } as any);

  return await post<UserResponse>('/users/me/avatar', formData);
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<void> {
  await post<void>('/users/me/delete');
}

// Export as object for backward compatibility
export const usersApi = {
  getProfile,
  getUserById,
  updateProfile,
  uploadAvatar,
  deleteAccount,
};

export default usersApi;
