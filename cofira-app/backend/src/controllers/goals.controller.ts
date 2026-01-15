import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { AuthRequest } from '../types/index.js';
import { openRouterService } from '../services/openrouter.service.js';
import { GoalStatus, GoalType } from '@prisma/client';

// Validation schemas
const createGoalSchema = z.object({
  type: z.enum(['WEIGHT', 'BODY_FAT', 'MUSCLE_MASS', 'DAILY_CALORIES', 'DAILY_PROTEIN', 'WEEKLY_WORKOUTS', 'STRENGTH_PR', 'ENDURANCE', 'CUSTOM']),
  name: z.string().min(1),
  description: z.string().optional(),
  targetValue: z.number(),
  startValue: z.number(),
  unit: z.string(),
  targetDate: z.string().datetime()
});

const updateProgressSchema = z.object({
  weight: z.number().optional(),
  bodyFat: z.number().optional(),
  waterIntake: z.number().optional(),
  sleepHours: z.number().optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  moodLevel: z.number().min(1).max(10).optional(),
  stepsCount: z.number().optional(),
  notes: z.string().optional()
});

export async function createGoal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createGoalSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
      return;
    }

    const data = validation.data;

    const goal = await prisma.goal.create({
      data: {
        userId: req.user.id,
        type: data.type as GoalType,
        name: data.name,
        description: data.description,
        targetValue: data.targetValue,
        startValue: data.startValue,
        currentValue: data.startValue,
        unit: data.unit,
        targetDate: new Date(data.targetDate),
        status: 'IN_PROGRESS'
      }
    });

    res.status(201).json({ goal });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
}

export async function getGoals(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, type } = req.query;

    const where: Record<string, unknown> = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { targetDate: 'asc' }
      ]
    });

    res.json({ goals });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  }
}

export async function getGoal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json({ goal });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ error: 'Failed to get goal' });
  }
}

export async function updateGoalProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { currentValue } = req.body;

    if (typeof currentValue !== 'number') {
      res.status(400).json({ error: 'currentValue is required and must be a number' });
      return;
    }

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Check if goal is achieved
    let newStatus: GoalStatus = goal.status;
    const isAchieved =
      (goal.targetValue > goal.startValue && currentValue >= goal.targetValue) ||
      (goal.targetValue < goal.startValue && currentValue <= goal.targetValue);

    if (isAchieved) {
      newStatus = 'ACHIEVED';
    }

    // Check if goal has failed (past target date and not achieved)
    if (!isAchieved && new Date() > goal.targetDate) {
      newStatus = 'FAILED';
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        currentValue,
        status: newStatus
      }
    });

    res.json({
      goal: updatedGoal,
      statusChanged: newStatus !== goal.status
    });
  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
}

export async function estimateGoalCompletion(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Get recent progress data
    const recentProgress = await prisma.dailyProgress.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: { date: 'desc' },
      take: 14 // Last 2 weeks
    });

    // Extract relevant values based on goal type
    let progressValues: number[] = [];
    if (goal.type === 'WEIGHT' && recentProgress.some(p => p.weight)) {
      progressValues = recentProgress
        .filter(p => p.weight !== null)
        .map(p => p.weight as number);
    } else if (goal.type === 'DAILY_CALORIES') {
      progressValues = recentProgress
        .filter(p => p.totalCalories !== null)
        .map(p => p.totalCalories as number);
    } else if (goal.type === 'WEEKLY_WORKOUTS') {
      progressValues = recentProgress
        .filter(p => p.workoutsCompleted !== null)
        .map(p => p.workoutsCompleted as number);
    }

    // Use AI to estimate completion
    const estimate = await openRouterService.estimateGoalCompletion(
      goal.type,
      goal.targetValue,
      goal.currentValue,
      goal.startValue,
      goal.startDate,
      goal.targetDate,
      progressValues
    );

    // Update goal with AI estimates
    await prisma.goal.update({
      where: { id },
      data: {
        estimatedCompletionDate: estimate.estimatedDate,
        weeklyRate: estimate.weeklyRate,
        lastCalculatedAt: new Date()
      }
    });

    res.json({
      goal,
      estimate
    });
  } catch (error) {
    console.error('Estimate goal completion error:', error);
    res.status(500).json({
      error: 'Failed to estimate goal completion',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function deleteGoal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await prisma.goal.delete({
      where: { id }
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
}

export async function updateDailyProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = updateProgressSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
      return;
    }

    const data = validation.data;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = await prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today
        }
      },
      update: data,
      create: {
        userId: req.user.id,
        date: today,
        ...data
      }
    });

    // Update weight goals if weight was recorded
    if (data.weight) {
      const weightGoals = await prisma.goal.findMany({
        where: {
          userId: req.user.id,
          type: 'WEIGHT',
          status: 'IN_PROGRESS'
        }
      });

      for (const goal of weightGoals) {
        const isAchieved =
          (goal.targetValue > goal.startValue && data.weight >= goal.targetValue) ||
          (goal.targetValue < goal.startValue && data.weight <= goal.targetValue);

        await prisma.goal.update({
          where: { id: goal.id },
          data: {
            currentValue: data.weight,
            status: isAchieved ? 'ACHIEVED' : goal.status
          }
        });
      }
    }

    res.json({ progress });
  } catch (error) {
    console.error('Update daily progress error:', error);
    res.status(500).json({ error: 'Failed to update daily progress' });
  }
}

export async function getProgressHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { days = '30' } = req.query;
    const daysCount = parseInt(days as string, 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);

    const progress = await prisma.dailyProgress.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate averages and trends
    const weightValues = progress.filter(p => p.weight).map(p => p.weight as number);
    const calorieValues = progress.filter(p => p.totalCalories).map(p => p.totalCalories as number);
    const workoutValues = progress.filter(p => p.workoutsCompleted).map(p => p.workoutsCompleted as number);

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const summary = {
      avgWeight: avg(weightValues),
      avgCalories: avg(calorieValues),
      totalWorkouts: workoutValues.reduce((a, b) => a + b, 0),
      daysLogged: progress.length
    };

    res.json({
      progress,
      summary
    });
  } catch (error) {
    console.error('Get progress history error:', error);
    res.status(500).json({ error: 'Failed to get progress history' });
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

    // Get counts
    const [
      activeGoals,
      achievedGoals,
      todayProgress,
      weeklyWorkouts,
      weeklyProgress
    ] = await Promise.all([
      prisma.goal.count({
        where: { userId: req.user.id, status: 'IN_PROGRESS' }
      }),
      prisma.goal.count({
        where: { userId: req.user.id, status: 'ACHIEVED' }
      }),
      prisma.dailyProgress.findUnique({
        where: {
          userId_date: { userId: req.user.id, date: today }
        }
      }),
      prisma.workout.count({
        where: {
          userId: req.user.id,
          isCompleted: true,
          completedAt: { gte: weekStart }
        }
      }),
      prisma.dailyProgress.findMany({
        where: {
          userId: req.user.id,
          date: { gte: weekStart }
        },
        orderBy: { date: 'asc' }
      })
    ]);

    // Get user onboarding for goals
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: req.user.id }
    });

    res.json({
      goals: {
        active: activeGoals,
        achieved: achievedGoals
      },
      today: {
        calories: todayProgress?.totalCalories || 0,
        protein: todayProgress?.totalProtein || 0,
        carbs: todayProgress?.totalCarbs || 0,
        fat: todayProgress?.totalFat || 0,
        weight: todayProgress?.weight,
        workouts: todayProgress?.workoutsCompleted || 0
      },
      week: {
        workoutsCompleted: weeklyWorkouts,
        workoutsTarget: onboarding?.trainingDays || 3,
        progress: weeklyProgress
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
}
