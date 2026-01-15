import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import {
  TrainingService,
  WeeklySchedule,
  GeneratedWorkout,
  WorkoutProgress,
} from './training.service';
import { environment } from '../../../../environments/environment';

describe('TrainingService', () => {
  let service: TrainingService;
  let httpMock: HttpTestingController;

  const mockWorkout: GeneratedWorkout = {
    id: 'workout-1',
    name: 'Full Body Workout',
    description: 'Complete body training',
    duration: 60,
    difficulty: 'MEDIUM',
    muscleGroups: ['chest', 'back', 'legs'],
    workoutType: 'STRENGTH',
    exercises: [
      {
        id: 'ex-1',
        name: 'Bench Press',
        sets: 3,
        reps: '10',
        restSeconds: 90,
        muscleGroup: 'chest',
        order: 1,
        isCompleted: false,
      },
    ],
    isCompleted: false,
    isAiGenerated: true,
  };

  const mockWeeklySchedule: WeeklySchedule = {
    weekStart: '2026-01-06',
    weekEnd: '2026-01-12',
    schedule: {
      Monday: [mockWorkout],
    },
    totalWorkouts: 5,
    completedWorkouts: 2,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrainingService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TrainingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('State Management', () => {
    it('should have initial null weekly schedule', () => {
      expect(service.weeklySchedule()).toBeNull();
    });

    it('should have initial false generating state', () => {
      expect(service.isGenerating()).toBeFalse();
    });

    it('should have initial null current workout', () => {
      expect(service.currentWorkout()).toBeNull();
    });
  });

  describe('HTTP Methods (inherited from BaseHttpService)', () => {
    it('should make GET requests', () => {
      service.get<WorkoutProgress>('/training/progress').subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/training/progress`);
      expect(req.request.method).toBe('GET');
      req.flush({ userId: '1', totalWorkouts: 10, completedExercises: 50, streak: 5 });
    });

    it('should make POST requests', () => {
      const newWorkout = { name: 'Test Workout' };

      service.post<GeneratedWorkout>('/training/workouts', newWorkout).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/training/workouts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newWorkout);
      req.flush(mockWorkout);
    });

    it('should handle error responses after retries', (done) => {
      service.get('/training/invalid').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      // BaseHttpService uses retry(2), so we need to handle 3 requests total
      const requests = httpMock.match(`${environment.apiUrl}/training/invalid`);
      expect(requests.length).toBe(1);
      requests[0].flush('Not Found', { status: 404, statusText: 'Not Found' });

      // Handle the 2 retries
      setTimeout(() => {
        const retry1 = httpMock.match(`${environment.apiUrl}/training/invalid`);
        if (retry1.length > 0) {
          retry1[0].flush('Not Found', { status: 404, statusText: 'Not Found' });
        }
        setTimeout(() => {
          const retry2 = httpMock.match(`${environment.apiUrl}/training/invalid`);
          if (retry2.length > 0) {
            retry2[0].flush('Not Found', { status: 404, statusText: 'Not Found' });
          }
        }, 10);
      }, 10);
    });
  });
});
