import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { LoadingService } from '../../../core/services/loading.service';
import { environment } from '../../../../environments/environment';

// DTOs que coinciden con el backend
export interface RutinaAlimentacionDTO {
  id: number;
  fechaInicio: string;
  diasAlimentacion: DiaAlimentacionDTO[];
}

export interface DiaAlimentacionDTO {
  id: number;
  diaSemana: string;
  desayuno: ComidaDTO | null;
  almuerzo: ComidaDTO | null;
  comida: ComidaDTO | null;
  merienda: ComidaDTO | null;
  cena: ComidaDTO | null;
}

export interface IngredienteDTO {
  nombre: string;
  cantidad: string;
  unidad: string;
  opcional: boolean;
}

export interface ComidaDTO {
  id: number;
  alimentos: string[];
  descripcion?: string;
  tiempoPreparacionMinutos?: number;
  porciones?: number;
  dificultad?: 'FACIL' | 'MEDIA' | 'DIFICIL';
  ingredientes?: IngredienteDTO[];
  pasosPreparacion?: string[];
}

export interface AlimentoDTO {
  id: number;
  nombre: string;
  ingredientes: string[];
}

export interface CrearRutinaAlimentacionDTO {
  fechaInicio: string;
  diasAlimentacion: CrearDiaAlimentacionDTO[];
}

export interface CrearDiaAlimentacionDTO {
  diaSemana: string;
  desayuno?: CrearComidaDTO;
  almuerzo?: CrearComidaDTO;
  comida?: CrearComidaDTO;
  merienda?: CrearComidaDTO;
  cena?: CrearComidaDTO;
}

export interface CrearComidaDTO {
  alimentos: string[];
}

// Interfaces legacy para compatibilidad con componentes existentes
export interface Meal {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  // Nuevos campos para recetas
  descripcion?: string;
  tiempoPreparacionMinutos?: number;
  porciones?: number;
  dificultad?: 'FACIL' | 'MEDIA' | 'DIFICIL';
  ingredientes?: IngredienteDTO[];
  pasosPreparacion?: string[];
}

export interface FoodItem {
  icon: string;
  quantity: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  waterIntake: number;
  calorieGoal: number;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService extends BaseHttpService {
  constructor(http: HttpClient, loadingService: LoadingService) {
    super(http, loadingService);
  }

  /**
   * Listar todas las rutinas de alimentación
   */
  listarRutinas(): Observable<RutinaAlimentacionDTO[]> {
    return this.get<RutinaAlimentacionDTO[]>('rutinas-alimentacion');
  }

  /**
   * Obtener una rutina de alimentación por ID
   */
  obtenerRutina(id: number): Observable<RutinaAlimentacionDTO> {
    return this.get<RutinaAlimentacionDTO>(`rutinas-alimentacion/${id}`);
  }

  /**
   * Crear una nueva rutina de alimentación
   */
  crearRutina(dto: CrearRutinaAlimentacionDTO): Observable<RutinaAlimentacionDTO> {
    return this.post<RutinaAlimentacionDTO>('rutinas-alimentacion', dto);
  }

  /**
   * Eliminar una rutina de alimentación
   */
  eliminarRutina(id: number): Observable<void> {
    return this.delete<void>(`rutinas-alimentacion/${id}`);
  }

  /**
   * Listar todos los alimentos disponibles
   */
  listarAlimentos(): Observable<AlimentoDTO[]> {
    return this.get<AlimentoDTO[]>('alimentos');
  }

  /**
   * Obtener un alimento por ID
   */
  obtenerAlimento(id: number): Observable<AlimentoDTO> {
    return this.get<AlimentoDTO>(`alimentos/${id}`);
  }

  // ==========================================
  // MÉTODOS PARA NAVEGACIÓN POR DÍAS
  // ==========================================

  /**
   * Obtiene los días de la semana que tienen comidas programadas
   */
  getAvailableMealDays(): Observable<string[]> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        if (!rutinas || rutinas.length === 0) return [];

        // Extraer días únicos de todas las rutinas
        const daysSet = new Set<string>();
        rutinas.forEach(rutina => {
          rutina.diasAlimentacion?.forEach(dia => {
            if (dia.diaSemana) {
              daysSet.add(dia.diaSemana);
            }
          });
        });

        // Ordenar días de la semana
        const dayOrder = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
        return dayOrder.filter(day => daysSet.has(day));
      })
    );
  }

  /**
   * Obtiene las comidas de un día específico de la semana
   */
  getMealsByDay(dayOfWeek: string): Observable<DiaAlimentacionDTO | null> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        if (!rutinas || rutinas.length === 0) return null;

        // Buscar el día en las rutinas
        for (const rutina of rutinas) {
          const dia = rutina.diasAlimentacion?.find(d => d.diaSemana === dayOfWeek);
          if (dia) return dia;
        }
        return null;
      })
    );
  }

  /**
   * Helper para obtener el día actual en español
   */
  private getDayOfWeekInSpanish(date: Date): string {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return days[date.getDay()];
  }

  // ==========================================
  // MÉTODOS LEGACY CON TRANSFORMADORES
  // ==========================================

  /**
   * Obtiene las comidas de un día específico transformadas al formato legacy
   */
  getMealsByDate(userId: string, date: string): Observable<Meal[]> {
    const dayOfWeek = this.getDayOfWeekInSpanish(new Date(date));
    return this.getMealsByDay(dayOfWeek).pipe(
      map(dia => {
        if (!dia) return [];
        return this.transformDiaToMeals(dia, date);
      })
    );
  }

  /**
   * Transforma un DiaAlimentacionDTO a array de Meals
   */
  private transformDiaToMeals(dia: DiaAlimentacionDTO, date: string): Meal[] {
    const meals: Meal[] = [];
    const mealTypes: { key: keyof DiaAlimentacionDTO; type: Meal['mealType'] }[] = [
      { key: 'desayuno', type: 'breakfast' },
      { key: 'almuerzo', type: 'snack' },
      { key: 'comida', type: 'lunch' },
      { key: 'merienda', type: 'snack' },
      { key: 'cena', type: 'dinner' }
    ];

    mealTypes.forEach(({ key, type }) => {
      const comida = dia[key] as ComidaDTO | null;
      if (comida && comida.alimentos && comida.alimentos.length > 0) {
        meals.push({
          id: `${dia.id}-${key}`,
          userId: '',
          date: date,
          mealType: type,
          foods: comida.alimentos.map((alimento, idx) => ({
            icon: this.getIconForMealType(type),
            quantity: '1 porción',
            name: alimento,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          })),
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalFiber: 0,
          // Nuevos campos de receta
          descripcion: comida.descripcion,
          tiempoPreparacionMinutos: comida.tiempoPreparacionMinutos,
          porciones: comida.porciones,
          dificultad: comida.dificultad,
          ingredientes: comida.ingredientes,
          pasosPreparacion: comida.pasosPreparacion
        });
      }
    });

    return meals;
  }

  /**
   * Helper para obtener icono según tipo de comida
   */
  private getIconForMealType(type: Meal['mealType']): string {
    const icons: Record<Meal['mealType'], string> = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍎'
    };
    return icons[type] || '🍴';
  }

  /**
   * Obtiene la nutrición diaria transformada al formato legacy
   */
  getDailyNutrition(userId: string, date: string): Observable<DailyNutrition> {
    const dayOfWeek = this.getDayOfWeekInSpanish(new Date(date));
    return this.getMealsByDay(dayOfWeek).pipe(
      map(dia => {
        const meals = dia ? this.transformDiaToMeals(dia, date) : [];
        return {
          date: date,
          meals: meals,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalFiber: 0,
          waterIntake: 0,
          calorieGoal: 2000
        };
      })
    );
  }

  /**
   * Añade una nueva comida (formato legacy)
   * @deprecated Usar crearRutina() con CrearRutinaAlimentacionDTO
   */
  addMeal(meal: Omit<Meal, 'id'>): Observable<Meal> {
    // Transformar de formato legacy a backend DTO
    // Por ahora retornar el meal con un ID generado
    return of({
      ...meal,
      id: Date.now().toString()
    } as Meal);
  }

  /**
   * Actualiza una comida existente (formato legacy)
   * @deprecated Actualizar directamente la rutina con los endpoints del backend
   */
  updateMeal(mealId: string, meal: Partial<Meal>): Observable<Meal> {
    // Implementar transformación cuando se necesite
    return of({} as Meal);
  }

  /**
   * Elimina una comida (formato legacy)
   * @deprecated Usar eliminarRutina() o modificar la rutina directamente
   */
  deleteMeal(mealId: string): Observable<void> {
    // Implementar cuando se necesite
    return of(void 0);
  }

  /**
   * Obtiene todas las comidas de un usuario (formato legacy)
   * @deprecated Usar listarRutinas() directamente
   */
  getAllMeals(userId: string): Observable<Meal[]> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        // Transformar rutinas a formato legacy Meal[]
        return [];
      })
    );
  }
}
