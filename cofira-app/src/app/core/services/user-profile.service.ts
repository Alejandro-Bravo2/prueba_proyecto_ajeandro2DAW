import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NutritionTargets {
  calculatedBMR: number;
  calculatedTDEE: number;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface UserProfile {
  id: number;
  gender: string;
  birthDate: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: string;
  workType: string;
  sleepHoursAverage: number;
  primaryGoal: string;
  fitnessLevel: string;
  trainingDaysPerWeek: number;
  sessionDurationMinutes: number;
  preferredTrainingTime: string;
  dietType: string;
  mealsPerDay: number;
  allergies: string[];
  injuries: string[];
  equipment: string[];
  medicalConditions: string[];
  medications: string;
  previousSurgeries: string[];
  isPregnant: boolean;
  isBreastfeeding: boolean;
  nutritionTargets: NutritionTargets;
  onboardingCompletedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/onboarding`;

  private nutritionTargets$: Observable<NutritionTargets> | null = null;

  getNutritionTargets(): Observable<NutritionTargets> {
    if (!this.nutritionTargets$) {
      this.nutritionTargets$ = this.http
        .get<NutritionTargets>(`${this.API_URL}/nutrition-targets`)
        .pipe(shareReplay(1));
    }
    return this.nutritionTargets$;
  }

  refreshNutritionTargets(): Observable<NutritionTargets> {
    this.nutritionTargets$ = null;
    return this.getNutritionTargets();
  }

  getOnboardingStatus(): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/status`);
  }

  clearCache(): void {
    this.nutritionTargets$ = null;
  }
}
