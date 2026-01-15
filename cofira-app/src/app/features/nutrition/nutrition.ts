import { Component, signal, inject, OnInit, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DailyMenu } from './components/daily-menu/daily-menu';
import { NutritionService, DailyNutrition } from './services/nutrition.service';
import { NutritionStore } from './stores/nutrition.store';
import { NutritionSceneComponent } from '../../shared/components/nutrition-scene/nutrition-scene.component';
import { NutritionDashboard, NutritionGoals } from './components/nutrition-dashboard/nutrition-dashboard';
import { WeeklyProgress, WeeklyData } from './components/weekly-progress/weekly-progress';
import { FoodAnalysis } from './services/nutrition-ai.service';
import { ToastService } from '../../core/services/toast.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { finalize, retry, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [DailyMenu, NutritionSceneComponent, NutritionDashboard, WeeklyProgress, ReactiveFormsModule, InfiniteScrollDirective],
  templateUrl: './nutrition.html',
  styleUrl: './nutrition.scss',
})
export class Nutrition implements OnInit {
  private readonly nutritionService = inject(NutritionService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  /** Store de nutricion para gestion de estado */
  readonly store = inject(NutritionStore);

  // State signals
  readonly currentDate = signal(this.getTodayDate());
  readonly dailyNutrition = signal<DailyNutrition | null>(null);
  readonly isLoading = signal(false);
  readonly isLoadingGoals = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeView = signal<'dashboard' | 'meals'>('dashboard');

  // Nutrition goals loaded from user profile
  readonly nutritionGoals = signal<NutritionGoals | null>(null);

  // Weekly data for progress chart
  readonly weeklyData = signal<WeeklyData[]>([]);

  // Stats - start at 0, load from backend
  readonly waterGlasses = signal(0);
  readonly currentStreak = signal(0);

  /** Control para busqueda con debounce */
  readonly searchControl = new FormControl('');

  // Computed states
  readonly isEmpty = computed(() =>
    !this.dailyNutrition() && !this.isLoading() && !this.error()
  );

  readonly hasMeals = computed(() => {
    const nutrition = this.dailyNutrition();
    return nutrition && nutrition.meals.length > 0;
  });

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
    this.loadNutritionGoals();
    this.loadNutritionDataFromStore();
  }

  private loadNutritionDataFromStore(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.dailyNutrition.set(null);
      return;
    }
    // Cargar usando el store (navegación por días de la semana)
    this.store.load(userId);
  }

  /**
   * Navega al día anterior de comidas
   */
  onPreviousMealDay(): void {
    this.store.previousMealDay();
  }

  /**
   * Navega al día siguiente de comidas
   */
  onNextMealDay(): void {
    this.store.nextMealDay();
  }

  private loadNutritionGoals(): void {
    this.isLoadingGoals.set(true);

    this.userProfileService
      .getNutritionTargets()
      .pipe(
        catchError(() => {
          // Return null if goals can't be loaded
          return of(null);
        }),
        finalize(() => this.isLoadingGoals.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (targets) => {
          if (targets) {
            this.nutritionGoals.set({
              calories: Math.round(targets.dailyCalories),
              protein: Math.round(targets.proteinGrams),
              carbs: Math.round(targets.carbsGrams),
              fat: Math.round(targets.fatGrams),
              fiber: Math.round(targets.fiberGrams),
            });
          }
        },
      });
  }

  onDateChanged(newDate: string): void {
    if (newDate === this.currentDate()) return;
    this.currentDate.set(newDate);
    this.loadNutritionData();
  }

  retryLoad(): void {
    this.loadNutritionDataFromStore();
  }

  addMeal(): void {
    this.router.navigate(['/nutrition/add'], {
      queryParams: { date: this.currentDate() }
    });
  }

  setActiveView(view: 'dashboard' | 'meals'): void {
    this.activeView.set(view);
  }

  onFoodAdded(food: FoodAnalysis): void {
    this.toastService.success(`${food.name} añadido al diario`);
    this.loadNutritionData();
  }

  private loadNutritionData(): void {
    const userId = this.getUserId();
    if (!userId) {
      // No user logged in - show empty state
      this.dailyNutrition.set(null);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.nutritionService
      .getDailyNutrition(userId, this.currentDate())
      .pipe(
        retry({ count: 2, delay: 1000 }),
        catchError(() => {
          // Return empty state on error
          return of(this.getEmptyDailyNutrition());
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => this.dailyNutrition.set(data),
      });
  }

  private getEmptyDailyNutrition(): DailyNutrition {
    const date = this.currentDate();
    const goals = this.nutritionGoals();

    return {
      date,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      waterIntake: 0,
      calorieGoal: goals?.calories || 0,
    };
  }

  private getUserId(): string | null {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user).id : null;
    } catch {
      return null;
    }
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
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
