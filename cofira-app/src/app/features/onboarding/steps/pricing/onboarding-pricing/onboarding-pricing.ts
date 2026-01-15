import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-pricing.html',
  styleUrl: './onboarding-pricing.scss',
})
export class OnboardingPricing {
  private readonly onboardingService = inject(OnboardingService);

  pricingForm = new FormGroup({
    priceRange: new FormControl('', [Validators.required]),
  });

  priceRangeOptions = [
    { value: '0-10', label: '0-10€' },
    { value: '10-15', label: '10-15€' },
    { value: '15-20', label: '15-20€' },
  ];

  onSubmit(): void {
    if (this.pricingForm.valid) {
      this.onboardingService.onboardingData.update((data) => ({
        ...data,
        ...this.pricingForm.value,
      }));
      // Navegar al siguiente paso del onboarding
      // this.router.navigate(['/onboarding/muscles']);
    } else {
      this.pricingForm.markAllAsTouched();
    }
  }

  selectPriceRange(range: string): void {
    this.pricingForm.get('priceRange')?.setValue(range);
  }
}
