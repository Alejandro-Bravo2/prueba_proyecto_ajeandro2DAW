import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador que verifica que un valor numérico esté dentro de un rango
 *
 * @param min - Valor mínimo permitido
 * @param max - Valor máximo permitido
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   age: ['', [Validators.required, rangeValidator(18, 100)]],
 *   weight: ['', [Validators.required, rangeValidator(30, 300)]]
 * });
 * ```
 */
export function rangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null; // No validar si está vacío
    }

    const value = Number(control.value);

    // Verificar que sea un número válido
    if (isNaN(value)) {
      return { notANumber: true };
    }

    if (value < min || value > max) {
      return {
        range: {
          min,
          max,
          actual: value
        }
      };
    }

    return null;
  };
}

/**
 * Validador que verifica que un valor sea un número positivo
 *
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   price: ['', [Validators.required, positiveNumberValidator()]]
 * });
 * ```
 */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const value = Number(control.value);

    if (isNaN(value)) {
      return { notANumber: true };
    }

    return value <= 0 ? { positiveNumber: true } : null;
  };
}

/**
 * Validador que verifica que un valor sea un número entero
 *
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   quantity: ['', [Validators.required, integerValidator()]]
 * });
 * ```
 */
export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const value = Number(control.value);

    if (isNaN(value)) {
      return { notANumber: true };
    }

    return !Number.isInteger(value) ? { integer: true } : null;
  };
}

/**
 * Validador que verifica que un valor sea un porcentaje válido (0-100)
 *
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   progress: ['', [Validators.required, percentageValidator()]]
 * });
 * ```
 */
export function percentageValidator(): ValidatorFn {
  return rangeValidator(0, 100);
}

/**
 * Validador que verifica que un valor tenga un número específico de decimales
 *
 * @param maxDecimals - Número máximo de decimales permitidos
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   price: ['', [Validators.required, maxDecimalsValidator(2)]]
 * });
 * ```
 */
export function maxDecimalsValidator(maxDecimals: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const value = String(control.value);
    const parts = value.split('.');

    if (parts.length === 2 && parts[1].length > maxDecimals) {
      return {
        maxDecimals: {
          required: maxDecimals,
          actual: parts[1].length
        }
      };
    }

    return null;
  };
}
