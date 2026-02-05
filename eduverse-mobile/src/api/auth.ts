import { post } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OAuthRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '@/types/api';

/**
 * Authentication API module
 * Handles all authentication-related API calls
 */

export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return await post<AuthResponse>('/auth/login', credentials);
  },

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return await post<AuthResponse>('/auth/register', userData);
  },

  /**
   * Exchange OAuth token for JWT
   * Used for Google Sign-In
   */
  async exchangeOAuthToken(oauthData: OAuthRequest): Promise<AuthResponse> {
    return await post<AuthResponse>('/auth/oauth', oauthData);
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: RefreshTokenRequest): Promise<AuthResponse> {
    return await post<AuthResponse>('/auth/refresh', refreshToken);
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await post<void>('/auth/logout');
  },

  /**
   * Request password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await post<void>('/auth/forgot-password', data);
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await post<void>('/auth/reset-password', data);
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    await post<void>('/auth/verify-email', { token });
  },
};

export default authApi;
