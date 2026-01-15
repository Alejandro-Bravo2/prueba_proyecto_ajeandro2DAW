import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

/**
 * Tipo para el valor de un error de validación con propiedades conocidas
 * Los errores de Angular pueden contener diferentes propiedades según el validador
 */
interface ValidationErrorObject {
  requiredLength?: number;
  actualLength?: number;
  min?: number;
  max?: number;
  minDate?: string | Date;
  maxDate?: string | Date;
  required?: number;
  actual?: number;
}

/**
 * Tipo union para valores de error de validación
 */
type ValidationErrorValue = ValidationErrorObject | boolean | string | number;


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
  private readonly errorMessages: Record<string, string | ((value: ValidationErrorValue) => string)> = {
    // Validadores de Angular built-in
    required: 'Este campo es obligatorio',
    email: 'El formato del email no es válido',
    minlength: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `Debe tener al menos ${errorObj.requiredLength} caracteres (actual: ${errorObj.actualLength})`;
    },
    maxlength: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `No puede tener más de ${errorObj.requiredLength} caracteres (actual: ${errorObj.actualLength})`;
    },
    min: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `El valor mínimo permitido es ${errorObj.min}`;
    },
    max: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `El valor máximo permitido es ${errorObj.max}`;
    },
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
    minDate: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `La fecha no puede ser anterior a ${this.formatDate(errorObj.minDate ?? new Date())}`;
    },
    maxDate: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `La fecha no puede ser posterior a ${this.formatDate(errorObj.maxDate ?? new Date())}`;
    },
    minAge: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `Debes tener al menos ${errorObj.required} años (tienes ${errorObj.actual} años)`;
    },

    // Validadores de rango
    range: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `El valor debe estar entre ${errorObj.min} y ${errorObj.max}`;
    },
    positiveNumber: 'El valor debe ser un número positivo',
    integer: 'El valor debe ser un número entero',
    notANumber: 'El valor debe ser un número',
    maxDecimals: (val) => {
      const errorObj = val as ValidationErrorObject;
      return `No puede tener más de ${errorObj.required} decimales`;
    },

    // Validadores de FormArray
    minArrayLength: (val) => {
      const errorObj = val as ValidationErrorObject;
      const count = errorObj.required ?? 1;
      return `Debes agregar al menos ${count} elemento${count > 1 ? 's' : ''}`;
    },
    maxArrayLength: (val) => {
      const errorObj = val as ValidationErrorObject;
      const count = errorObj.required ?? 1;
      return `No puedes agregar más de ${count} elemento${count > 1 ? 's' : ''}`;
    },
    atLeastOneRequired: 'Debes seleccionar al menos una opción',
    minSelected: (val) => {
      const errorObj = val as ValidationErrorObject;
      const count = errorObj.required ?? 1;
      return `Debes seleccionar al menos ${count} opción${count > 1 ? 'es' : ''}`;
    },
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
  getErrorMessage(errorKey: string, errorValue?: ValidationErrorValue): string {
    const message = this.errorMessages[errorKey];

    if (!message) {
      console.warn(`FormErrorMessagesService: No message found for error key "${errorKey}"`);
      return this.errorMessages['unknown'] as string;
    }

    if (typeof message === 'function') {
      const defaultValue: ValidationErrorObject = {};
      return message(errorValue ?? defaultValue);
    }

    return message;
  }

  /**
   * Obtiene todos los mensajes de error para un control de formulario
   *
   * @param errors - El objeto de errores del FormControl
   * @returns Array de mensajes de error
   */
  getAllErrorMessages(errors: ValidationErrors | null): string[] {
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
  getFirstErrorMessage(errors: ValidationErrors | null): string {
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
  hasError(errors: ValidationErrors | null, errorKey: string): boolean {
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
  addCustomMessage(key: string, message: string | ((value: ValidationErrorValue) => string)): void {
    this.errorMessages[key] = message;
  }
}
