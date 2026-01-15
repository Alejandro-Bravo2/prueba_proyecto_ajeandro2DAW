import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Ingredient {
  name: string;
  quantity: string;
  price: number;
}

@Component({
  selector: 'app-ingredients-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingredients-modal.html',
  styleUrl: './ingredients-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsModal {
  // Using Angular 20 input signals
  mealName = input<string>('Plato');
  ingredients = input<Ingredient[]>([
    { name: 'Pollo', quantity: '200g', price: 2.5 },
    { name: 'Arroz', quantity: '150g', price: 0.3 },
    { name: 'Verduras Mixtas', quantity: '100g', price: 0.8 },
  ]);

  // Using computed signal for derived state
  totalCost = computed(() => this.ingredients().reduce((sum, item) => sum + item.price, 0));
}
