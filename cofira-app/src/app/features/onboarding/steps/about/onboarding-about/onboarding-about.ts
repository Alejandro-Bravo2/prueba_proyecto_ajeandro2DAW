import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-about',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-about.html',
  styleUrl: './onboarding-about.scss',
})
export class OnboardingAbout {
  private readonly onboardingService = inject(OnboardingService);

  aboutForm = new FormGroup({
    gender: new FormControl('', [Validators.required]),
    height: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
  });

  heightOptions = Array.from({ length: (200 - 150) / 5 + 1 }, (_, i) => 150 + i * 5);
  ageOptions = Array.from({ length: 100 - 18 + 1 }, (_, i) => 18 + i);

  onSubmit(): void {
    if (this.aboutForm.valid) {
      const formValue = this.aboutForm.value;
      const data = {
        gender: formValue.gender!,
        height: Number(formValue.height!),
        age: Number(formValue.age!)
      };
      this.onboardingService.updateAboutData(data);
      // Navegar al siguiente paso del onboarding
      // this.router.navigate(['/onboarding/nutrition']);
    } else {
      this.aboutForm.markAllAsTouched();
    }
  }

  selectGender(gender: string): void {
    this.aboutForm.get('gender')?.setValue(gender);
  }
}
