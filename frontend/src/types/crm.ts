export type UserRole = 'ADMIN' | 'MANAGER' | 'SALES' | 'MARKETER';
export type ContactStatus = 'LEAD' | 'PROSPECT' | 'QUALIFIED' | 'CLIENT' | 'INACTIVE';
export type ContactSource = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'EMAIL_CAMPAIGN' | 'COLD_OUTREACH' | 'EVENT' | 'OTHER';
export type DealStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'DEMO' | 'FOLLOW_UP';
export type CompanySize = 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  size?: CompanySize;
  revenue?: number;
  notes?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { contacts: number; deals: number; projects: number };
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  status: ContactStatus;
  source: ContactSource;
  notes?: string;
  tags: string[];
  linkedinUrl?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  company?: { id: string; name: string };
  assignedTo?: { id: string; fullName: string; email: string };
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  notes?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
  contact?: { id: string; firstName: string; lastName: string; email?: string };
  company?: { id: string; name: string };
  assignedTo?: { id: string; fullName: string; email: string };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  company?: { id: string; name: string };
  manager?: { id: string; fullName: string; email: string };
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: { id: string; fullName: string; email: string };
  contact?: { id: string; firstName: string; lastName: string };
  deal?: { id: string; title: string };
  project?: { id: string; name: string };
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  scheduledAt?: string;
  completedAt?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  contact?: { id: string; firstName: string; lastName: string };
  deal?: { id: string; title: string };
  createdBy: { id: string; fullName: string; email: string };
}

export interface DashboardStats {
  overview: {
    totalContacts: number;
    contactGrowth: number;
    activePipelineDeals: number;
    pipelineValue: number;
    wonDealsThisMonth: number;
    revenueThisMonth: number;
    activeTasks: number;
    overdueTasks: number;
    activeProjects: number;
  };
  dealsByStage: { stage: DealStage; count: number; value: number }[];
  contactsByStatus: { status: ContactStatus; count: number }[];
  tasksByStatus: { status: TaskStatus; count: number }[];
  recentActivities: Activity[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
