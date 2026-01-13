import axios from '@utils/axios';
import { User } from '@appTypes/index';

interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  country?: string;
  dateOfBirth?: string;
  avatar?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UserStatistics {
  totalExamsTaken: number;
  averageScore: number | null;
  recentAttempts: any[];
  credits: number;
}

export const userService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    const response = await axios.get('/users/me');
    return response.data.data;
  },

  /**
   * Update profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await axios.put('/users/me', data);
    return response.data.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await axios.put('/users/me/password', data);
  },

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    const response = await axios.get('/users/me/statistics');
    return response.data.data;
  },
};
