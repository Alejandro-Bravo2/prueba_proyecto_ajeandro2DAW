import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FoodAnalysis {
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence: number;
  ingredients: string[];
  suggestions?: string[];
}

export interface AnalysisResponse {
  analysis: FoodAnalysis;
  imageUrl?: string;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  ingredients: string[];
  confidence: number;
  mealType: string;
  date: string;
  isManual: boolean;
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  mealCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class NutritionAIService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/nutrition`;

  // State
  isAnalyzing = signal(false);
  lastAnalysis = signal<FoodAnalysis | null>(null);
  dailyNutrition = signal<DailyNutrition | null>(null);

  /**
   * Analyzes a food image using OpenRouter AI
   */
  analyzeFood(image: File): Observable<AnalysisResponse> {
    this.isAnalyzing.set(true);

    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<AnalysisResponse>(`${this.apiUrl}/analyze`, formData).pipe(
      tap(response => {
        this.lastAnalysis.set(response.analysis);
        this.isAnalyzing.set(false);
      }),
      catchError(error => {
        this.isAnalyzing.set(false);
        // Fallback to mock for demo if backend unavailable
        console.warn('AI analysis failed, using mock data:', error);
        return this.getMockAnalysis();
      })
    );
  }

  /**
   * Save analyzed meal to database
   */
  saveMeal(analysis: FoodAnalysis, imageUrl?: string, mealType: string = 'LUNCH'): Observable<{ meal: Meal }> {
    return this.http.post<{ meal: Meal }>(`${this.apiUrl}/meals/from-analysis`, {
      analysis,
      imageUrl,
      mealType,
      date: new Date().toISOString()
    });
  }

  /**
   * Get meals for a specific date
   */
  getMeals(date?: string): Observable<{ meals: Meal[]; pagination: { total: number } }> {
    const url = date ? `${this.apiUrl}/meals?date=${date}` : `${this.apiUrl}/meals`;
    return this.http.get<{ meals: Meal[]; pagination: { total: number } }>(url);
  }

  /**
   * Get daily nutrition summary
   */
  getDailyNutrition(date?: string): Observable<DailyNutrition> {
    const url = date ? `${this.apiUrl}/daily?date=${date}` : `${this.apiUrl}/daily`;
    return this.http.get<DailyNutrition>(url).pipe(
      tap(data => this.dailyNutrition.set(data))
    );
  }

  /**
   * Delete a meal
   */
  deleteMeal(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/meals/${id}`);
  }

  /**
   * Create a manual meal entry
   */
  createManualMeal(meal: Partial<Meal>): Observable<{ meal: Meal }> {
    return this.http.post<{ meal: Meal }>(`${this.apiUrl}/meals`, meal);
  }

  /**
   * Mock analysis for fallback/demo
   */
  private getMockAnalysis(): Observable<AnalysisResponse> {
    const mockAnalysis: FoodAnalysis = {
      name: 'Ensalada César con Pollo',
      description: 'Ensalada fresca con pollo a la parrilla, parmesano y aderezo césar',
      calories: 450,
      protein: 35,
      carbs: 18,
      fat: 28,
      fiber: 4,
      sugar: 3,
      confidence: 92,
      ingredients: ['Lechuga romana', 'Pollo a la parrilla', 'Parmesano', 'Crutones', 'Aderezo César'],
      suggestions: ['Añade más verduras para más fibra', 'Usa aderezo bajo en grasa']
    };

    return of({ analysis: mockAnalysis }).pipe(delay(1500));
  }

  /**
   * Get suggested serving sizes for a food
   */
  getSuggestedServings(): Observable<string[]> {
    const servings = ['100g', '150g', '200g', '250g', '300g', '1 porción', '1/2 porción'];
    return of(servings);
  }

  /**
   * Adjust nutritional values based on serving size
   */
  adjustForServingSize(analysis: FoodAnalysis, newServingGrams: number, originalGrams: number): FoodAnalysis {
    const ratio = newServingGrams / originalGrams;

    return {
      ...analysis,
      calories: Math.round(analysis.calories * ratio),
      protein: Math.round(analysis.protein * ratio * 10) / 10,
      carbs: Math.round(analysis.carbs * ratio * 10) / 10,
      fat: Math.round(analysis.fat * ratio * 10) / 10,
      fiber: analysis.fiber ? Math.round(analysis.fiber * ratio * 10) / 10 : undefined,
      sugar: analysis.sugar ? Math.round(analysis.sugar * ratio * 10) / 10 : undefined
    };
  }
}
