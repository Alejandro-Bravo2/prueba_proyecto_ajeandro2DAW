import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function nifValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nif = control.value;
    if (!nif) {
      return null;
    }
    const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZS]{1}$/i;
    if (!nifRegex.test(nif)) {
      return { nifInvalid: true };
    }
    const letter = nif.charAt(8).toUpperCase();
    const number = parseInt(nif.substring(0, 8), 10);
    const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    if (validLetters.charAt(number % 23) === letter) {
      return null;
    }
    return { nifInvalid: true };
  };
}

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const phone = control.value;
    if (!phone) {
      return null;
    }
    const phoneRegex = /^[6789]\d{8}$/; // Spanish phone numbers start with 6, 7, 8 or 9 and have 9 digits
    return phoneRegex.test(phone) ? null : { phoneInvalid: true };
  };
}

export function postalCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const postalCode = control.value;
    if (!postalCode) {
      return null;
    }
    const postalCodeRegex = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/; // Spanish postal codes are 5 digits
    return postalCodeRegex.test(postalCode) ? null : { postalCodeInvalid: true };
  };
}
