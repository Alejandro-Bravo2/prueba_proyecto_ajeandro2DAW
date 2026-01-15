import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingNutrition } from './onboarding-nutrition';

describe('OnboardingNutrition', () => {
  let component: OnboardingNutrition;
  let fixture: ComponentFixture<OnboardingNutrition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingNutrition],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingNutrition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
