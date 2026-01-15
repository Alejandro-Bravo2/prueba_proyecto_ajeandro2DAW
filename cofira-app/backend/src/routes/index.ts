import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadImage } from '../middleware/upload.middleware.js';

// Controllers
import * as authController from '../controllers/auth.controller.js';
import * as nutritionController from '../controllers/nutrition.controller.js';
import * as trainingController from '../controllers/training.controller.js';
import * as goalsController from '../controllers/goals.controller.js';

export const router = Router();

// ========================================
// AUTH ROUTES
// ========================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.post('/auth/onboarding', authMiddleware, authController.completeOnboarding);
router.post('/auth/refresh', authMiddleware, authController.refreshToken);

// ========================================
// NUTRITION ROUTES
// ========================================
router.post(
  '/nutrition/analyze',
  authMiddleware,
  uploadImage.single('image'),
  nutritionController.analyzeFood
);
router.post('/nutrition/meals', authMiddleware, nutritionController.createMeal);
router.post('/nutrition/meals/from-analysis', authMiddleware, nutritionController.saveMealFromAnalysis);
router.get('/nutrition/meals', authMiddleware, nutritionController.getMeals);
router.get('/nutrition/meals/:id', authMiddleware, nutritionController.getMeal);
router.delete('/nutrition/meals/:id', authMiddleware, nutritionController.deleteMeal);
router.get('/nutrition/daily', authMiddleware, nutritionController.getDailyNutrition);

// ========================================
// TRAINING ROUTES
// ========================================
router.post('/training/generate', authMiddleware, trainingController.generateWorkouts);
router.post('/training/workouts', authMiddleware, trainingController.createWorkout);
router.get('/training/workouts', authMiddleware, trainingController.getWorkouts);
router.get('/training/workouts/:id', authMiddleware, trainingController.getWorkout);
router.post('/training/workouts/:id/complete', authMiddleware, trainingController.completeWorkout);
router.delete('/training/workouts/:id', authMiddleware, trainingController.deleteWorkout);
router.get('/training/schedule', authMiddleware, trainingController.getWeeklySchedule);

// ========================================
// GOALS & PROGRESS ROUTES
// ========================================
router.post('/goals', authMiddleware, goalsController.createGoal);
router.get('/goals', authMiddleware, goalsController.getGoals);
router.get('/goals/:id', authMiddleware, goalsController.getGoal);
router.patch('/goals/:id/progress', authMiddleware, goalsController.updateGoalProgress);
router.get('/goals/:id/estimate', authMiddleware, goalsController.estimateGoalCompletion);
router.delete('/goals/:id', authMiddleware, goalsController.deleteGoal);

// Progress tracking
router.post('/progress', authMiddleware, goalsController.updateDailyProgress);
router.get('/progress/history', authMiddleware, goalsController.getProgressHistory);
router.get('/dashboard/stats', authMiddleware, goalsController.getDashboardStats);
