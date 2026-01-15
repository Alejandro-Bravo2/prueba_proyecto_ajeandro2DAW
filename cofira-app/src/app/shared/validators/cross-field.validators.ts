import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(
  controlName: string,
  matchingControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    // Only check if both fields have values
    if (!control.value || !matchingControl.value) {
      return null;
    }

    // Check if passwords match
    if (control.value !== matchingControl.value) {
      return { passwordMatch: true };
    }

    return null;
  };
}
