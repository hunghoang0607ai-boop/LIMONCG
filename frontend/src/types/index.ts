// Mirror backend enums
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

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

export enum DifficultyLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

// User
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  credits: number;
  currentLevel?: DifficultyLevel;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Exam
export interface Exam {
  id: string;
  category: ExamCategory;
  title: string;
  description?: string;
  difficultyLevel: DifficultyLevel;
  durationMinutes: number;
  creditCost: number;
  isDemo: boolean;
  isPlacementTest: boolean;
  totalQuestions: number;
  passingScore: number;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
}

// Question
export interface Question {
  id: string;
  examId: string;
  section: ExamSection;
  questionType: QuestionType;
  questionText: any; // JSON
  mediaUrl?: string;
  mediaType?: string;
  options?: QuestionOption[];
  correctAnswer?: any;
  explanation?: string;
  points: number;
  orderIndex: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

// Exam Attempt
export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  exam?: Exam;
  startedAt: string;
  submittedAt?: string;
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  timeSpentSeconds?: number;
  status: AttemptStatus;
  readingScore?: number;
  writingScore?: number;
  listeningScore?: number;
  speakingScore?: number;
}

// Student Answer
export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: any;
  isCorrect?: boolean;
  pointsEarned: number;
  timeSpentSeconds?: number;
}

// Credit Transaction
export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: string;
  description?: string;
  balanceAfter: number;
  createdAt: string;
}

// Learning Path
export interface LearningPath {
  id: string;
  userId: string;
  targetLevel: DifficultyLevel;
  currentStep: number;
  recommendedExams: string[];
  progressPercentage: number;
  updatedAt: string;
}

// API Response
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
