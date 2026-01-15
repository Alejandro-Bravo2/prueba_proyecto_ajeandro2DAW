import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingContainer } from './onboarding-container';

describe('OnboardingContainer', () => {
  let component: OnboardingContainer;
  let fixture: ComponentFixture<OnboardingContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingContainer],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
