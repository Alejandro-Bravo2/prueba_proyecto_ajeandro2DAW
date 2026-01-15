import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador que verifica que un FormArray tenga un número mínimo de elementos
 *
 * @param min - Número mínimo de elementos requeridos
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   foods: this.fb.array([], [minArrayLengthValidator(1)])
 * });
 * ```
 */
export function minArrayLengthValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    return control.length < min
      ? {
          minArrayLength: {
            required: min,
            actual: control.length
          }
        }
      : null;
  };
}

/**
 * Validador que verifica que un FormArray tenga un número máximo de elementos
 *
 * @param max - Número máximo de elementos permitidos
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   tags: this.fb.array([], [maxArrayLengthValidator(10)])
 * });
 * ```
 */
export function maxArrayLengthValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    return control.length > max
      ? {
          maxArrayLength: {
            required: max,
            actual: control.length
          }
        }
      : null;
  };
}

/**
 * Validador que verifica que al menos un elemento de un FormArray esté seleccionado (true)
 * Útil para checkboxes múltiples
 *
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   muscles: this.fb.array([
 *     this.fb.control(false),
 *     this.fb.control(false)
 *   ], [atLeastOneSelectedValidator()])
 * });
 * ```
 */
export function atLeastOneSelectedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const hasSelected = control.controls.some(ctrl => ctrl.value === true);
    return hasSelected ? null : { atLeastOneRequired: true };
  };
}

/**
 * Validador que verifica que al menos N elementos de un FormArray estén seleccionados
 *
 * @param min - Número mínimo de elementos que deben estar seleccionados
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   preferences: this.fb.array([
 *     this.fb.control(false),
 *     this.fb.control(false),
 *     this.fb.control(false)
 *   ], [minSelectedValidator(2)])
 * });
 * ```
 */
export function minSelectedValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const selectedCount = control.controls.filter(ctrl => ctrl.value === true).length;

    return selectedCount < min
      ? {
          minSelected: {
            required: min,
            actual: selectedCount
          }
        }
      : null;
  };
}

/**
 * Validador que verifica que un FormArray no tenga valores duplicados
 *
 * @param compareKey - Clave opcional para comparar objetos (si los elementos son objetos)
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * // Para arrays simples
 * this.form = this.fb.group({
 *   emails: this.fb.array([], [uniqueArrayValuesValidator()])
 * });
 *
 * // Para arrays de objetos
 * this.form = this.fb.group({
 *   users: this.fb.array([], [uniqueArrayValuesValidator('email')])
 * });
 * ```
 */
export function uniqueArrayValuesValidator(compareKey?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const values = control.controls.map(ctrl => {
      const value = ctrl.value;
      return compareKey && typeof value === 'object' ? value[compareKey] : value;
    });

    const hasDuplicates = values.some((value, index) => {
      return value !== null && value !== undefined && value !== '' && values.indexOf(value) !== index;
    });

    return hasDuplicates ? { duplicateValues: true } : null;
  };
}

/**
 * Validador que verifica que todos los elementos de un FormArray sean válidos
 * Útil cuando necesitas verificar la validez de todos los controles hijos
 *
 * @returns ValidatorFn
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   items: this.fb.array([], [allItemsValidValidator()])
 * });
 * ```
 */
export function allItemsValidValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const hasInvalidItems = control.controls.some(ctrl => ctrl.invalid);
    return hasInvalidItems ? { allItemsValid: false } : null;
  };
}
