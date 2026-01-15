import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WeeklyTable } from './components/weekly-table/weekly-table';
import { FeedbackForm } from './components/feedback-form/feedback-form';
import { ProgressCard } from './components/progress-card/progress-card';
import { TrainingService, Exercise, WorkoutProgress } from './services/training.service';
import { TrainingStore } from './stores/training.store';
import { EmptyState } from '../../shared/components/ui/empty-state/empty-state';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [WeeklyTable, FeedbackForm, ProgressCard, EmptyState, ReactiveFormsModule, InfiniteScrollDirective],
  templateUrl: './training.html',
  styleUrl: './training.scss',
})
export class Training implements OnInit {
  private readonly trainingService = inject(TrainingService);
  private readonly destroyRef = inject(DestroyRef);

  /** Store de entrenamiento para gestion de estado */
  readonly store = inject(TrainingStore);

  // Reactive state using signals
  currentDate = signal(new Date().toISOString().split('T')[0]);
  workoutProgress = signal<WorkoutProgress | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  /** Control para busqueda con debounce */
  readonly searchControl = new FormControl('');

  constructor() {
    // Configurar busqueda con debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.store.setSearchTerm(term ?? '');
    });
  }

  ngOnInit(): void {
    this.loadTrainingData();
  }

  private loadTrainingData(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.error.set('Usuario no autenticado');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Cargar ejercicios usando el store
    this.store.load(userId, this.currentDate());

    // Cargar progreso del entrenamiento
    this.trainingService.getWorkoutProgress(userId).subscribe({
      next: (progress) => {
        this.workoutProgress.set(progress);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el progreso del entrenamiento');
        this.isLoading.set(false);
      },
    });
  }

  private getUserId(): string | null {
    try {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed?.id ?? null;
      }
    } catch {
      return null;
    }
    return null;
  }

  /** Limpiar busqueda */
  clearSearch(): void {
    this.searchControl.setValue('');
    this.store.clearSearch();
  }

  /** Ir a pagina anterior */
  previousPage(): void {
    this.store.previousPage();
  }

  /** Ir a pagina siguiente */
  nextPage(): void {
    this.store.nextPage();
  }

  /**
   * Metodo llamado desde el EmptyState para crear una nueva rutina.
   * Navega al formulario de creacion de rutina.
   */
  createRoutine(): void {
    // Navegar al formulario de creacion de rutina
    // En una implementacion completa, esto abriria un modal o navegaria a otra vista
  }

  /**
   * Navega al día anterior
   */
  onPreviousDay(): void {
    const userId = this.getUserId();
    if (userId) {
      this.store.previousDay(userId);
    }
  }

  /**
   * Navega al día siguiente
   */
  onNextDay(): void {
    const userId = this.getUserId();
    if (userId) {
      this.store.nextDay(userId);
    }
  }

  // ==========================================
  // METODOS DE INFINITE SCROLL
  // ==========================================

  /**
   * Cambia el modo de visualizacion (paginacion o infinite scroll)
   */
  setViewMode(mode: 'pagination' | 'infinite'): void {
    this.store.setViewMode(mode);
  }

  /**
   * Carga mas elementos para infinite scroll
   */
  loadMore(): void {
    this.store.loadMore();
  }
}
