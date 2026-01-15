import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingPricing } from './onboarding-pricing';

describe('OnboardingPricing', () => {
  let component: OnboardingPricing;
  let fixture: ComponentFixture<OnboardingPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingPricing],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPricing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
