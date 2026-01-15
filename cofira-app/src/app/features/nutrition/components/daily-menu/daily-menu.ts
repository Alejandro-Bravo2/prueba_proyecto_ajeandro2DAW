import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { MealSection } from '../meal-section/meal-section';
import { Meal } from '../../services/nutrition.service';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Merienda',
};

@Component({
  selector: 'app-daily-menu',
  standalone: true,
  imports: [MealSection],
  templateUrl: './daily-menu.html',
  styleUrl: './daily-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyMenu {
  /** Meals to display (from store) */
  readonly meals = input<Meal[]>([]);

  /** Selected day identifier */
  readonly selectedDay = input<string>('');

  /** Computed: meals to display */
  readonly displayMeals = computed(() => this.meals());

  /** Computed: check if there are meals to display */
  readonly hasMealsToShow = computed(() => this.displayMeals().length > 0);

  getMealLabel(type: string): string {
    return MEAL_LABELS[type as MealType] || type;
  }

  trackByMealId(_index: number, meal: { id: string }): string {
    return meal.id;
  }
}
