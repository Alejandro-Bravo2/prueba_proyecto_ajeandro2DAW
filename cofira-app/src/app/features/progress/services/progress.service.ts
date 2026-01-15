import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseHttpService } from '../../../core/services/base-http.service';

// DTOs que coinciden con el backend
export interface ObjetivosDTO {
  id: number;
  listaObjetivos: string[];
  usuarioId: number;
}

export interface CrearObjetivosDTO {
  listaObjetivos: string[];
  usuarioId: number;
}

export interface ModificarObjetivosDTO {
  listaObjetivos: string[];
}

// Interfaces legacy para compatibilidad
export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
  notes?: string;
}

export interface NutrientData {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  calories: number;
  calorieGoal: number;
}

export interface StrengthProgress {
  exerciseName: string;
  data: {
    date: string;
    maxWeight: number;
    totalVolume: number;
  }[];
}

export interface NutritionTargetsResponse {
  dailyCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService extends BaseHttpService {
  /**
   * Listar todos los objetivos
   */
  listarObjetivos(): Observable<ObjetivosDTO[]> {
    return this.get<ObjetivosDTO[]>('objetivos');
  }

  /**
   * Obtener objetivos por ID
   */
  obtenerObjetivos(id: number): Observable<ObjetivosDTO> {
    return this.get<ObjetivosDTO>(`objetivos/${id}`);
  }

  /**
   * Obtener objetivos por usuario
   */
  obtenerObjetivosPorUsuario(usuarioId: number): Observable<ObjetivosDTO> {
    return this.get<ObjetivosDTO>(`objetivos/usuario/${usuarioId}`);
  }

  /**
   * Crear nuevos objetivos
   */
  crearObjetivos(dto: CrearObjetivosDTO): Observable<ObjetivosDTO> {
    return this.post<ObjetivosDTO>('objetivos', dto);
  }

  /**
   * Actualizar objetivos
   */
  actualizarObjetivos(id: number, dto: ModificarObjetivosDTO): Observable<ObjetivosDTO> {
    return this.put<ObjetivosDTO>(`objetivos/${id}`, dto);
  }

  /**
   * Eliminar objetivos
   */
  eliminarObjetivos(id: number): Observable<void> {
    return this.delete<void>(`objetivos/${id}`);
  }

  // ==========================================
  // MÉTODOS LEGACY CON TRANSFORMADORES
  // ==========================================

  /**
   * Obtiene entradas de progreso (formato legacy)
   * @deprecated Implementar endpoint específico en backend si se necesita
   */
  getProgressEntries(_userId: string): Observable<ProgressEntry[]> {
    // Por ahora retornar array vacío
    return of([]);
  }

  /**
   * Obtiene progreso por ejercicio (formato legacy)
   * @deprecated Implementar endpoint específico en backend
   */
  getProgressByExercise(_userId: string, _exerciseName: string): Observable<ProgressEntry[]> {
    return of([]);
  }

  /**
   * Añade entrada de progreso (formato legacy)
   * @deprecated Implementar endpoint específico en backend
   */
  addProgressEntry(entry: Omit<ProgressEntry, 'id'>): Observable<ProgressEntry> {
    return of({
      ...entry,
      id: Date.now().toString()
    } as ProgressEntry);
  }

  /**
   * Actualiza entrada de progreso (formato legacy)
   * @deprecated Implementar endpoint específico en backend
   */
  updateProgressEntry(_entryId: string, _entry: Partial<ProgressEntry>): Observable<ProgressEntry> {
    return of({} as ProgressEntry);
  }

  /**
   * Elimina entrada de progreso (formato legacy)
   * @deprecated Implementar endpoint específico en backend
   */
  deleteProgressEntry(_entryId: string): Observable<void> {
    return of(void 0);
  }

  /**
   * Obtiene datos de nutrientes por fecha
   * Intenta cargar los targets del perfil del usuario como objetivos
   */
  getNutrientDataByDate(userId: string, date: string): Observable<NutrientData> {
    // Intenta obtener los targets del perfil del usuario
    return this.get<NutritionTargetsResponse>(`onboarding/nutrition-targets`).pipe(
      map(targets => ({
        date: date,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        water: 0,
        calories: 0,
        calorieGoal: targets?.dailyCalories ? Math.round(targets.dailyCalories) : 2000
      })),
      catchError(() => of({
        date: date,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        water: 0,
        calories: 0,
        calorieGoal: 2000
      }))
    );
  }

  /**
   * Obtiene progreso de fuerza (formato legacy)
   * @deprecated Implementar endpoint específico en backend
   */
  getStrengthProgress(userId: string, exerciseName: string): Observable<StrengthProgress> {
    return of({
      exerciseName: exerciseName,
      data: []
    });
  }

  /**
   * Obtiene ejercicios del usuario (formato legacy)
   * @deprecated Usar TrainingService.listarRutinas() y extraer ejercicios
   */
  getUserExercises(_userId: string): Observable<string[]> {
    return of([]);
  }
}
