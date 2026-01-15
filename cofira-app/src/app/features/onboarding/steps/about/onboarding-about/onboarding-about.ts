import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router
import { OnboardingService } from '../../../services/onboarding.service'; // Import OnboardingService

@Component({
  selector: 'app-onboarding-about',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-about.html',
  styleUrl: './onboarding-about.scss',
})
export class OnboardingAbout {
  aboutForm = new FormGroup({
    gender: new FormControl('', [Validators.required]),
    height: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
  });

  heightOptions = Array.from({ length: (200 - 150) / 5 + 1 }, (_, i) => 150 + i * 5);
  ageOptions = Array.from({ length: 100 - 18 + 1 }, (_, i) => 18 + i);

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.aboutForm.valid) {
      const formValue = this.aboutForm.value;
      const data = {
        gender: formValue.gender!,
        height: Number(formValue.height!),
        age: Number(formValue.age!)
      };
      this.onboardingService.updateAboutData(data);
      console.log('Navigating to next onboarding step...');
      // In a real app, navigate to the next onboarding step
      // this.router.navigate(['/onboarding/nutrition']);
    } else {
      this.aboutForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  selectGender(gender: string): void {
    this.aboutForm.get('gender')?.setValue(gender);
  }
}
