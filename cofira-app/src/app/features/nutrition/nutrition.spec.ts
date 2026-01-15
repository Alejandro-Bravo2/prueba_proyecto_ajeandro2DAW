import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { Nutrition } from './nutrition';

describe('Nutrition', () => {
  let component: Nutrition;
  let fixture: ComponentFixture<Nutrition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nutrition],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Nutrition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dashboard view', () => {
    expect(component.activeView()).toBe('dashboard');
  });

  it('should initialize with current date', () => {
    expect(component.currentDate()).toBeTruthy();
    expect(typeof component.currentDate()).toBe('string');
  });

  it('should start with no daily nutrition data', () => {
    expect(component.dailyNutrition()).toBeNull();
  });

  it('should have loading state initially false', () => {
    expect(component.isLoading()).toBeFalse();
  });

  it('should have no error initially', () => {
    expect(component.error()).toBeNull();
  });

  it('should have isEmpty computed correctly', () => {
    // When no data and not loading
    expect(component.isEmpty()).toBeTrue();
  });

  it('should have hasMeals computed correctly', () => {
    // With no nutrition data
    expect(component.hasMeals()).toBeFalsy();
  });

  it('should switch between views', () => {
    component.activeView.set('meals');
    expect(component.activeView()).toBe('meals');

    component.activeView.set('dashboard');
    expect(component.activeView()).toBe('dashboard');
  });
});
