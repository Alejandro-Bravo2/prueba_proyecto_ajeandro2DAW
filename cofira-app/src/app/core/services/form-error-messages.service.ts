import { Injectable } from '@angular/core';

/**
 * Servicio centralizado para gestionar mensajes de error de formularios
 *
 * @example
 * ```typescript
 * export class MyComponent {
 *   private errorService = inject(FormErrorMessagesService);
 *
 *   getErrorMessage(control: FormControl): string {
 *     const errors = control.errors;
 *     if (!errors) return '';
 *
 *     const errorKey = Object.keys(errors)[0];
 *     return this.errorService.getErrorMessage(errorKey, errors[errorKey]);
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class FormErrorMessagesService {
  /**
   * Mapa de mensajes de error
   * Puede ser una cadena estática o una función que genera el mensaje
   */
  private readonly errorMessages: Record<string, string | ((value: any) => string)> = {
    // Validadores de Angular built-in
    required: 'Este campo es obligatorio',
    email: 'El formato del email no es válido',
    minlength: (val) => `Debe tener al menos ${val.requiredLength} caracteres (actual: ${val.actualLength})`,
    maxlength: (val) => `No puede tener más de ${val.requiredLength} caracteres (actual: ${val.actualLength})`,
    min: (val) => `El valor mínimo permitido es ${val.min}`,
    max: (val) => `El valor máximo permitido es ${val.max}`,
    pattern: 'El formato no es válido',

    // Validadores personalizados de contraseña
    passwordStrength: 'La contraseña debe tener al menos 12 caracteres, incluir mayúsculas, minúsculas, números y símbolos especiales',
    passwordMatch: 'Las contraseñas no coinciden',

    // Validadores asíncronos
    emailTaken: 'Este email ya está registrado',
    usernameTaken: 'Este nombre de usuario ya está en uso',

    // Validadores de formato español
    phoneInvalid: 'El teléfono debe tener 9 dígitos y comenzar con 6, 7, 8 o 9',
    nifInvalid: 'El NIF no es válido. Debe tener 8 dígitos seguidos de una letra',
    postalCodeInvalid: 'El código postal debe tener 5 dígitos',

    // Validadores de fecha
    pastDate: 'La fecha no puede ser anterior a hoy',
    futureDate: 'La fecha no puede ser posterior a hoy',
    minDate: (val) => `La fecha no puede ser anterior a ${this.formatDate(val.minDate)}`,
    maxDate: (val) => `La fecha no puede ser posterior a ${this.formatDate(val.maxDate)}`,
    minAge: (val) => `Debes tener al menos ${val.required} años (tienes ${val.actual} años)`,

    // Validadores de rango
    range: (val) => `El valor debe estar entre ${val.min} y ${val.max}`,
    positiveNumber: 'El valor debe ser un número positivo',
    integer: 'El valor debe ser un número entero',
    notANumber: 'El valor debe ser un número',
    maxDecimals: (val) => `No puede tener más de ${val.required} decimales`,

    // Validadores de FormArray
    minArrayLength: (val) => `Debes agregar al menos ${val.required} elemento${val.required > 1 ? 's' : ''}`,
    maxArrayLength: (val) => `No puedes agregar más de ${val.required} elemento${val.required > 1 ? 's' : ''}`,
    atLeastOneRequired: 'Debes seleccionar al menos una opción',
    minSelected: (val) => `Debes seleccionar al menos ${val.required} opción${val.required > 1 ? 'es' : ''}`,
    duplicateValues: 'No se permiten valores duplicados',
    allItemsValid: 'Algunos elementos tienen errores. Por favor, revísalos',

    // Validadores URL y formato
    url: 'La URL no es válida',

    // Mensaje genérico
    unknown: 'El valor ingresado no es válido'
  };

  /**
   * Obtiene el mensaje de error correspondiente a una clave de error
   *
   * @param errorKey - La clave del error (ej: 'required', 'email', 'minlength')
   * @param errorValue - El valor del error (puede contener metadata adicional)
   * @returns El mensaje de error formateado
   */
  getErrorMessage(errorKey: string, errorValue?: any): string {
    const message = this.errorMessages[errorKey];

    if (!message) {
      console.warn(`FormErrorMessagesService: No message found for error key "${errorKey}"`);
      return this.errorMessages['unknown'] as string;
    }

    return typeof message === 'function' ? message(errorValue) : message;
  }

  /**
   * Obtiene todos los mensajes de error para un control de formulario
   *
   * @param errors - El objeto de errores del FormControl
   * @returns Array de mensajes de error
   */
  getAllErrorMessages(errors: Record<string, any> | null): string[] {
    if (!errors) return [];

    return Object.keys(errors).map(key =>
      this.getErrorMessage(key, errors[key])
    );
  }

  /**
   * Obtiene el primer mensaje de error para un control de formulario
   *
   * @param errors - El objeto de errores del FormControl
   * @returns El primer mensaje de error o cadena vacía
   */
  getFirstErrorMessage(errors: Record<string, any> | null): string {
    if (!errors || Object.keys(errors).length === 0) {
      return '';
    }

    const firstErrorKey = Object.keys(errors)[0];
    return this.getErrorMessage(firstErrorKey, errors[firstErrorKey]);
  }

  /**
   * Verifica si un error específico existe en el objeto de errores
   *
   * @param errors - El objeto de errores del FormControl
   * @param errorKey - La clave del error a verificar
   * @returns true si el error existe
   */
  hasError(errors: Record<string, any> | null, errorKey: string): boolean {
    return errors !== null && errors[errorKey] !== undefined;
  }

  /**
   * Formatea una fecha en formato legible en español
   *
   * @param date - La fecha a formatear (string o Date)
   * @returns Fecha formateada
   */
  private formatDate(date: string | Date): string {
    if (!date) return '';

    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return d.toLocaleDateString('es-ES', options);
  }

  /**
   * Permite añadir o sobrescribir mensajes de error personalizados
   *
   * @param key - La clave del error
   * @param message - El mensaje o función generadora de mensaje
   *
   * @example
   * ```typescript
   * errorService.addCustomMessage('customError', 'Este es un error personalizado');
   * errorService.addCustomMessage('rangeError', (val) => `Fuera de rango: ${val.min}-${val.max}`);
   * ```
   */
  addCustomMessage(key: string, message: string | ((value: any) => string)): void {
    this.errorMessages[key] = message;
  }
}
