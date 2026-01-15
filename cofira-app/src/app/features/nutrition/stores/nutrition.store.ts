import { Injectable, inject, signal, computed } from '@angular/core';
import { NutritionService, Meal, DailyNutrition } from '../services/nutrition.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Store de dominio para gestionar el estado de nutricion
 *
 * Implementa el patron de gestion de estado con Signals de Angular,
 * manteniendo el estado en memoria y notificando cambios reactivamente.
 *
 * @example
 * ```typescript
 * // En un componente
 * store = inject(NutritionStore);
 *
 * // Leer estado
 * meals = this.store.meals;
 * loading = this.store.loading;
 *
 * // Usar computed
 * calories = this.store.totalCalories();
 *
 * // Modificar estado
 * this.store.add(newMeal);
 * this.store.remove('meal-id');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NutritionStore {
  private readonly nutritionService = inject(NutritionService);
  private readonly toastService = inject(ToastService);

  // ==========================================
  // ESTADO PRIVADO (solo modificable internamente)
  // ==========================================

  private readonly _meals = signal<Meal[]>([]);
  private readonly _dailyNutrition = signal<DailyNutrition | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal('');
  private readonly _currentPage = signal(1);
  private readonly _currentDate = signal(new Date().toISOString().split('T')[0]);

  // Estado para navegación por días de la semana (como entrenamiento)
  private readonly _selectedDay = signal<string>(this.getCurrentDayInSpanish());
  private readonly _availableDays = signal<string[]>([]);
  private readonly _hasMealPlan = signal(false);

  // Estado para infinite scroll
  private readonly _viewMode = signal<'pagination' | 'infinite'>('pagination');
  private readonly _infinitePage = signal(1);
  private readonly _hasMore = signal(true);
  private readonly _isLoadingMore = signal(false);
  private readonly _infiniteItems = signal<Meal[]>([]);

  // ==========================================
  // ESTADO PUBLICO (readonly para componentes)
  // ==========================================

  /** Lista de comidas cargadas */
  readonly meals = this._meals.asReadonly();

  /** Nutricion diaria completa */
  readonly dailyNutrition = this._dailyNutrition.asReadonly();

  /** Estado de carga */
  readonly loading = this._loading.asReadonly();

  /** Mensaje de error si existe */
  readonly error = this._error.asReadonly();

  /** Termino de busqueda actual */
  readonly searchTerm = this._searchTerm.asReadonly();

  /** Pagina actual */
  readonly currentPage = this._currentPage.asReadonly();

  /** Fecha actual seleccionada */
  readonly currentDate = this._currentDate.asReadonly();

  /** Elementos por pagina */
  readonly pageSize = 5;

  /** Día seleccionado actualmente */
  readonly selectedDay = this._selectedDay.asReadonly();

  /** Días disponibles con comidas */
  readonly availableDays = this._availableDays.asReadonly();

  /** Indica si hay plan de comidas cargado */
  readonly hasMealPlan = this._hasMealPlan.asReadonly();

  // Estado publico para infinite scroll
  /** Modo de visualizacion actual (paginacion o infinite scroll) */
  readonly viewMode = this._viewMode.asReadonly();

  /** Indica si hay mas elementos para cargar */
  readonly hasMore = this._hasMore.asReadonly();

  /** Estado de carga de mas elementos */
  readonly isLoadingMore = this._isLoadingMore.asReadonly();

  // ==========================================
  // COMPUTED (valores derivados)
  // ==========================================

  /** Total de comidas */
  readonly mealCount = computed(() => this._meals().length);

  /** Total de calorias del dia */
  readonly totalCalories = computed(() =>
    this._meals().reduce((sum, m) => sum + m.totalCalories, 0)
  );

  /** Total de proteinas del dia */
  readonly totalProtein = computed(() =>
    this._meals().reduce((sum, m) => sum + m.totalProtein, 0)
  );

  /** Total de carbohidratos del dia */
  readonly totalCarbs = computed(() =>
    this._meals().reduce((sum, m) => sum + m.totalCarbs, 0)
  );

  /** Total de grasas del dia */
  readonly totalFat = computed(() =>
    this._meals().reduce((sum, m) => sum + m.totalFat, 0)
  );

  /** Comidas filtradas por busqueda */
  readonly filteredMeals = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const meals = this._meals();

    if (!term) return meals;

    return meals.filter(m =>
      m.mealType.toLowerCase().includes(term) ||
      m.foods.some(f => f.name.toLowerCase().includes(term))
    );
  });

  /** Total de paginas */
  readonly totalPages = computed(() =>
    Math.ceil(this.filteredMeals().length / this.pageSize)
  );

  /** Comidas paginadas (para mostrar en la UI) */
  readonly paginatedMeals = computed(() => {
    const filtered = this.filteredMeals();
    const start = (this._currentPage() - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });

  /** Indica si hay resultados de busqueda */
  readonly hasResults = computed(() => this.filteredMeals().length > 0);

  /** Indica si la lista esta vacia */
  readonly isEmpty = computed(() =>
    this._meals().length === 0 && !this._loading() && !this._error()
  );

  /** Indica si hay comidas hoy */
  readonly hasMealsToday = computed(() => this._meals().length > 0);

  /** Puede navegar al día anterior */
  readonly canGoPreviousDay = computed(() => {
    const days = this._availableDays();
    const current = this._selectedDay();
    return days.indexOf(current) > 0;
  });

  /** Puede navegar al día siguiente */
  readonly canGoNextDay = computed(() => {
    const days = this._availableDays();
    const current = this._selectedDay();
    return days.indexOf(current) < days.length - 1;
  });

  /** Nombre del día formateado */
  readonly formattedDayName = computed(() => {
    const dayMap: Record<string, string> = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIERCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return dayMap[this._selectedDay()] || this._selectedDay();
  });

  /** Elementos para infinite scroll (filtrados por busqueda) */
  readonly infiniteScrollItems = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const items = this._infiniteItems();

    if (!term) return items;

    return items.filter(m =>
      m.mealType.toLowerCase().includes(term) ||
      m.foods.some(f => f.name.toLowerCase().includes(term))
    );
  });

  // ==========================================
  // METODOS DE CARGA
  // ==========================================

  /**
   * Carga los días disponibles y las comidas del usuario
   */
  load(userId: string): void {
    this._loading.set(true);
    this._error.set(null);

    // Primero cargar los días disponibles
    this.nutritionService.getAvailableMealDays().pipe(
      catchError(err => {
        console.error('Error loading available days:', err);
        return of([] as string[]);
      })
    ).subscribe(days => {
      this._availableDays.set(days);
      this._hasMealPlan.set(days.length > 0);

      // Si el día seleccionado no tiene comidas, seleccionar el primer día disponible
      if (days.length > 0 && !days.includes(this._selectedDay())) {
        this._selectedDay.set(days[0]);
      }

      // Cargar comidas del día seleccionado
      if (days.length > 0) {
        this.loadMealsForDay(this._selectedDay());
      } else {
        this._loading.set(false);
        this._meals.set([]);
      }
    });
  }

  /**
   * Carga comidas para un día específico de la semana
   */
  private loadMealsForDay(dayOfWeek: string): void {
    this.nutritionService.getMealsByDay(dayOfWeek).pipe(
      catchError(err => {
        console.error('Error loading meals:', err);
        this._error.set('Error al cargar las comidas');
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe(dia => {
      if (dia) {
        // Transformar a formato Meal[]
        const meals = this.transformDiaToMeals(dia);
        this._meals.set(meals);
      } else {
        this._meals.set([]);
      }
      this._currentPage.set(1);
    });
  }

  /**
   * Transforma DiaAlimentacionDTO a Meal[]
   */
  private transformDiaToMeals(dia: any): Meal[] {
    const meals: Meal[] = [];
    const mealTypes = [
      { key: 'desayuno', type: 'breakfast' as const, label: 'Desayuno' },
      { key: 'almuerzo', type: 'snack' as const, label: 'Almuerzo' },
      { key: 'comida', type: 'lunch' as const, label: 'Comida' },
      { key: 'merienda', type: 'snack' as const, label: 'Merienda' },
      { key: 'cena', type: 'dinner' as const, label: 'Cena' }
    ];

    mealTypes.forEach(({ key, type, label }) => {
      const comida = dia[key];
      if (comida && comida.alimentos && comida.alimentos.length > 0) {
        meals.push({
          id: `${dia.id}-${key}`,
          userId: '',
          date: new Date().toISOString().split('T')[0],
          mealType: type,
          foods: comida.alimentos.map((alimento: string) => ({
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
          totalFiber: 0
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
   * Cambia el día seleccionado y carga comidas
   */
  selectDay(day: string): void {
    this._selectedDay.set(day);
    this._loading.set(true);
    this.loadMealsForDay(day);
  }

  /**
   * Navega al día anterior disponible
   */
  previousMealDay(): void {
    const days = this._availableDays();
    const currentIndex = days.indexOf(this._selectedDay());
    if (currentIndex > 0) {
      this.selectDay(days[currentIndex - 1]);
    }
  }

  /**
   * Navega al día siguiente disponible
   */
  nextMealDay(): void {
    const days = this._availableDays();
    const currentIndex = days.indexOf(this._selectedDay());
    if (currentIndex < days.length - 1) {
      this.selectDay(days[currentIndex + 1]);
    }
  }

  /**
   * Helper para obtener el día actual en español
   */
  private getCurrentDayInSpanish(): string {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return days[new Date().getDay()];
  }

  /**
   * Carga la nutricion del dia desde el backend (método legacy)
   */
  loadByDate(userId: string, date?: string): void {
    const targetDate = date || this._currentDate();
    this._currentDate.set(targetDate);
    this._loading.set(true);
    this._error.set(null);

    this.nutritionService.getDailyNutrition(userId, targetDate).pipe(
      catchError(err => {
        console.error('Error loading nutrition data:', err);
        this._error.set('Error al cargar los datos de nutricion');
        return of(this.getEmptyNutrition(targetDate));
      }),
      finalize(() => this._loading.set(false))
    ).subscribe(nutrition => {
      this._dailyNutrition.set(nutrition);
      this._meals.set(nutrition.meals);
      this._currentPage.set(1);
    });
  }

  /**
   * Recarga los datos
   */
  refresh(userId: string): void {
    this.load(userId);
  }

  // ==========================================
  // METODOS CRUD
  // ==========================================

  /**
   * Agrega una nueva comida
   */
  add(meal: Meal): void {
    this._meals.update(list => [...list, meal]);
    this.toastService.success('Comida agregada');
  }

  /**
   * Actualiza una comida existente
   */
  update(updated: Meal): void {
    this._meals.update(list =>
      list.map(m => m.id === updated.id ? updated : m)
    );
  }

  /**
   * Elimina una comida por ID
   */
  remove(id: string): void {
    this._meals.update(list => list.filter(m => m.id !== id));
    this.toastService.success('Comida eliminada');
  }

  // ==========================================
  // METODOS DE BUSQUEDA Y PAGINACION
  // ==========================================

  /**
   * Establece el termino de busqueda
   */
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this._currentPage.set(1);
  }

  /**
   * Limpia el termino de busqueda
   */
  clearSearch(): void {
    this._searchTerm.set('');
    this._currentPage.set(1);
  }

  /**
   * Va a la pagina siguiente
   */
  nextPage(): void {
    if (this._currentPage() < this.totalPages()) {
      this._currentPage.update(p => p + 1);
    }
  }

  /**
   * Va a la pagina anterior
   */
  previousPage(): void {
    if (this._currentPage() > 1) {
      this._currentPage.update(p => p - 1);
    }
  }

  /**
   * Va a una pagina especifica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._currentPage.set(page);
    }
  }

  // ==========================================
  // METODOS DE FECHA
  // ==========================================

  /**
   * Cambia la fecha actual
   */
  setDate(date: string): void {
    this._currentDate.set(date);
  }

  /**
   * Va al dia anterior
   */
  previousDay(userId: string): void {
    const current = new Date(this._currentDate() + 'T12:00:00');
    current.setDate(current.getDate() - 1);
    const newDate = current.toISOString().split('T')[0];
    this.loadByDate(userId, newDate);
  }

  /**
   * Va al dia siguiente
   */
  nextDay(userId: string): void {
    const current = new Date(this._currentDate() + 'T12:00:00');
    current.setDate(current.getDate() + 1);
    const newDate = current.toISOString().split('T')[0];
    this.loadByDate(userId, newDate);
  }

  // ==========================================
  // METODOS DE ESTADO
  // ==========================================

  /**
   * Limpia el estado del store
   */
  clear(): void {
    this._meals.set([]);
    this._dailyNutrition.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._searchTerm.set('');
    this._currentPage.set(1);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }

  // ==========================================
  // METODOS PRIVADOS
  // ==========================================

  private getEmptyNutrition(date: string): DailyNutrition {
    return {
      date,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      waterIntake: 0,
      calorieGoal: 2000
    };
  }

  // ==========================================
  // METODOS DE INFINITE SCROLL
  // ==========================================

  /**
   * Cambia el modo de visualizacion (paginacion o infinite scroll)
   */
  setViewMode(mode: 'pagination' | 'infinite'): void {
    this._viewMode.set(mode);
    if (mode === 'infinite') {
      this.resetInfiniteScroll();
      this.loadMoreItems();
    }
  }

  /**
   * Carga mas elementos para infinite scroll
   */
  loadMore(): void {
    if (this._isLoadingMore() || !this._hasMore() || this._viewMode() !== 'infinite') {
      return;
    }
    this.loadMoreItems();
  }

  /**
   * Carga la siguiente pagina de elementos
   */
  private loadMoreItems(): void {
    this._isLoadingMore.set(true);

    // Simular carga paginada desde las comidas existentes
    const allItems = this._meals();
    const currentPage = this._infinitePage();
    const start = (currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const newItems = allItems.slice(start, end);

    // Simular delay de red
    setTimeout(() => {
      if (newItems.length > 0) {
        this._infiniteItems.update(items => [...items, ...newItems]);
        this._infinitePage.update(p => p + 1);
      }

      // Verificar si hay mas elementos
      this._hasMore.set(end < allItems.length);
      this._isLoadingMore.set(false);
    }, 300);
  }

  /**
   * Resetea el estado de infinite scroll
   */
  private resetInfiniteScroll(): void {
    this._infinitePage.set(1);
    this._hasMore.set(true);
    this._infiniteItems.set([]);
    this._isLoadingMore.set(false);
  }
}
