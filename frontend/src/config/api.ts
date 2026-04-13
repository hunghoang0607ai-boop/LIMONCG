export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
};

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'LIMONCG CRM',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Marketing Agency CRM',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'crm_access_token',
  REFRESH_TOKEN: 'crm_refresh_token',
  USER: 'crm_user',
};
