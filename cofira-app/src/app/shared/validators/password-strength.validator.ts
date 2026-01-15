import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
    const isLongEnough = value.length >= 12; // 12+ chars as per AC

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial && isLongEnough;

    return !passwordValid ? { passwordStrength: true } : null;
  };
}
