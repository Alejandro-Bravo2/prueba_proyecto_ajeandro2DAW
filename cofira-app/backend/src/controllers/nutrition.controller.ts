import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { AuthRequest } from '../types/index.js';
import { openRouterService } from '../services/openrouter.service.js';
import { imageToBase64, processAndSaveImage } from '../middleware/upload.middleware.js';
import { MealType } from '@prisma/client';

// Validation schemas
const createMealSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  calories: z.number().int().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  ingredients: z.array(z.string()).default([]),
  mealType: z.enum(['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_SNACK']),
  date: z.string().datetime().optional()
});

const getMealsQuerySchema = z.object({
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mealType: z.enum(['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_SNACK']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional()
});

export async function analyzeFood(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    // Convert image to base64 for AI analysis
    const base64Image = await imageToBase64(req.file.buffer);

    // Analyze with OpenRouter
    const analysis = await openRouterService.analyzeFood(base64Image);

    // Save image to disk
    const imageUrl = await processAndSaveImage(
      req.file.buffer,
      req.file.originalname,
      'meals'
    );

    res.json({
      analysis,
      imageUrl
    });
  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze food',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function createMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createMealSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
      return;
    }

    const data = validation.data;

    const meal = await prisma.meal.create({
      data: {
        userId: req.user.id,
        name: data.name,
        description: data.description,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        sugar: data.sugar,
        ingredients: data.ingredients,
        mealType: data.mealType as MealType,
        date: data.date ? new Date(data.date) : new Date(),
        isManual: true,
        confidence: 100
      }
    });

    res.status(201).json({ meal });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
}

export async function saveMealFromAnalysis(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { analysis, imageUrl, mealType, date } = req.body;

    if (!analysis) {
      res.status(400).json({ error: 'Analysis data is required' });
      return;
    }

    const meal = await prisma.meal.create({
      data: {
        userId: req.user.id,
        name: analysis.name,
        description: analysis.description,
        imageUrl,
        calories: Math.round(analysis.calories),
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        fiber: analysis.fiber,
        sugar: analysis.sugar,
        ingredients: analysis.ingredients || [],
        confidence: analysis.confidence,
        mealType: mealType || 'LUNCH',
        date: date ? new Date(date) : new Date(),
        isManual: false
      }
    });

    // Update daily progress
    await updateDailyProgress(req.user.id, meal.date);

    res.status(201).json({ meal });
  } catch (error) {
    console.error('Save meal from analysis error:', error);
    res.status(500).json({ error: 'Failed to save meal' });
  }
}

export async function getMeals(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const query = getMealsQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: query.error.errors
      });
      return;
    }

    const { date, startDate, endDate, mealType, limit = 50, offset = 0 } = query.data;

    const where: Record<string, unknown> = {
      userId: req.user.id
    };

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = {
        gte: targetDate,
        lt: nextDay
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (mealType) {
      where.mealType = mealType;
    }

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.meal.count({ where })
    ]);

    res.json({
      meals,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + meals.length < total
      }
    });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to get meals' });
  }
}

export async function getMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const meal = await prisma.meal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!meal) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    res.json({ meal });
  } catch (error) {
    console.error('Get meal error:', error);
    res.status(500).json({ error: 'Failed to get meal' });
  }
}

export async function deleteMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const meal = await prisma.meal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!meal) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    await prisma.meal.delete({
      where: { id }
    });

    // Update daily progress
    await updateDailyProgress(req.user.id, meal.date);

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
}

export async function getDailyNutrition(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const dateParam = req.query.date as string;
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const meals = await prisma.meal.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate totals
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
        fiber: acc.fiber + (meal.fiber || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    // Get user goals for comparison
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: req.user.id }
    });

    // Calculate recommended values based on onboarding data
    let goals = {
      calories: 2000,
      protein: 120,
      carbs: 250,
      fat: 65,
      fiber: 25
    };

    if (onboarding) {
      // Adjust based on goals
      if (onboarding.primaryGoal === 'LOSE_WEIGHT') {
        goals.calories = 1800;
        goals.protein = 140;
      } else if (onboarding.primaryGoal === 'GAIN_MUSCLE') {
        goals.calories = 2500;
        goals.protein = 160;
      }
    }

    res.json({
      date: targetDate.toISOString().split('T')[0],
      meals,
      totals,
      goals,
      mealCount: meals.length
    });
  } catch (error) {
    console.error('Get daily nutrition error:', error);
    res.status(500).json({ error: 'Failed to get daily nutrition' });
  }
}

async function updateDailyProgress(userId: string, date: Date): Promise<void> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all meals for the day
  const meals = await prisma.meal.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // Calculate totals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Upsert daily progress
  await prisma.dailyProgress.upsert({
    where: {
      userId_date: {
        userId,
        date: startOfDay
      }
    },
    update: {
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat
    },
    create: {
      userId,
      date: startOfDay,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat
    }
  });
}
