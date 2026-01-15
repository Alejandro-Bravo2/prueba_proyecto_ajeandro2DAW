import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { NutritionService, Meal, DailyNutrition, FoodItem } from './nutrition.service';
import { environment } from '../../../../environments/environment';

describe('NutritionService', () => {
  let service: NutritionService;
  let httpMock: HttpTestingController;

  const mockFoodItem: FoodItem = {
    icon: '🍎',
    quantity: '1 unidad',
    name: 'Manzana',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4,
  };

  const mockMeal: Meal = {
    id: 'meal-1',
    userId: 'user-1',
    date: '2026-01-12',
    mealType: 'breakfast',
    foods: [mockFoodItem],
    totalCalories: 95,
    totalProtein: 0.5,
    totalCarbs: 25,
    totalFat: 0.3,
    totalFiber: 4,
  };

  const mockDailyNutrition: DailyNutrition = {
    date: '2026-01-12',
    meals: [mockMeal],
    totalCalories: 2000,
    totalProtein: 150,
    totalCarbs: 250,
    totalFat: 65,
    totalFiber: 30,
    waterIntake: 2000,
    calorieGoal: 2200,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NutritionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NutritionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods', () => {
    it('should fetch daily nutrition data', () => {
      service.get<DailyNutrition>('/nutrition/daily/2026-01-12').subscribe((response) => {
        expect(response.date).toBe('2026-01-12');
        expect(response.meals.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/nutrition/daily/2026-01-12`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDailyNutrition);
    });

    it('should add a new meal', () => {
      service.post<Meal>('/nutrition/meals', mockMeal).subscribe((response) => {
        expect(response.id).toBe('meal-1');
        expect(response.mealType).toBe('breakfast');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/nutrition/meals`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockMeal);
      req.flush(mockMeal);
    });

    it('should update a meal', () => {
      const updatedMeal = { ...mockMeal, totalCalories: 150 };

      service.put<Meal>('/nutrition/meals/meal-1', updatedMeal).subscribe((response) => {
        expect(response.totalCalories).toBe(150);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/nutrition/meals/meal-1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedMeal);
    });

    it('should delete a meal', () => {
      service.delete('/nutrition/meals/meal-1').subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/nutrition/meals/meal-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors after retries', (done) => {
      service.get('/nutrition/invalid').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      // BaseHttpService uses retry(2), so we need to handle 3 requests total
      const requests = httpMock.match(`${environment.apiUrl}/nutrition/invalid`);
      expect(requests.length).toBe(1);
      requests[0].flush('Not Found', { status: 404, statusText: 'Not Found' });

      // Handle the 2 retries
      setTimeout(() => {
        const retry1 = httpMock.match(`${environment.apiUrl}/nutrition/invalid`);
        if (retry1.length > 0) {
          retry1[0].flush('Not Found', { status: 404, statusText: 'Not Found' });
        }
        setTimeout(() => {
          const retry2 = httpMock.match(`${environment.apiUrl}/nutrition/invalid`);
          if (retry2.length > 0) {
            retry2[0].flush('Not Found', { status: 404, statusText: 'Not Found' });
          }
        }, 10);
      }, 10);
    });

    it('should handle 500 errors after retries', (done) => {
      service.get('/nutrition/error').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      // BaseHttpService uses retry(2), so we need to handle 3 requests total
      const requests = httpMock.match(`${environment.apiUrl}/nutrition/error`);
      expect(requests.length).toBe(1);
      requests[0].flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // Handle the 2 retries
      setTimeout(() => {
        const retry1 = httpMock.match(`${environment.apiUrl}/nutrition/error`);
        if (retry1.length > 0) {
          retry1[0].flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
        }
        setTimeout(() => {
          const retry2 = httpMock.match(`${environment.apiUrl}/nutrition/error`);
          if (retry2.length > 0) {
            retry2[0].flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
          }
        }, 10);
      }, 10);
    });
  });
});
