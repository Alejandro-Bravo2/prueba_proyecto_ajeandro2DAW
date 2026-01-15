import { Injectable, inject, signal, computed } from '@angular/core';
import {
  ProgressEvaluationService,
  EvaluacionProgresoDTO,
  TendenciaProgreso,
  RegistrarEntrenamientoDTO,
  RegistrarNutricionDTO,
  WorkoutHistoryItem,
  NutritionHistoryItem
} from '../services/progress-evaluation.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Store for managing progress evaluation state.
 * Handles training and nutrition evaluations with AI-powered feedback.
 */
@Injectable({ providedIn: 'root' })
export class ProgressEvaluationStore {
  private readonly evaluationService = inject(ProgressEvaluationService);
  private readonly toastService = inject(ToastService);

  // ==========================================
  // PRIVATE STATE
  // ==========================================

  private readonly _currentEvaluation = signal<EvaluacionProgresoDTO | null>(null);
  private readonly _evaluationHistory = signal<EvaluacionProgresoDTO[]>([]);
  private readonly _workoutHistory = signal<WorkoutHistoryItem[]>([]);
  private readonly _nutritionHistory = signal<NutritionHistoryItem[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastEvaluationType = signal<'training' | 'nutrition' | 'full'>('full');

  // ==========================================
  // PUBLIC STATE (readonly)
  // ==========================================

  readonly currentEvaluation = this._currentEvaluation.asReadonly();
  readonly evaluationHistory = this._evaluationHistory.asReadonly();
  readonly workoutHistory = this._workoutHistory.asReadonly();
  readonly nutritionHistory = this._nutritionHistory.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  /** Training trend indicator */
  readonly trainingTrend = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.tendenciaEntrenamiento ?? null;
  });

  /** Nutrition trend indicator */
  readonly nutritionTrend = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.tendenciaNutricion ?? null;
  });

  /** AI feedback text */
  readonly aiFeedback = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.feedbackIA ?? '';
  });

  /** Recommendations list */
  readonly recommendations = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.recomendaciones ?? [];
  });

  /** Achievements list */
  readonly achievements = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.logrosDestacados ?? [];
  });

  /** Training consistency percentage */
  readonly trainingConsistency = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.entrenamientoResumen?.consistenciaPorcentaje ?? 0;
  });

  /** Calorie adherence percentage */
  readonly calorieAdherence = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.nutricionResumen?.adherenciaCalorias ?? 0;
  });

  /** Protein adherence percentage */
  readonly proteinAdherence = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.nutricionResumen?.adherenciaProteinas ?? 0;
  });

  /** Is plateau detected */
  readonly hasPlateau = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.entrenamientoResumen?.hayPlateau ?? false;
  });

  /** Plateau message */
  readonly plateauMessage = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.entrenamientoResumen?.mensajePlateau ?? '';
  });

  /** Training volume */
  readonly trainingVolume = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.entrenamientoResumen?.volumenTotal ?? 0;
  });

  /** Strength improvement percentage */
  readonly strengthImprovement = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.entrenamientoResumen?.mejoraFuerzaPorcentaje ?? 0;
  });

  /** Average calories consumed */
  readonly averageCalories = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.nutricionResumen?.caloriasPromedio ?? 0;
  });

  /** Target calories */
  readonly targetCalories = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.nutricionResumen?.caloriasMeta ?? 0;
  });

  /** Detected nutrition patterns */
  readonly nutritionPatterns = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_?.nutricionResumen?.patronesDetectados ?? [];
  });

  /** Has data to display */
  readonly hasData = computed(() => {
    const eval_ = this._currentEvaluation();
    return eval_ !== null;
  });

  /** Get trend icon for training */
  readonly trainingTrendIcon = computed(() => this.getTrendIcon(this.trainingTrend()));

  /** Get trend icon for nutrition */
  readonly nutritionTrendIcon = computed(() => this.getTrendIcon(this.nutritionTrend()));

  /** Get trend CSS class for training */
  readonly trainingTrendClass = computed(() => this.getTrendClass(this.trainingTrend()));

  /** Get trend CSS class for nutrition */
  readonly nutritionTrendClass = computed(() => this.getTrendClass(this.nutritionTrend()));

  // ==========================================
  // METHODS - LOGGING
  // ==========================================

  /**
   * Log a completed workout and trigger evaluation
   */
  logWorkout(dto: RegistrarEntrenamientoDTO): void {
    this._loading.set(true);
    this._error.set(null);

    this.evaluationService.logWorkout(dto).pipe(
      tap(result => {
        this.toastService.success('Entrenamiento registrado');
        // Auto-refresh evaluation after logging
        this.loadTrainingEvaluation();
      }),
      catchError(err => {
        this._error.set('Error al registrar entrenamiento');
        this.toastService.error('Error al registrar el entrenamiento');
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  /**
   * Log a meal/nutrition entry and trigger evaluation
   */
  logNutrition(dto: RegistrarNutricionDTO): void {
    this._loading.set(true);
    this._error.set(null);

    this.evaluationService.logNutrition(dto).pipe(
      tap(result => {
        this.toastService.success('Comida registrada');
        // Auto-refresh evaluation after logging
        this.loadNutritionEvaluation();
      }),
      catchError(err => {
        this._error.set('Error al registrar nutricion');
        this.toastService.error('Error al registrar la comida');
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  // ==========================================
  // METHODS - EVALUATIONS
  // ==========================================

  /**
   * Load training evaluation
   */
  loadTrainingEvaluation(): void {
    this._loading.set(true);
    this._error.set(null);
    this._lastEvaluationType.set('training');

    this.evaluationService.evaluateTraining().pipe(
      catchError(err => {
        this._error.set('Error al cargar evaluacion de entrenamiento');
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe(evaluation => {
      if (evaluation) {
        this._currentEvaluation.set(evaluation);
      }
    });
  }

  /**
   * Load nutrition evaluation
   */
  loadNutritionEvaluation(): void {
    this._loading.set(true);
    this._error.set(null);
    this._lastEvaluationType.set('nutrition');

    this.evaluationService.evaluateNutrition().pipe(
      catchError(err => {
        this._error.set('Error al cargar evaluacion de nutricion');
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe(evaluation => {
      if (evaluation) {
        this._currentEvaluation.set(evaluation);
      }
    });
  }

  /**
   * Load full evaluation (training + nutrition)
   */
  loadFullEvaluation(): void {
    this._loading.set(true);
    this._error.set(null);
    this._lastEvaluationType.set('full');

    this.evaluationService.evaluateFull().pipe(
      catchError(err => {
        this._error.set('Error al cargar evaluacion completa');
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe(evaluation => {
      if (evaluation) {
        this._currentEvaluation.set(evaluation);
      }
    });
  }

  /**
   * Load evaluation history
   */
  loadHistory(limit: number = 10): void {
    this.evaluationService.getEvaluationHistory(limit).pipe(
      catchError(() => of([]))
    ).subscribe(history => {
      this._evaluationHistory.set(history);
    });
  }

  /**
   * Load workout history for date range
   */
  loadWorkoutHistory(from: string, to: string): void {
    this.evaluationService.getWorkoutHistory(from, to).pipe(
      catchError(() => of([]))
    ).subscribe(history => {
      this._workoutHistory.set(history);
    });
  }

  /**
   * Load nutrition history for date range
   */
  loadNutritionHistory(from: string, to: string): void {
    this.evaluationService.getNutritionHistory(from, to).pipe(
      catchError(() => of([]))
    ).subscribe(history => {
      this._nutritionHistory.set(history);
    });
  }

  /**
   * Refresh current evaluation based on last type
   */
  refresh(): void {
    switch (this._lastEvaluationType()) {
      case 'training':
        this.loadTrainingEvaluation();
        break;
      case 'nutrition':
        this.loadNutritionEvaluation();
        break;
      default:
        this.loadFullEvaluation();
    }
  }

  /**
   * Clear all state
   */
  clear(): void {
    this._currentEvaluation.set(null);
    this._evaluationHistory.set([]);
    this._workoutHistory.set([]);
    this._nutritionHistory.set([]);
    this._loading.set(false);
    this._error.set(null);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private getTrendIcon(trend: TendenciaProgreso | null): string {
    switch (trend) {
      case 'MEJORANDO': return '↗';
      case 'ESTABLE': return '→';
      case 'RETROCEDIENDO': return '↘';
      case 'PLATEAU': return '⏸';
      default: return '?';
    }
  }

  private getTrendClass(trend: TendenciaProgreso | null): string {
    switch (trend) {
      case 'MEJORANDO': return 'trend-improving';
      case 'ESTABLE': return 'trend-stable';
      case 'RETROCEDIENDO': return 'trend-declining';
      case 'PLATEAU': return 'trend-plateau';
      default: return 'trend-unknown';
    }
  }

  /**
   * Get human-readable trend text
   */
  getTrendText(trend: TendenciaProgreso | null): string {
    switch (trend) {
      case 'MEJORANDO': return 'Mejorando';
      case 'ESTABLE': return 'Estable';
      case 'RETROCEDIENDO': return 'Retrocediendo';
      case 'PLATEAU': return 'Plateau';
      default: return 'Sin datos';
    }
  }

  /**
   * Get human-readable pattern text
   */
  getPatternText(pattern: string): string {
    switch (pattern) {
      case 'BAJO_CONSUMO_FRECUENTE': return 'Consumo bajo frecuente';
      case 'SOBRE_CONSUMO_FRECUENTE': return 'Consumo alto frecuente';
      case 'PROTEINAS_INSUFICIENTES': return 'Proteinas insuficientes';
      case 'HIDRATACION_BAJA': return 'Hidratacion baja';
      case 'SIN_DATOS_SUFICIENTES': return 'Datos insuficientes';
      default: return pattern;
    }
  }
}
