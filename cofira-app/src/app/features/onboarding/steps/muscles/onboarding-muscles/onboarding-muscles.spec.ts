import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingMuscles } from './onboarding-muscles';

describe('OnboardingMuscles', () => {
  let component: OnboardingMuscles;
  let fixture: ComponentFixture<OnboardingMuscles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingMuscles],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingMuscles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
