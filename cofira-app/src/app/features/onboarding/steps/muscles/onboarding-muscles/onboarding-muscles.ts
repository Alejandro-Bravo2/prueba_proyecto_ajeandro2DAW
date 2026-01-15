import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../services/onboarding.service';
import { atLeastOneSelectedValidator } from '../../../../../shared/validators/form-array.validators';

@Component({
  selector: 'app-onboarding-muscles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-muscles.html',
  styleUrl: './onboarding-muscles.scss',
})
export class OnboardingMuscles {
  musclesForm = new FormGroup({
    muscles: new FormArray<FormControl>([], [atLeastOneSelectedValidator()]),
  });

  muscleOptions = [
    { value: 'pecho', label: 'Pecho' },
    { value: 'espalda', label: 'Espalda' },
    { value: 'brazos', label: 'Brazos' },
    { value: 'pierna', label: 'Pierna' },
    { value: 'hombros', label: 'Hombros' },
    { value: 'abdominales', label: 'Abdominales' },
  ];

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {
    // Initialize the FormArray with a control for each option, set to false
    this.muscleOptions.forEach(() => {
      this.musclesForm.controls.muscles.push(new FormControl(false));
    });
  }

  onSubmit(): void {
    const selectedMuscles = this.musclesForm.value.muscles
      ?.map((checked, i) => (checked ? this.muscleOptions[i].value : null))
      .filter(value => value !== null);

    if (selectedMuscles && selectedMuscles.length > 0) {
      this.onboardingService.onboardingData.update((data: any) => ({
        ...data,
        muscles: selectedMuscles,
      }));
      console.log('Onboarding Muscles form submitted:', selectedMuscles);
      console.log('Onboarding complete! Navigating to dashboard...');
      // this.router.navigate(['/dashboard']); // Redirect to dashboard
    } else {
      console.log('Form is invalid: No muscles selected');
      // Optionally mark touched to show error if no muscles are selected
    }
  }

  // Helper to get the FormArray as a FormArray of FormControls
  get musclesFormArray(): FormArray {
    return this.musclesForm.controls.muscles as FormArray;
  }

  // Helper to check if no muscles are selected
  get hasSelectedMuscles(): boolean {
    const muscles = this.musclesForm.value.muscles || [];
    return muscles.some(m => m === true);
  }
}
