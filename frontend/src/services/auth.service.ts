import axios from '@utils/axios';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@appTypes/index';

export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ user: User; message: string }> {
    const response = await axios.post('/auth/register', data);
    return response.data.data;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post('/auth/login', credentials);
    return response.data.data;
  },

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    await axios.post('/auth/logout', { refreshToken });
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axios.post('/auth/refresh-token', { refreshToken });
    return response.data.data;
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await axios.get(`/auth/verify-email/${token}`);
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<void> {
    await axios.post('/auth/resend-verification', { email });
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await axios.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await axios.post('/auth/reset-password', { token, password });
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await axios.get('/auth/me');
    return response.data.data;
  },
};
