import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-nutrition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-nutrition.html',
  styleUrl: './onboarding-nutrition.scss',
})
export class OnboardingNutrition {
  nutritionForm = new FormGroup({
    variety: new FormControl('', [Validators.required]),
  });

  varietyOptions = [
    { value: 'mucho', label: 'Mucha variedad' },
    { value: 'frecuente', label: 'Variedad frecuente' },
    { value: 'poco', label: 'Poca variedad' },
  ];

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.nutritionForm.valid) {
      this.onboardingService.onboardingData.update((data: any) => ({
        ...data,
        ...this.nutritionForm.value,
      }));
      console.log('Onboarding Nutrition form submitted:', this.nutritionForm.value);
      console.log('Navigating to next onboarding step...');
      // this.router.navigate(['/onboarding/goal']);
    } else {
      this.nutritionForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  selectVariety(variety: string): void {
    this.nutritionForm.get('variety')?.setValue(variety);
  }
}
