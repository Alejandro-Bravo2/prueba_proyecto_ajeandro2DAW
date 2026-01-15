import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchableTags } from '../../shared/components/ui/searchable-tags/searchable-tags/searchable-tags';
import { PreferencesService } from './services/preferences.service';
import { Tabs, TabPanel, Tab } from '../../shared/components/ui/tabs/tabs';

interface TagOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, SearchableTags, Tabs, TabPanel],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences implements OnInit {
  // Tabs configuration
  tabs: Tab[] = [
    { id: 'nutrition', label: 'Alimentación' },
    { id: 'account', label: 'Cuenta' },
    { id: 'notifications', label: 'Notificaciones' }
  ];

  activeTab = signal('nutrition');

  availableAllergies: TagOption[] = [
    { label: 'Lácteos', value: 'lacteos' },
    { label: 'Gluten', value: 'gluten' },
    { label: 'Frutos secos', value: 'frutos_secos' },
    { label: 'Cacahuete', value: 'cacahuete' },
    { label: 'Soja', value: 'soja' },
  ];

  availableIngredients: TagOption[] = [
    { label: 'Pollo', value: 'pollo' },
    { label: 'Arroz', value: 'arroz' },
    { label: 'Aguacate', value: 'aguacate' },
    { label: 'Espinacas', value: 'espinacas' },
    { label: 'Salmón', value: 'salmon' },
  ];

  constructor(public preferencesService: PreferencesService) {}

  ngOnInit(): void {
    // Optionally load initial preferences from a backend or user profile
  }

  onTabChanged(tabId: string): void {
    this.activeTab.set(tabId);
  }

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
