import { Component, input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngredienteDTO } from '../../services/nutrition.service';

@Component({
  selector: 'app-recipe-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-modal.html',
  styleUrl: './recipe-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeModal {
  // Inputs from meal-section
  mealName = input<string>('Plato');
  descripcion = input<string>('');
  tiempoPreparacion = input<number>(0);
  porciones = input<number>(1);
  dificultad = input<string>('FACIL');
  ingredientes = input<IngredienteDTO[]>([]);
  pasosPreparacion = input<string[]>([]);
  foods = input<string[]>([]);

  // Active tab state
  activeTab = signal<'ingredientes' | 'receta'>('ingredientes');

  // Computed values
  hasRecipe = computed(() =>
    this.pasosPreparacion().length > 0 || this.ingredientes().length > 0
  );

  difficultyLabel = computed(() => {
    const dif = this.dificultad();
    const labels: Record<string, string> = {
      'FACIL': 'Facil',
      'MEDIA': 'Media',
      'DIFICIL': 'Dificil'
    };
    return labels[dif] || dif;
  });

  difficultyClass = computed(() => {
    const dif = this.dificultad();
    return {
      'FACIL': 'difficulty--easy',
      'MEDIA': 'difficulty--medium',
      'DIFICIL': 'difficulty--hard'
    }[dif] || 'difficulty--easy';
  });

  setActiveTab(tab: 'ingredientes' | 'receta'): void {
    this.activeTab.set(tab);
  }
}
