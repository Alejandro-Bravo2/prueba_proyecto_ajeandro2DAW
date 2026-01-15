import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { LoadingService } from '../../../core/services/loading.service';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export type TendenciaProgreso = 'MEJORANDO' | 'ESTABLE' | 'RETROCEDIENDO' | 'PLATEAU';

export interface RegistrarEntrenamientoDTO {
  ejercicioId: number;
  fecha: string; // ISO date string
  seriesCompletadas: number;
  repeticionesCompletadas: number;
  pesoUtilizado: number;
  tiempoDescansoReal?: number;
  duracionMinutos?: number;
  nivelEsfuerzo?: 'FACIL' | 'MODERADO' | 'DIFICIL' | 'MUY_DIFICIL';
  notas?: string;
}

export interface RegistrarNutricionDTO {
  fecha: string;
  tipoComida: 'DESAYUNO' | 'ALMUERZO' | 'COMIDA' | 'MERIENDA' | 'CENA';
  caloriasConsumidas?: number;
  proteinasConsumidas?: number;
  carbohidratosConsumidos?: number;
  grasasConsumidas?: number;
  fibraConsumida?: number;
  aguaConsumidaMl?: number;
  descripcionComida?: string;
  esComidaPlaneada?: boolean;
}

export interface EjercicioProgresoDTO {
  ejercicioId: number;
  nombreEjercicio: string;
  grupoMuscular?: string;
  pesoActual: number;
  pesoAnterior: number;
  mejoraPorcentaje: number;
  volumenActual?: number;
  volumenAnterior?: number;
  tendencia: TendenciaProgreso;
  registrosSemana?: number;
}

export interface EntrenamientoResumenDTO {
  volumenTotal: number;
  pesoMaximoPromedio: number;
  mejoraFuerzaPorcentaje: number;
  entrenamientosCompletados: number;
  entrenamientosPlanificados: number;
  consistenciaPorcentaje: number;
  ejerciciosDestacados?: EjercicioProgresoDTO[];
  hayPlateau: boolean;
  mensajePlateau?: string;
}

export interface NutricionResumenDTO {
  caloriasPromedio: number;
  caloriasMeta: number;
  adherenciaCalorias: number;
  proteinasPromedio: number;
  proteinasMeta: number;
  adherenciaProteinas: number;
  carbohidratosPromedio?: number;
  carbohidratosMeta?: number;
  grasasPromedio?: number;
  grasasMeta?: number;
  aguaPromedio?: number;
  patronesDetectados: string[];
}

export interface EvaluacionProgresoDTO {
  id?: number;
  fechaEvaluacion: string;
  tipoEvaluacion: 'ENTRENAMIENTO' | 'NUTRICION' | 'INTEGRAL';
  entrenamientoResumen: EntrenamientoResumenDTO | null;
  nutricionResumen: NutricionResumenDTO | null;
  feedbackIA: string;
  recomendaciones: string[];
  logrosDestacados: string[];
  tendenciaEntrenamiento: TendenciaProgreso | null;
  tendenciaNutricion: TendenciaProgreso | null;
}

export interface WorkoutHistoryItem {
  id: number;
  fecha: string;
  ejercicioId: number;
  nombreEjercicio: string;
  grupoMuscular: string;
  seriesCompletadas: number;
  repeticionesCompletadas: number;
  pesoUtilizado: number;
  volumen: number;
  nivelEsfuerzo: string;
  notas: string;
}

export interface NutritionHistoryItem {
  id: number;
  fecha: string;
  tipoComida: string;
  caloriasConsumidas: number;
  proteinasConsumidas: number;
  carbohidratosConsumidos: number;
  grasasConsumidas: number;
  descripcionComida: string;
}

export interface DailyNutritionSummary {
  fecha: string;
  totalCalorias: number;
  totalProteinas: number;
  totalCarbohidratos: number;
  totalGrasas: number;
  registros: number;
}

// ==========================================
// SERVICE
// ==========================================

@Injectable({ providedIn: 'root' })
export class ProgressEvaluationService extends BaseHttpService {

  constructor(http: HttpClient, loadingService: LoadingService) {
    super(http, loadingService);
  }

  // ==========================================
  // WORKOUT LOGGING
  // ==========================================

  /**
   * Log a completed workout/exercise
   */
  logWorkout(dto: RegistrarEntrenamientoDTO): Observable<{ message: string; id: number; volumen: number }> {
    return this.post('progress-evaluation/training/log', dto);
  }

  /**
   * Get workout history for a date range
   */
  getWorkoutHistory(from: string, to: string): Observable<WorkoutHistoryItem[]> {
    return this.get(`progress-evaluation/training/history?from=${from}&to=${to}`);
  }

  /**
   * Get strength progress for a specific exercise
   */
  getExerciseProgress(ejercicioId: number): Observable<EjercicioProgresoDTO> {
    return this.get(`progress-evaluation/training/exercise/${ejercicioId}/progress`);
  }

  // ==========================================
  // NUTRITION LOGGING
  // ==========================================

  /**
   * Log a meal/nutrition entry
   */
  logNutrition(dto: RegistrarNutricionDTO): Observable<{ message: string; id: number }> {
    return this.post('progress-evaluation/nutrition/log', dto);
  }

  /**
   * Get nutrition history for a date range
   */
  getNutritionHistory(from: string, to: string): Observable<NutritionHistoryItem[]> {
    return this.get(`progress-evaluation/nutrition/history?from=${from}&to=${to}`);
  }

  /**
   * Get nutrition summary for a specific date
   */
  getDailyNutritionSummary(date: string): Observable<DailyNutritionSummary> {
    return this.get(`progress-evaluation/nutrition/daily-summary?date=${date}`);
  }

  // ==========================================
  // EVALUATIONS
  // ==========================================

  /**
   * Get current training progress evaluation
   */
  evaluateTraining(): Observable<EvaluacionProgresoDTO> {
    return this.get('progress-evaluation/evaluate/training');
  }

  /**
   * Get current nutrition progress evaluation
   */
  evaluateNutrition(): Observable<EvaluacionProgresoDTO> {
    return this.get('progress-evaluation/evaluate/nutrition');
  }

  /**
   * Get full progress evaluation (training + nutrition)
   */
  evaluateFull(): Observable<EvaluacionProgresoDTO> {
    return this.get('progress-evaluation/evaluate/full');
  }

  /**
   * Get evaluation history
   */
  getEvaluationHistory(limit: number = 10): Observable<EvaluacionProgresoDTO[]> {
    return this.get(`progress-evaluation/evaluate/history?limit=${limit}`);
  }
}
