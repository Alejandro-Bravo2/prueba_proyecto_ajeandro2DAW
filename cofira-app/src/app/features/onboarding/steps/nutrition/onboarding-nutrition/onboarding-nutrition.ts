import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-nutrition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-nutrition.html',
  styleUrl: './onboarding-nutrition.scss',
})
export class OnboardingNutrition {
  private readonly onboardingService = inject(OnboardingService);

  nutritionForm = new FormGroup({
    variety: new FormControl('', [Validators.required]),
  });

  varietyOptions = [
    { value: 'mucho', label: 'Mucha variedad' },
    { value: 'frecuente', label: 'Variedad frecuente' },
    { value: 'poco', label: 'Poca variedad' },
  ];

  onSubmit(): void {
    if (this.nutritionForm.valid) {
      this.onboardingService.onboardingData.update((data) => ({
        ...data,
        ...this.nutritionForm.value,
      }));
      // Navegar al siguiente paso del onboarding
      // this.router.navigate(['/onboarding/goal']);
    } else {
      this.nutritionForm.markAllAsTouched();
    }
  }

  selectVariety(variety: string): void {
    this.nutritionForm.get('variety')?.setValue(variety);
  }
}
