import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { AuthRequest, WorkoutGenerationRequest } from '../types/index.js';
import { openRouterService } from '../services/openrouter.service.js';
import { Difficulty, WorkoutType } from '@prisma/client';

// Validation schemas
const generateWorkoutsSchema = z.object({
  muscleGroupFocus: z.array(z.string()).optional(),
  weekStartDate: z.string().datetime().optional()
});

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().int().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXTREME']),
  muscleGroups: z.array(z.string()),
  workoutType: z.enum(['STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY', 'MIXED', 'CUSTOM']),
  scheduledFor: z.string().datetime().optional(),
  exercises: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    sets: z.number().int().min(1),
    reps: z.string(),
    restSeconds: z.number().int().min(0),
    muscleGroup: z.string().optional(),
    equipmentNeeded: z.string().optional(),
    order: z.number().int()
  }))
});

export async function generateWorkouts(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get user onboarding data
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: req.user.id }
    });

    if (!onboarding) {
      res.status(400).json({
        error: 'Please complete onboarding first',
        code: 'ONBOARDING_REQUIRED'
      });
      return;
    }

    const validation = generateWorkoutsSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
      return;
    }

    const { muscleGroupFocus, weekStartDate } = validation.data;

    // Build request for AI
    const generationRequest: WorkoutGenerationRequest = {
      primaryGoal: onboarding.primaryGoal,
      fitnessLevel: onboarding.fitnessLevel,
      trainingDays: onboarding.trainingDays,
      sessionDuration: onboarding.sessionDuration,
      equipment: onboarding.equipment,
      injuries: onboarding.injuries,
      muscleGroupFocus
    };

    // Generate workouts with AI
    const generatedWorkouts = await openRouterService.generateWorkoutPlan(generationRequest);

    // Calculate scheduled dates
    const startDate = weekStartDate ? new Date(weekStartDate) : new Date();
    startDate.setHours(0, 0, 0, 0);

    // Save workouts to database
    const savedWorkouts = [];

    for (let i = 0; i < generatedWorkouts.length; i++) {
      const workout = generatedWorkouts[i];
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + i);

      // Set time based on user preference
      if (onboarding.preferredTime === 'MORNING') {
        scheduledDate.setHours(7, 0, 0, 0);
      } else if (onboarding.preferredTime === 'AFTERNOON') {
        scheduledDate.setHours(14, 0, 0, 0);
      } else if (onboarding.preferredTime === 'EVENING') {
        scheduledDate.setHours(19, 0, 0, 0);
      }

      const savedWorkout = await prisma.workout.create({
        data: {
          userId: req.user.id,
          name: workout.name,
          description: workout.description,
          duration: workout.duration,
          difficulty: workout.difficulty as Difficulty,
          muscleGroups: workout.muscleGroups,
          workoutType: workout.workoutType as WorkoutType,
          scheduledFor: scheduledDate,
          isAiGenerated: true,
          aiPromptUsed: JSON.stringify(generationRequest),
          exercises: {
            create: workout.exercises.map((exercise, index) => ({
              name: exercise.name,
              description: exercise.description,
              sets: exercise.sets,
              reps: exercise.reps,
              restSeconds: exercise.restSeconds,
              muscleGroup: exercise.muscleGroup,
              equipmentNeeded: exercise.equipmentNeeded,
              order: index + 1
            }))
          }
        },
        include: {
          exercises: {
            orderBy: { order: 'asc' }
          }
        }
      });

      savedWorkouts.push(savedWorkout);
    }

    res.status(201).json({
      message: `Generated ${savedWorkouts.length} workouts for the week`,
      workouts: savedWorkouts
    });
  } catch (error) {
    console.error('Generate workouts error:', error);
    res.status(500).json({
      error: 'Failed to generate workouts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function createWorkout(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createWorkoutSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
      return;
    }

    const data = validation.data;

    const workout = await prisma.workout.create({
      data: {
        userId: req.user.id,
        name: data.name,
        description: data.description,
        duration: data.duration,
        difficulty: data.difficulty as Difficulty,
        muscleGroups: data.muscleGroups,
        workoutType: data.workoutType as WorkoutType,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        isAiGenerated: false,
        exercises: {
          create: data.exercises.map((exercise) => ({
            name: exercise.name,
            description: exercise.description,
            sets: exercise.sets,
            reps: exercise.reps,
            restSeconds: exercise.restSeconds,
            muscleGroup: exercise.muscleGroup,
            equipmentNeeded: exercise.equipmentNeeded,
            order: exercise.order
          }))
        }
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({ workout });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
}

export async function getWorkouts(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate, completed } = req.query;

    const where: Record<string, unknown> = {
      userId: req.user.id
    };

    if (startDate && endDate) {
      where.scheduledFor = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (completed !== undefined) {
      where.isCompleted = completed === 'true';
    }

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { scheduledFor: 'asc' }
    });

    res.json({ workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
}

export async function getWorkout(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const workout = await prisma.workout.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json({ workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Failed to get workout' });
  }
}

export async function completeWorkout(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { exercisesCompleted } = req.body;

    const workout = await prisma.workout.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    // Update workout completion
    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date()
      },
      include: {
        exercises: true
      }
    });

    // Update exercises if provided
    if (exercisesCompleted && Array.isArray(exercisesCompleted)) {
      for (const exerciseId of exercisesCompleted) {
        await prisma.exercise.update({
          where: { id: exerciseId },
          data: { isCompleted: true }
        });
      }
    }

    // Update daily progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today
        }
      },
      update: {
        workoutsCompleted: { increment: 1 },
        activeMinutes: { increment: workout.duration }
      },
      create: {
        userId: req.user.id,
        date: today,
        workoutsCompleted: 1,
        activeMinutes: workout.duration
      }
    });

    res.json({
      message: 'Workout completed successfully',
      workout: updatedWorkout
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ error: 'Failed to complete workout' });
  }
}

export async function deleteWorkout(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const workout = await prisma.workout.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    await prisma.workout.delete({
      where: { id }
    });

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
}

export async function getWeeklySchedule(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const workouts = await prisma.workout.findMany({
      where: {
        userId: req.user.id,
        scheduledFor: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { scheduledFor: 'asc' }
    });

    // Group by day
    const schedule: Record<string, typeof workouts> = {};
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      const dayKey = days[i];
      schedule[dayKey] = workouts.filter(w => {
        if (!w.scheduledFor) return false;
        const workoutDay = new Date(w.scheduledFor);
        return workoutDay.toDateString() === day.toDateString();
      });
    }

    res.json({
      weekStart: startOfWeek.toISOString(),
      weekEnd: endOfWeek.toISOString(),
      schedule,
      totalWorkouts: workouts.length,
      completedWorkouts: workouts.filter(w => w.isCompleted).length
    });
  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json({ error: 'Failed to get weekly schedule' });
  }
}
