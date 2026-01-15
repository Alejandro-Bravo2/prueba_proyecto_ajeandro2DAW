import { Component, input, output, computed, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { MacroChart, MacroData } from '../macro-chart/macro-chart';
import { PhotoAnalyzer } from '../photo-analyzer/photo-analyzer';
import { FoodAnalysis } from '../../services/nutrition-ai.service';
import { DailyNutrition } from '../../services/nutrition.service';

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

@Component({
  selector: 'app-nutrition-dashboard',
  standalone: true,
  imports: [MacroChart, PhotoAnalyzer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nutrition-dashboard.html',
  styleUrl: './nutrition-dashboard.scss',
})
export class NutritionDashboard {
  readonly dailyNutrition = input<DailyNutrition | null>(null);
  readonly goals = input.required<NutritionGoals>();
  readonly showFiber = input<boolean>(true);
  readonly waterGlasses = input<number>(0);
  readonly currentStreak = input<number>(0);

  readonly foodAdded = output<FoodAnalysis>();

  // Calories calculations
  readonly caloriesCircumference = 2 * Math.PI * 52;

  readonly currentCalories = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food.calories, 0), 0
    );
  });

  readonly remainingCalories = computed(() => {
    return Math.max(this.goals().calories - this.currentCalories(), 0);
  });

  readonly caloriesOffset = computed(() => {
    const percentage = Math.min(this.currentCalories() / this.goals().calories, 1);
    return this.caloriesCircumference * (1 - percentage);
  });

  // Macro calculations
  readonly currentProtein = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food.protein, 0), 0
    );
  });

  readonly currentCarbs = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food.carbs, 0), 0
    );
  });

  readonly currentFat = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food.fat, 0), 0
    );
  });

  readonly currentFiber = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + (food.fiber || 0), 0), 0
    );
  });

  // MacroData for charts
  readonly proteinData = computed<MacroData>(() => ({
    current: this.currentProtein(),
    goal: this.goals().protein,
    unit: 'g',
  }));

  readonly carbsData = computed<MacroData>(() => ({
    current: this.currentCarbs(),
    goal: this.goals().carbs,
    unit: 'g',
  }));

  readonly fatData = computed<MacroData>(() => ({
    current: this.currentFat(),
    goal: this.goals().fat,
    unit: 'g',
  }));

  readonly fiberData = computed<MacroData>(() => ({
    current: this.currentFiber(),
    goal: this.goals().fiber || 25,
    unit: 'g',
  }));

  // Distribution percentages
  readonly totalMacroCalories = computed(() => {
    return (this.currentProtein() * 4) + (this.currentCarbs() * 4) + (this.currentFat() * 9);
  });

  readonly proteinPercentage = computed(() => {
    const total = this.totalMacroCalories();
    if (total === 0) return 33;
    return Math.round((this.currentProtein() * 4 / total) * 100);
  });

  readonly carbsPercentage = computed(() => {
    const total = this.totalMacroCalories();
    if (total === 0) return 34;
    return Math.round((this.currentCarbs() * 4 / total) * 100);
  });

  readonly fatPercentage = computed(() => {
    const total = this.totalMacroCalories();
    if (total === 0) return 33;
    return Math.round((this.currentFat() * 9 / total) * 100);
  });

  // Stats
  readonly mealsCount = computed(() => {
    const nutrition = this.dailyNutrition();
    return nutrition?.meals.length || 0;
  });

  onFoodAnalyzed(analysis: FoodAnalysis): void {
    // Handle analyzed food preview
    console.log('Food analyzed:', analysis);
  }

  onFoodConfirmed(analysis: FoodAnalysis): void {
    // Emit to parent to add to daily nutrition
    this.foodAdded.emit(analysis);
  }
}
