import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingAbout } from './onboarding-about';

describe('OnboardingAbout', () => {
  let component: OnboardingAbout;
  let fixture: ComponentFixture<OnboardingAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingAbout],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingAbout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
