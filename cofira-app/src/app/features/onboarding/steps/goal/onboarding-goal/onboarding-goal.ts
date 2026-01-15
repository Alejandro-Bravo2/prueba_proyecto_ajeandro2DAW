import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-goal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-goal.html',
  styleUrl: './onboarding-goal.scss',
})
export class OnboardingGoal {
  goalForm = new FormGroup({
    goal: new FormControl('', [Validators.required]),
  });

  goalOptions = [
    { value: 'masa_muscular', label: 'Ganar masa muscular' },
    { value: 'perder_grasa', label: 'Perder grasa' },
    { value: 'mantenerse', label: 'Mantenerse estable' },
  ];

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.goalForm.valid) {
      this.onboardingService.onboardingData.update((data: any) => ({
        ...data,
        ...this.goalForm.value,
      }));
      console.log('Onboarding Goal form submitted:', this.goalForm.value);
      console.log('Navigating to next onboarding step...');
      // this.router.navigate(['/onboarding/pricing']);
    } else {
      this.goalForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  selectGoal(goal: string): void {
    this.goalForm.get('goal')?.setValue(goal);
  }
}
