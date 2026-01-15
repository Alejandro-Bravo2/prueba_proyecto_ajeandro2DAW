import { Injectable, signal } from '@angular/core';

interface OnboardingData {
  gender: string;
  height: number;
  age: number;
  // Add more fields for subsequent steps
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  onboardingData = signal<OnboardingData>({
    gender: '',
    height: 0,
    age: 0,
  });

  constructor() { }

  updateAboutData(data: { gender: string, height: number, age: number }): void {
    this.onboardingData.update(currentData => ({
      ...currentData,
      ...data,
    }));
    console.log('Onboarding data updated:', this.onboardingData());
  }

  // Placeholder methods for other steps
}
