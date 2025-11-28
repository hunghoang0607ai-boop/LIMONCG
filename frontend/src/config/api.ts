export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
};

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'LIMONCG',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'English Exam Platform',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'limoncg_access_token',
  REFRESH_TOKEN: 'limoncg_refresh_token',
  USER: 'limoncg_user',
};
