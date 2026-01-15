import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingGoal } from './onboarding-goal';

describe('OnboardingGoal', () => {
  let component: OnboardingGoal;
  let fixture: ComponentFixture<OnboardingGoal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingGoal],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingGoal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
