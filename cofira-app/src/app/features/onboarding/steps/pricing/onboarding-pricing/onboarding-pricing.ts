import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-pricing.html',
  styleUrl: './onboarding-pricing.scss',
})
export class OnboardingPricing {
  pricingForm = new FormGroup({
    priceRange: new FormControl('', [Validators.required]),
  });

  priceRangeOptions = [
    { value: '0-10', label: '0-10€' },
    { value: '10-15', label: '10-15€' },
    { value: '15-20', label: '15-20€' },
  ];

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.pricingForm.valid) {
      this.onboardingService.onboardingData.update((data: any) => ({
        ...data,
        ...this.pricingForm.value,
      }));
      console.log('Onboarding Pricing form submitted:', this.pricingForm.value);
      console.log('Navigating to next onboarding step...');
      // this.router.navigate(['/onboarding/muscles']);
    } else {
      this.pricingForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  selectPriceRange(range: string): void {
    this.pricingForm.get('priceRange')?.setValue(range);
  }
}
