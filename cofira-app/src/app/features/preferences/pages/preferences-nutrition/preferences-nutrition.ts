import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchableTags } from '../../../../shared/components/ui/searchable-tags/searchable-tags/searchable-tags';
import { PreferencesService } from '../../services/preferences.service';

interface TagOption {
  label: string;
  value: string;
}

/**
 * Componente hijo para las preferencias de alimentacion
 * Se renderiza dentro del router-outlet de PreferencesLayout
 *
 * Ruta: /preferencias/alimentacion
 */
@Component({
  selector: 'app-preferences-nutrition',
  standalone: true,
  imports: [CommonModule, SearchableTags],
  templateUrl: './preferences-nutrition.html',
  styleUrl: './preferences-nutrition.scss',
})
export class PreferencesNutrition {
  preferencesService = inject(PreferencesService);

  availableAllergies: TagOption[] = [
    { label: 'Lacteos', value: 'lacteos' },
    { label: 'Gluten', value: 'gluten' },
    { label: 'Frutos secos', value: 'frutos_secos' },
    { label: 'Cacahuete', value: 'cacahuete' },
    { label: 'Soja', value: 'soja' },
    { label: 'Huevo', value: 'huevo' },
    { label: 'Marisco', value: 'marisco' },
    { label: 'Pescado', value: 'pescado' },
  ];

  availableIngredients: TagOption[] = [
    { label: 'Pollo', value: 'pollo' },
    { label: 'Arroz', value: 'arroz' },
    { label: 'Aguacate', value: 'aguacate' },
    { label: 'Espinacas', value: 'espinacas' },
    { label: 'Salmon', value: 'salmon' },
    { label: 'Huevos', value: 'huevos' },
    { label: 'Brocoli', value: 'brocoli' },
    { label: 'Avena', value: 'avena' },
  ];

  onAllergyAdded(allergy: TagOption): void {
    this.preferencesService.addAllergy(allergy);
  }

  onAllergyRemoved(allergy: TagOption): void {
    this.preferencesService.removeAllergy(allergy);
  }

  onFavoriteIngredientAdded(ingredient: TagOption): void {
    this.preferencesService.addFavoriteIngredient(ingredient);
  }

  onFavoriteIngredientRemoved(ingredient: TagOption): void {
    this.preferencesService.removeFavoriteIngredient(ingredient);
  }
}
