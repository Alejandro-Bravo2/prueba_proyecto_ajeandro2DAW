import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProgressCard } from './progress-card';
import { WorkoutProgress } from '../../services/training.service';

describe('ProgressCard', () => {
  let component: ProgressCard;
  let fixture: ComponentFixture<ProgressCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have null workout progress by default', () => {
    expect(component.workoutProgress()).toBeNull();
  });

  it('should display workout progress when provided', () => {
    const mockProgress: WorkoutProgress = {
      userId: 'user-1',
      totalWorkouts: 10,
      completedExercises: 50,
      streak: 5,
      lastWorkout: '2026-01-12',
    };
    fixture.componentRef.setInput('workoutProgress', mockProgress);
    fixture.detectChanges();

    expect(component.workoutProgress()).toBeTruthy();
    expect(component.workoutProgress()?.streak).toBe(5);
    expect(component.workoutProgress()?.totalWorkouts).toBe(10);
  });
});
