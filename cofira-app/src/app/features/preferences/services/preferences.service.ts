import { Injectable, signal } from '@angular/core';

interface Tag {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  allergies = signal<Tag[]>([]);
  favoriteIngredients = signal<Tag[]>([]);

  constructor() { }

  addAllergy(allergy: Tag): void {
    this.allergies.update(tags => {
      if (!tags.some(t => t.value === allergy.value)) {
        return [...tags, allergy];
      }
      return tags;
    });
  }

  removeAllergy(allergy: Tag): void {
    this.allergies.update(tags => tags.filter(t => t.value !== allergy.value));
  }

  addFavoriteIngredient(ingredient: Tag): void {
    this.favoriteIngredients.update(tags => {
      if (!tags.some(t => t.value === ingredient.value)) {
        return [...tags, ingredient];
      }
      return tags;
    });
  }

  removeFavoriteIngredient(ingredient: Tag): void {
    this.favoriteIngredients.update(tags => tags.filter(t => t.value !== ingredient.value));
  }
}
