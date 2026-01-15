import { Injectable, inject, signal, computed } from '@angular/core';
import { TrainingService, Exercise, WorkoutProgress } from '../services/training.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Store de dominio para gestionar el estado de entrenamientos
 *
 * Implementa el patrón de gestión de estado con Signals de Angular,
 * manteniendo el estado en memoria y notificando cambios reactivamente.
 *
 * @example
 * ```typescript
 * // En un componente
 * store = inject(TrainingStore);
 *
 * // Leer estado
 * exercises = this.store.exercises;
 * loading = this.store.loading;
 *
 * // Usar computed
 * total = this.store.totalExercises();
 *
 * // Modificar estado
 * this.store.add(newExercise);
 * this.store.toggleComplete('exercise-id');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TrainingStore {
  private readonly trainingService = inject(TrainingService);
  private readonly toastService = inject(ToastService);

  // ==========================================
  // ESTADO PRIVADO (solo modificable internamente)
  // ==========================================

  private readonly _exercises = signal<Exercise[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal('');
  private readonly _currentPage = signal(1);
  private readonly _selectedDay = signal<string>(this.getCurrentDayInSpanish());
  private readonly _availableDays = signal<string[]>([]);
  private readonly _hasRoutines = signal(false);

  // Estado para infinite scroll
  private readonly _viewMode = signal<'pagination' | 'infinite'>('pagination');
  private readonly _infinitePage = signal(1);
  private readonly _hasMore = signal(true);
  private readonly _isLoadingMore = signal(false);
  private readonly _infiniteItems = signal<Exercise[]>([]);

  // ==========================================
  // ESTADO PUBLICO (readonly para componentes)
  // ==========================================

  /** Lista de ejercicios cargados */
  readonly exercises = this._exercises.asReadonly();

  /** Estado de carga */
  readonly loading = this._loading.asReadonly();

  /** Mensaje de error si existe */
  readonly error = this._error.asReadonly();

  /** Termino de busqueda actual */
  readonly searchTerm = this._searchTerm.asReadonly();

  /** Pagina actual */
  readonly currentPage = this._currentPage.asReadonly();

  /** Elementos por pagina */
  readonly pageSize = 10;

  /** Día seleccionado actualmente */
  readonly selectedDay = this._selectedDay.asReadonly();

  /** Días disponibles con ejercicios */
  readonly availableDays = this._availableDays.asReadonly();

  /** Indica si hay rutinas cargadas (aunque no haya ejercicios hoy) */
  readonly hasRoutines = this._hasRoutines.asReadonly();

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

  /** Total de ejercicios */
  readonly totalExercises = computed(() => this._exercises().length);

  /** Ejercicios completados */
  readonly completedExercises = computed(() =>
    this._exercises().filter(e => e.completed).length
  );

  /** Porcentaje de completado */
  readonly completionPercentage = computed(() => {
    const total = this.totalExercises();
    if (total === 0) return 0;
    return Math.round((this.completedExercises() / total) * 100);
  });

  /** Ejercicios filtrados por busqueda */
  readonly filteredExercises = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const exercises = this._exercises();

    if (!term) return exercises;

    return exercises.filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.reps.toLowerCase().includes(term)
    );
  });

  /** Total de paginas */
  readonly totalPages = computed(() =>
    Math.ceil(this.filteredExercises().length / this.pageSize)
  );

  /** Ejercicios paginados (para mostrar en la UI) */
  readonly paginatedExercises = computed(() => {
    const filtered = this.filteredExercises();
    const start = (this._currentPage() - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });

  /** Indica si hay resultados de busqueda */
  readonly hasResults = computed(() => this.filteredExercises().length > 0);

  /** Indica si la lista esta vacia (sin ejercicios cargados) */
  readonly isEmpty = computed(() =>
    this._exercises().length === 0 && !this._loading() && !this._error()
  );

  /** Elementos para infinite scroll (filtrados por busqueda) */
  readonly infiniteScrollItems = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const items = this._infiniteItems();

    if (!term) return items;

    return items.filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.reps.toLowerCase().includes(term)
    );
  });

  // ==========================================
  // METODOS DE CARGA
  // ==========================================

  /**
   * Carga los ejercicios del usuario desde el backend
   */
  load(userId: string, date?: string): void {
    this._loading.set(true);
    this._error.set(null);

    // Primero cargar los días disponibles
    this.trainingService.getAvailableTrainingDays().pipe(
      catchError(err => {
        console.error('Error loading available days:', err);
        return of([] as string[]);
      })
    ).subscribe(days => {
      this._availableDays.set(days);
      this._hasRoutines.set(days.length > 0);

      // Si el día seleccionado no tiene ejercicios, seleccionar el primer día disponible
      if (days.length > 0 && !days.includes(this._selectedDay())) {
        this._selectedDay.set(days[0]);
      }

      // Cargar ejercicios del día seleccionado
      this.loadExercisesForDay(userId, this._selectedDay());
    });
  }

  /**
   * Carga ejercicios para un día específico
   */
  private loadExercisesForDay(userId: string, day: string): void {
    this.trainingService.getExercisesByDay(userId, day).pipe(
      catchError(err => {
        console.error('Error loading exercises:', err);
        this._error.set('Error al cargar los ejercicios');
        return of([]);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe(exercises => {
      this._exercises.set(exercises);
      this._currentPage.set(1);
    });
  }

  /**
   * Cambia el día seleccionado y carga ejercicios
   */
  selectDay(userId: string, day: string): void {
    this._selectedDay.set(day);
    this._loading.set(true);
    this.loadExercisesForDay(userId, day);
  }

  /**
   * Navega al día anterior
   */
  previousDay(userId: string): void {
    const days = this._availableDays();
    const currentIndex = days.indexOf(this._selectedDay());
    if (currentIndex > 0) {
      this.selectDay(userId, days[currentIndex - 1]);
    }
  }

  /**
   * Navega al día siguiente
   */
  nextDay(userId: string): void {
    const days = this._availableDays();
    const currentIndex = days.indexOf(this._selectedDay());
    if (currentIndex < days.length - 1) {
      this.selectDay(userId, days[currentIndex + 1]);
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
   * Recarga los ejercicios
   */
  refresh(userId: string, date?: string): void {
    this.load(userId, date);
  }

  // ==========================================
  // METODOS CRUD
  // ==========================================

  /**
   * Agrega un nuevo ejercicio a la lista
   */
  add(exercise: Exercise): void {
    this._exercises.update(list => [...list, exercise]);
    this.toastService.success('Ejercicio agregado');
  }

  /**
   * Actualiza un ejercicio existente
   */
  update(updated: Exercise): void {
    this._exercises.update(list =>
      list.map(e => e.id === updated.id ? updated : e)
    );
  }

  /**
   * Elimina un ejercicio por ID
   */
  remove(id: string): void {
    this._exercises.update(list => list.filter(e => e.id !== id));
    this.toastService.success('Ejercicio eliminado');
  }

  /**
   * Alterna el estado de completado de un ejercicio
   */
  toggleComplete(id: string): void {
    this._exercises.update(list =>
      list.map(e => e.id === id ? { ...e, completed: !e.completed } : e)
    );
  }

  /**
   * Marca todos los ejercicios como completados
   */
  completeAll(): void {
    this._exercises.update(list =>
      list.map(e => ({ ...e, completed: true }))
    );
    this.toastService.success('Todos los ejercicios completados');
  }

  // ==========================================
  // METODOS DE BUSQUEDA Y PAGINACION
  // ==========================================

  /**
   * Establece el termino de busqueda
   */
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this._currentPage.set(1); // Resetear a primera pagina al buscar
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
  // METODOS DE ESTADO
  // ==========================================

  /**
   * Limpia el estado del store
   */
  clear(): void {
    this._exercises.set([]);
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

    // Simular carga paginada desde los ejercicios existentes
    // En un caso real, esto haria una llamada HTTP con page/pageSize
    const allItems = this._exercises();
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
