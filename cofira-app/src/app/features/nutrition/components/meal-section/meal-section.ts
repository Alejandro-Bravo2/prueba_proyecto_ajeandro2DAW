import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FoodItem } from '../food-item/food-item';
import { ModalService } from '../../../../core/services/modal.service';
import { RecipeModal } from '../recipe-modal/recipe-modal';
import { FoodItem as FoodItemType, IngredienteDTO } from '../../services/nutrition.service';

@Component({
  selector: 'app-meal-section',
  standalone: true,
  imports: [FoodItem],
  templateUrl: './meal-section.html',
  styleUrl: './meal-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealSection {
  private readonly modalService = inject(ModalService);

  readonly title = input.required<string>();
  readonly foods = input<FoodItemType[]>([]);
  readonly mealId = input.required<string>();

  // New inputs for recipe data
  readonly descripcion = input<string>('');
  readonly tiempoPreparacion = input<number>(0);
  readonly porciones = input<number>(1);
  readonly dificultad = input<string>('FACIL');
  readonly ingredientes = input<IngredienteDTO[]>([]);
  readonly pasosPreparacion = input<string[]>([]);

  readonly isEmpty = computed(() => this.foods().length === 0);
  readonly foodCount = computed(() => this.foods().length);

  openIngredientsModal(): void {
    if (this.isEmpty()) return;

    const foodNames = this.foods().map(food => food.name);

    this.modalService.open(RecipeModal, {
      mealName: this.title(),
      descripcion: this.descripcion(),
      tiempoPreparacion: this.tiempoPreparacion(),
      porciones: this.porciones(),
      dificultad: this.dificultad(),
      ingredientes: this.ingredientes(),
      pasosPreparacion: this.pasosPreparacion(),
      foods: foodNames,
    });
  }

  trackByFoodName(_index: number, food: FoodItemType): string {
    return food.name;
  }
}
