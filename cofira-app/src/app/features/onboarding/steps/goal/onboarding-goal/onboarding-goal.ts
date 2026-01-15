import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-goal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-goal.html',
  styleUrl: './onboarding-goal.scss',
})
export class OnboardingGoal {
  private readonly onboardingService = inject(OnboardingService);

  goalForm = new FormGroup({
    goal: new FormControl('', [Validators.required]),
  });

  goalOptions = [
    { value: 'masa_muscular', label: 'Ganar masa muscular' },
    { value: 'perder_grasa', label: 'Perder grasa' },
    { value: 'mantenerse', label: 'Mantenerse estable' },
  ];

  onSubmit(): void {
    if (this.goalForm.valid) {
      this.onboardingService.onboardingData.update((data) => ({
        ...data,
        ...this.goalForm.value,
      }));
      // Navegar al siguiente paso del onboarding
      // this.router.navigate(['/onboarding/pricing']);
    } else {
      this.goalForm.markAllAsTouched();
    }
  }

  selectGoal(goal: string): void {
    this.goalForm.get('goal')?.setValue(goal);
  }
}
