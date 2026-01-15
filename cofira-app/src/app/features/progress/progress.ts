import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NutrientCounter } from './components/nutrient-counter/nutrient-counter';
import { StrengthGainChart } from './components/strength-gain-chart/strength-gain-chart';
import { ProgressEvaluation } from './components/progress-evaluation/progress-evaluation';
import { ProgressService, NutrientData, ProgressEntry } from './services/progress.service';
import { ProgressStore } from './stores/progress.store';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [NutrientCounter, StrengthGainChart, ProgressEvaluation, ReactiveFormsModule, InfiniteScrollDirective],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress implements OnInit {
  private readonly progressService = inject(ProgressService);
  private readonly destroyRef = inject(DestroyRef);

  /** Store de progreso para gestion de estado */
  readonly store = inject(ProgressStore);

  // Reactive state using signals
  currentDate = signal(new Date().toISOString().split('T')[0]);
  nutrientData = signal<NutrientData | null>(null);
  progressEntries = signal<ProgressEntry[]>([]);
  exercises = signal<string[]>([]);
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
    this.loadProgressData();
  }

  private loadProgressData(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.error.set('Usuario no autenticado');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Cargar datos usando el store
    this.store.load(userId, this.currentDate());

    // Load nutrient data
    this.progressService.getNutrientDataByDate(userId, this.currentDate()).subscribe({
      next: (data) => {
        this.nutrientData.set(data);
      },
      error: (err) => {
        console.error('Error loading nutrient data:', err);
        this.error.set('Error al cargar los datos de nutrientes');
      }
    });

    // Load progress entries
    this.progressService.getProgressEntries(userId).subscribe({
      next: (entries) => {
        this.progressEntries.set(entries);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading progress entries:', err);
        this.error.set('Error al cargar el progreso');
        this.isLoading.set(false);
      }
    });

    // Load user exercises
    this.progressService.getUserExercises(userId).subscribe({
      next: (exercises) => {
        this.exercises.set(exercises);
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
      }
    });
  }

  private getUserId(): string | null {
    // Get user ID from localStorage or auth service
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user).id;
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
