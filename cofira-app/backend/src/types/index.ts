import { Request } from 'express';
import { User } from '@prisma/client';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Nutrition Analysis from AI
export interface NutritionAnalysis {
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  ingredients: string[];
  confidence: number;
  suggestions?: string[];
}

// Workout Generation
export interface WorkoutGenerationRequest {
  primaryGoal: string;
  fitnessLevel: string;
  trainingDays: number;
  sessionDuration: number;
  equipment: string[];
  injuries: string[];
  muscleGroupFocus?: string[];
}

export interface GeneratedExercise {
  name: string;
  description?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  muscleGroup: string;
  equipmentNeeded?: string;
  order: number;
}

export interface GeneratedWorkout {
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  muscleGroups: string[];
  workoutType: string;
  exercises: GeneratedExercise[];
}

// Goal Estimation
export interface GoalEstimate {
  estimatedDate: Date;
  weeklyRate: number;
  daysRemaining: number;
  status: 'ON_TRACK' | 'AHEAD' | 'BEHIND' | 'AT_RISK';
  progressPercentage: number;
  recommendations: string[];
}

// Onboarding Steps
export interface OnboardingStep {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'slider' | 'input';
  options?: OnboardingOption[];
  min?: number;
  max?: number;
  unit?: string;
  required: boolean;
  condition?: (data: Record<string, unknown>) => boolean;
}

export interface OnboardingOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: string;
}

// OpenRouter types
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OpenRouterContent[];
}

export interface OpenRouterContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// JWT Payload
export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
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
    hasNext: boolean;
    hasPrev: boolean;
  };
}
