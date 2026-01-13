import { Request } from 'express';

// Keep enums compatible with Prisma string unions by exporting:
// - a runtime value object for convenience (UserRole.ADMIN)
// - a string-literal union type for strong typing
export const UserRole = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export enum ExamCategory {
  IELTS = 'IELTS',
  PTE = 'PTE',
  TOEIC = 'TOEIC',
  FLYER = 'FLYER',
  MOVER = 'MOVER',
  STARTERS = 'STARTERS',
  KET = 'KET',
  PET = 'PET',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_BLANK = 'FILL_BLANK',
  MATCHING = 'MATCHING',
  ESSAY = 'ESSAY',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

export enum ExamSection {
  READING = 'READING',
  WRITING = 'WRITING',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  EXAM_UNLOCK = 'EXAM_UNLOCK',
  REFUND = 'REFUND',
  BONUS = 'BONUS',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum DifficultyLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

// Express Request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Question Options
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

// Email
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
