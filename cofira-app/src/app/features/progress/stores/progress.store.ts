import { Injectable, inject, signal, computed } from '@angular/core';
import { ProgressService, ProgressEntry, NutrientData, StrengthProgress } from '../services/progress.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

/**
 * Store de dominio para gestionar el estado de progreso
 *
 * Implementa el patron de gestion de estado con Signals de Angular,
 * manteniendo el estado en memoria y notificando cambios reactivamente.
 *
 * @example
 * ```typescript
 * // En un componente
 * store = inject(ProgressStore);
 *
 * // Leer estado
 * entries = this.store.progressEntries;
 * loading = this.store.loading;
 *
 * // Usar computed
 * total = this.store.totalEntries();
 *
 * // Modificar estado
 * this.store.add(newEntry);
 * this.store.remove('entry-id');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ProgressStore {
  private readonly progressService = inject(ProgressService);
  private readonly toastService = inject(ToastService);

  // ==========================================
  // ESTADO PRIVADO (solo modificable internamente)
  // ==========================================

  private readonly _progressEntries = signal<ProgressEntry[]>([]);
  private readonly _nutrientData = signal<NutrientData | null>(null);
  private readonly _strengthProgress = signal<StrengthProgress | null>(null);
  private readonly _exercises = signal<string[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal('');
  private readonly _currentPage = signal(1);
  private readonly _currentDate = signal(new Date().toISOString().split('T')[0]);
  private readonly _selectedExercise = signal<string | null>(null);

  // Estado para infinite scroll
  private readonly _viewMode = signal<'pagination' | 'infinite'>('pagination');
  private readonly _infinitePage = signal(1);
  private readonly _hasMore = signal(true);
  private readonly _isLoadingMore = signal(false);
  private readonly _infiniteItems = signal<ProgressEntry[]>([]);

  // ==========================================
  // ESTADO PUBLICO (readonly para componentes)
  // ==========================================

  /** Lista de entradas de progreso */
  readonly progressEntries = this._progressEntries.asReadonly();

  /** Datos de nutrientes del dia */
  readonly nutrientData = this._nutrientData.asReadonly();

  /** Progreso de fuerza del ejercicio seleccionado */
  readonly strengthProgress = this._strengthProgress.asReadonly();

  /** Lista de ejercicios disponibles */
  readonly exercises = this._exercises.asReadonly();

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

  /** Ejercicio seleccionado */
  readonly selectedExercise = this._selectedExercise.asReadonly();

  /** Elementos por pagina */
  readonly pageSize = 10;

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

  /** Total de entradas de progreso */
  readonly totalEntries = computed(() => this._progressEntries().length);

  /** Total de ejercicios */
  readonly totalExercises = computed(() => this._exercises().length);

  /** Peso maximo registrado */
  readonly maxWeight = computed(() => {
    const entries = this._progressEntries();
    if (entries.length === 0) return 0;
    return Math.max(...entries.map(e => e.weight));
  });

  /** Volumen total (peso x reps x sets) */
  readonly totalVolume = computed(() =>
    this._progressEntries().reduce(
      (sum, e) => sum + (e.weight * e.reps * e.sets),
      0
    )
  );

  /** Calorias consumidas hoy */
  readonly caloriesConsumed = computed(() =>
    this._nutrientData()?.calories ?? 0
  );

  /** Meta de calorias */
  readonly calorieGoal = computed(() =>
    this._nutrientData()?.calorieGoal ?? 2000
  );

  /** Porcentaje de calorias consumidas */
  readonly caloriePercentage = computed(() => {
    const goal = this.calorieGoal();
    if (goal === 0) return 0;
    return Math.round((this.caloriesConsumed() / goal) * 100);
  });

  /** Entradas filtradas por busqueda */
  readonly filteredEntries = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const entries = this._progressEntries();

    if (!term) return entries;

    return entries.filter(e =>
      e.exerciseName.toLowerCase().includes(term) ||
      (e.notes?.toLowerCase().includes(term) ?? false)
    );
  });

  /** Total de paginas */
  readonly totalPages = computed(() =>
    Math.ceil(this.filteredEntries().length / this.pageSize)
  );

  /** Entradas paginadas (para mostrar en la UI) */
  readonly paginatedEntries = computed(() => {
    const filtered = this.filteredEntries();
    const start = (this._currentPage() - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });

  /** Indica si hay resultados de busqueda */
  readonly hasResults = computed(() => this.filteredEntries().length > 0);

  /** Indica si la lista esta vacia */
  readonly isEmpty = computed(() =>
    this._progressEntries().length === 0 && !this._loading() && !this._error()
  );

  /** Indica si hay progreso registrado */
  readonly hasProgress = computed(() => this._progressEntries().length > 0);

  /** Elementos para infinite scroll (filtrados por busqueda) */
  readonly infiniteScrollItems = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const items = this._infiniteItems();

    if (!term) return items;

    return items.filter(e =>
      e.exerciseName.toLowerCase().includes(term) ||
      (e.notes?.toLowerCase().includes(term) ?? false)
    );
  });

  // ==========================================
  // METODOS DE CARGA
  // ==========================================

  /**
   * Carga todos los datos de progreso del usuario
   */
  load(userId: string, date?: string): void {
    const targetDate = date || this._currentDate();
    this._currentDate.set(targetDate);
    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      entries: this.progressService.getProgressEntries(userId).pipe(
        catchError(() => of([]))
      ),
      nutrients: this.progressService.getNutrientDataByDate(userId, targetDate).pipe(
        catchError(() => of(this.getEmptyNutrientData(targetDate)))
      ),
      exercises: this.progressService.getUserExercises(userId).pipe(
        catchError(() => of([]))
      )
    }).pipe(
      finalize(() => this._loading.set(false))
    ).subscribe(({ entries, nutrients, exercises }) => {
      this._progressEntries.set(entries);
      this._nutrientData.set(nutrients);
      this._exercises.set(exercises);
      this._currentPage.set(1);
    });
  }

  /**
   * Carga el progreso de fuerza de un ejercicio especifico
   */
  loadStrengthProgress(userId: string, exerciseName: string): void {
    this._selectedExercise.set(exerciseName);
    this._loading.set(true);

    this.progressService.getStrengthProgress(userId, exerciseName).pipe(
      catchError(() => of({ exerciseName, data: [] })),
      finalize(() => this._loading.set(false))
    ).subscribe(progress => {
      this._strengthProgress.set(progress);
    });
  }

  /**
   * Recarga los datos
   */
  refresh(userId: string): void {
    this.load(userId, this._currentDate());
  }

  // ==========================================
  // METODOS CRUD
  // ==========================================

  /**
   * Agrega una nueva entrada de progreso
   */
  add(entry: ProgressEntry): void {
    this._progressEntries.update(list => [...list, entry]);
    this.toastService.success('Progreso registrado');
  }

  /**
   * Actualiza una entrada existente
   */
  update(updated: ProgressEntry): void {
    this._progressEntries.update(list =>
      list.map(e => e.id === updated.id ? updated : e)
    );
  }

  /**
   * Elimina una entrada por ID
   */
  remove(id: string): void {
    this._progressEntries.update(list => list.filter(e => e.id !== id));
    this.toastService.success('Entrada eliminada');
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
    this.load(userId, newDate);
  }

  /**
   * Va al dia siguiente
   */
  nextDay(userId: string): void {
    const current = new Date(this._currentDate() + 'T12:00:00');
    current.setDate(current.getDate() + 1);
    const newDate = current.toISOString().split('T')[0];
    this.load(userId, newDate);
  }

  // ==========================================
  // METODOS DE EJERCICIO
  // ==========================================

  /**
   * Selecciona un ejercicio para ver su progreso
   */
  selectExercise(exerciseName: string | null): void {
    this._selectedExercise.set(exerciseName);
  }

  /**
   * Agrega un ejercicio a la lista
   */
  addExercise(exerciseName: string): void {
    if (!this._exercises().includes(exerciseName)) {
      this._exercises.update(list => [...list, exerciseName]);
    }
  }

  // ==========================================
  // METODOS DE ESTADO
  // ==========================================

  /**
   * Limpia el estado del store
   */
  clear(): void {
    this._progressEntries.set([]);
    this._nutrientData.set(null);
    this._strengthProgress.set(null);
    this._exercises.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._searchTerm.set('');
    this._currentPage.set(1);
    this._selectedExercise.set(null);
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

  private getEmptyNutrientData(date: string): NutrientData {
    return {
      date,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      water: 0,
      calories: 0,
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

    // Simular carga paginada desde las entradas existentes
    const allItems = this._progressEntries();
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
