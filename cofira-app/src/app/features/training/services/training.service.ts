import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { LoadingService } from '../../../core/services/loading.service';
import { environment } from '../../../../environments/environment';

// New AI-generated workout interfaces
export interface GeneratedExercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  muscleGroup?: string;
  equipmentNeeded?: string;
  order: number;
  isCompleted: boolean;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  description?: string;
  duration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
  muscleGroups: string[];
  workoutType: 'STRENGTH' | 'CARDIO' | 'HIIT' | 'FLEXIBILITY' | 'MIXED' | 'CUSTOM';
  exercises: GeneratedExercise[];
  scheduledFor?: string;
  completedAt?: string;
  isCompleted: boolean;
  isAiGenerated: boolean;
}

export interface WeeklySchedule {
  weekStart: string;
  weekEnd: string;
  schedule: Record<string, GeneratedWorkout[]>;
  totalWorkouts: number;
  completedWorkouts: number;
}

export interface GenerateWorkoutsRequest {
  muscleGroupFocus?: string[];
  weekStartDate?: string;
}

// Legacy DTOs for backwards compatibility
export interface RutinaEjercicioDTO {
  id: number;
  fechaInicio: string;
  diasEjercicio: DiaEjercicioDTO[];
}

export interface DiaEjercicioDTO {
  id: number;
  diaSemana: string;
  ejercicios: EjerciciosDTO[];
}

export interface EjerciciosDTO {
  id: number;
  nombreEjercicio: string;
  series: number;
  repeticiones: number;
  tiempoDescansoSegundos: number;
  descripcion: string;
  grupoMuscular: string;
}

export interface CrearRutinaEjercicioDTO {
  fechaInicio: string;
  diasEjercicio: CrearDiaEjercicioDTO[];
}

export interface CrearDiaEjercicioDTO {
  diaSemana: string;
  ejercicios: number[];
}

export interface Exercise {
  id: string;
  userId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  description?: string;
  muscleGroup?: string;
  completed: boolean;
  date: string;
  notes?: string;
}

export interface WorkoutFeedback {
  id: string;
  userId: string;
  date: string;
  difficulty: number;
  energy: number;
  comments?: string;
}

export interface WorkoutProgress {
  userId: string;
  totalWorkouts: number;
  completedExercises: number;
  streak: number;
  lastWorkout?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TrainingService extends BaseHttpService {
  private readonly aiApiUrl = `${environment.apiUrl}/training`;

  // Reactive state for AI workouts
  weeklySchedule = signal<WeeklySchedule | null>(null);
  isGenerating = signal(false);
  currentWorkout = signal<GeneratedWorkout | null>(null);

  constructor(http: HttpClient, loadingService: LoadingService) {
    super(http, loadingService);
  }

  // ==========================================
  // AI WORKOUT GENERATION METHODS
  // ==========================================

  /**
   * Generate personalized workouts using AI based on user's onboarding preferences
   */
  generateAIWorkouts(request: GenerateWorkoutsRequest = {}): Observable<{ workouts: GeneratedWorkout[] }> {
    this.isGenerating.set(true);

    return this.http.post<{ message: string; workouts: GeneratedWorkout[] }>(
      `${this.aiApiUrl}/generate`,
      request
    ).pipe(
      tap(response => {
        this.isGenerating.set(false);
        this.loadWeeklySchedule();
      }),
      catchError(error => {
        this.isGenerating.set(false);
        throw error;
      })
    );
  }

  /**
   * Get workouts for a date range
   */
  getWorkouts(startDate?: string, endDate?: string, completed?: boolean): Observable<{ workouts: GeneratedWorkout[] }> {
    const params: Record<string, string> = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    if (completed !== undefined) params['completed'] = String(completed);

    return this.http.get<{ workouts: GeneratedWorkout[] }>(`${this.aiApiUrl}/workouts`, { params });
  }

  /**
   * Get a specific workout by ID
   */
  getWorkout(id: string): Observable<{ workout: GeneratedWorkout }> {
    return this.http.get<{ workout: GeneratedWorkout }>(`${this.aiApiUrl}/workouts/${id}`).pipe(
      tap(response => this.currentWorkout.set(response.workout))
    );
  }

  /**
   * Mark a workout as completed
   */
  completeWorkout(id: string, exercisesCompleted?: string[]): Observable<{ workout: GeneratedWorkout }> {
    return this.http.post<{ message: string; workout: GeneratedWorkout }>(
      `${this.aiApiUrl}/workouts/${id}/complete`,
      { exercisesCompleted }
    ).pipe(
      tap(() => this.loadWeeklySchedule())
    );
  }

  /**
   * Delete a workout
   */
  deleteWorkout(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.aiApiUrl}/workouts/${id}`).pipe(
      tap(() => this.loadWeeklySchedule())
    );
  }

  /**
   * Get the weekly schedule with all workouts organized by day
   */
  getWeeklySchedule(): Observable<WeeklySchedule> {
    return this.http.get<WeeklySchedule>(`${this.aiApiUrl}/schedule`).pipe(
      tap(schedule => this.weeklySchedule.set(schedule))
    );
  }

  /**
   * Load and cache weekly schedule
   */
  loadWeeklySchedule(): void {
    this.getWeeklySchedule().subscribe();
  }

  /**
   * Create a custom workout
   */
  createCustomWorkout(workout: Partial<GeneratedWorkout>): Observable<{ workout: GeneratedWorkout }> {
    return this.http.post<{ workout: GeneratedWorkout }>(`${this.aiApiUrl}/workouts`, workout);
  }

  // ==========================================
  // LEGACY METHODS (for backwards compatibility)
  // ==========================================

  listarRutinas(): Observable<RutinaEjercicioDTO[]> {
    return this.get<RutinaEjercicioDTO[]>('rutinas-ejercicio');
  }

  obtenerRutina(id: number): Observable<RutinaEjercicioDTO> {
    return this.get<RutinaEjercicioDTO>(`rutinas-ejercicio/${id}`);
  }

  crearRutina(dto: CrearRutinaEjercicioDTO): Observable<RutinaEjercicioDTO> {
    return this.post<RutinaEjercicioDTO>('rutinas-ejercicio', dto);
  }

  eliminarRutina(id: number): Observable<void> {
    return this.delete<void>(`rutinas-ejercicio/${id}`);
  }

  listarEjercicios(): Observable<EjerciciosDTO[]> {
    return this.get<EjerciciosDTO[]>('ejercicios');
  }

  obtenerEjercicio(id: number): Observable<EjerciciosDTO> {
    return this.get<EjerciciosDTO>(`ejercicios/${id}`);
  }

  getExercises(userId: string, date?: string): Observable<Exercise[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dayOfWeek = this.getDayOfWeekInSpanish(new Date(targetDate));

    return this.listarRutinas().pipe(
      map(rutinas => {
        if (!rutinas || rutinas.length === 0) {
          return [];
        }

        // Get the most recent routine (last one)
        const rutina = rutinas[rutinas.length - 1];
        if (!rutina.diasEjercicio) {
          return [];
        }

        // Find the exercises for today's day of the week
        const diaEjercicio = rutina.diasEjercicio.find(
          dia => dia.diaSemana.toUpperCase() === dayOfWeek.toUpperCase()
        );

        if (!diaEjercicio || !diaEjercicio.ejercicios) {
          return [];
        }

        // Transform backend exercises to frontend Exercise format
        return diaEjercicio.ejercicios.map(ej => ({
          id: ej.id.toString(),
          userId: userId,
          name: ej.nombreEjercicio,
          sets: ej.series,
          reps: `${ej.repeticiones}`,
          restSeconds: ej.tiempoDescansoSegundos || 60,
          description: ej.descripcion,
          muscleGroup: ej.grupoMuscular,
          completed: false,
          date: targetDate,
          notes: ej.descripcion
        }));
      })
    );
  }

  /**
   * Get day of week in Spanish for matching with backend data
   */
  private getDayOfWeekInSpanish(date: Date): string {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return days[date.getDay()];
  }

  /**
   * Get exercises for a specific day of the week
   */
  getExercisesByDay(userId: string, dayOfWeek: string): Observable<Exercise[]> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        if (!rutinas || rutinas.length === 0) {
          return [];
        }

        // Get the most recent routine (last one)
        const rutina = rutinas[rutinas.length - 1];
        if (!rutina.diasEjercicio) {
          return [];
        }

        // Find the exercises for the specified day of week
        const diaEjercicio = rutina.diasEjercicio.find(
          dia => dia.diaSemana.toUpperCase() === dayOfWeek.toUpperCase()
        );

        if (!diaEjercicio || !diaEjercicio.ejercicios) {
          return [];
        }

        const today = new Date().toISOString().split('T')[0];

        // Transform backend exercises to frontend Exercise format
        return diaEjercicio.ejercicios.map(ej => ({
          id: ej.id.toString(),
          userId: userId,
          name: ej.nombreEjercicio,
          sets: ej.series,
          reps: `${ej.repeticiones}`,
          restSeconds: ej.tiempoDescansoSegundos || 60,
          description: ej.descripcion,
          muscleGroup: ej.grupoMuscular,
          completed: false,
          date: today,
          notes: ej.descripcion
        }));
      })
    );
  }

  /**
   * Get all available training days from routines
   */
  getAvailableTrainingDays(): Observable<string[]> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        if (!rutinas || rutinas.length === 0) {
          return [];
        }

        // Get the most recent routine
        const rutina = rutinas[rutinas.length - 1];
        if (!rutina.diasEjercicio) {
          return [];
        }

        return rutina.diasEjercicio.map(dia => dia.diaSemana);
      })
    );
  }

  updateExercise(exerciseId: string, data: Partial<Exercise>): Observable<Exercise> {
    return of({} as Exercise);
  }

  addFeedback(feedback: Omit<WorkoutFeedback, 'id'>): Observable<WorkoutFeedback> {
    return of({
      ...feedback,
      id: Date.now().toString()
    } as WorkoutFeedback);
  }

  getWorkoutProgress(userId: string): Observable<WorkoutProgress> {
    return this.listarRutinas().pipe(
      map(rutinas => ({
        userId: userId,
        totalWorkouts: rutinas.length,
        completedExercises: 0,
        streak: 0,
        lastWorkout: undefined
      }))
    );
  }
}
