import axiosInstance from '@utils/axios';
import { Contact, Company, Deal, Project, Task, Activity, DashboardStats, PaginatedResponse, User } from '@types/crm';

const api = axiosInstance;

// Dashboard
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const r = await api.get('/dashboard/stats');
    return r.data.data;
  },
  getTeam: async (): Promise<User[]> => {
    const r = await api.get('/dashboard/team');
    return r.data.data;
  },
};

// Contacts
export const contactService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Contact>> => {
    const r = await api.get('/contacts', { params });
    return r.data.data;
  },
  getById: async (id: string): Promise<Contact> => {
    const r = await api.get(`/contacts/${id}`);
    return r.data.data;
  },
  create: async (data: Partial<Contact>): Promise<Contact> => {
    const r = await api.post('/contacts', data);
    return r.data.data;
  },
  update: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const r = await api.put(`/contacts/${id}`, data);
    return r.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
};

// Companies
export const companyService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Company>> => {
    const r = await api.get('/companies', { params });
    return r.data.data;
  },
  getById: async (id: string): Promise<Company> => {
    const r = await api.get(`/companies/${id}`);
    return r.data.data;
  },
  create: async (data: Partial<Company>): Promise<Company> => {
    const r = await api.post('/companies', data);
    return r.data.data;
  },
  update: async (id: string, data: Partial<Company>): Promise<Company> => {
    const r = await api.put(`/companies/${id}`, data);
    return r.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },
};

// Deals
export const dealService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Deal>> => {
    const r = await api.get('/deals', { params });
    return r.data.data;
  },
  getKanban: async (): Promise<Record<string, Deal[]>> => {
    const r = await api.get('/deals/kanban');
    return r.data.data;
  },
  getById: async (id: string): Promise<Deal> => {
    const r = await api.get(`/deals/${id}`);
    return r.data.data;
  },
  create: async (data: Partial<Deal>): Promise<Deal> => {
    const r = await api.post('/deals', data);
    return r.data.data;
  },
  update: async (id: string, data: Partial<Deal>): Promise<Deal> => {
    const r = await api.put(`/deals/${id}`, data);
    return r.data.data;
  },
  updateStage: async (id: string, stage: string, probability?: number, lostReason?: string): Promise<Deal> => {
    const r = await api.patch(`/deals/${id}/stage`, { stage, probability, lostReason });
    return r.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/deals/${id}`);
  },
};

// Projects
export const projectService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Project>> => {
    const r = await api.get('/projects', { params });
    return r.data.data;
  },
  getById: async (id: string): Promise<Project> => {
    const r = await api.get(`/projects/${id}`);
    return r.data.data;
  },
  create: async (data: Partial<Project>): Promise<Project> => {
    const r = await api.post('/projects', data);
    return r.data.data;
  },
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const r = await api.put(`/projects/${id}`, data);
    return r.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Tasks
export const taskService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Task>> => {
    const r = await api.get('/tasks', { params });
    return r.data.data;
  },
  getById: async (id: string): Promise<Task> => {
    const r = await api.get(`/tasks/${id}`);
    return r.data.data;
  },
  create: async (data: Partial<Task>): Promise<Task> => {
    const r = await api.post('/tasks', data);
    return r.data.data;
  },
  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    const r = await api.put(`/tasks/${id}`, data);
    return r.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Activities
export const activityService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Activity>> => {
    const r = await api.get('/activities', { params });
    return r.data.data;
  },
  create: async (data: Partial<Activity>): Promise<Activity> => {
    const r = await api.post('/activities', data);
    return r.data.data;
  },
  update: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const r = await api.put(`/activities/${id}`, data);
    return r.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },
};
