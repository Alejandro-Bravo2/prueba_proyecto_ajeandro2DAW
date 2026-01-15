import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador que verifica que una fecha no sea anterior a hoy
 *
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   eventDate: ['', [Validators.required, futureDateValidator()]]
 * });
 * ```
 */
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // No validar si está vacío (usar Validators.required para eso)
    }

    const inputDate = new Date(control.value);
    const today = new Date();

    // Resetear horas para comparar solo fechas
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate < today ? { pastDate: true } : null;
  };
}

/**
 * Validador que verifica que una fecha esté dentro de un rango
 *
 * @param minDate - Fecha mínima permitida (opcional)
 * @param maxDate - Fecha máxima permitida (opcional)
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * const minDate = new Date('2025-01-01');
 * const maxDate = new Date('2025-12-31');
 *
 * this.form = this.fb.group({
 *   appointmentDate: ['', [
 *     Validators.required,
 *     dateRangeValidator(minDate, maxDate)
 *   ]]
 * });
 * ```
 */
export function dateRangeValidator(minDate?: Date, maxDate?: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const date = new Date(control.value);

    // Resetear horas para comparar solo fechas
    date.setHours(0, 0, 0, 0);

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);

      if (date < min) {
        return {
          minDate: {
            minDate: minDate.toISOString().split('T')[0],
            actual: control.value
          }
        };
      }
    }

    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);

      if (date > max) {
        return {
          maxDate: {
            maxDate: maxDate.toISOString().split('T')[0],
            actual: control.value
          }
        };
      }
    }

    return null;
  };
}

/**
 * Validador que verifica que una fecha sea anterior a hoy (para fechas de nacimiento, etc.)
 *
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   birthDate: ['', [Validators.required, pastDateValidator()]]
 * });
 * ```
 */
export function pastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const today = new Date();

    // Resetear horas para comparar solo fechas
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate > today ? { futureDate: true } : null;
  };
}

/**
 * Validador que verifica que una fecha tenga una edad mínima
 *
 * @param minAge - Edad mínima requerida
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   birthDate: ['', [Validators.required, minAgeValidator(18)]]
 * });
 * ```
 */
export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < minAge
      ? { minAge: { required: minAge, actual: age } }
      : null;
  };
}
