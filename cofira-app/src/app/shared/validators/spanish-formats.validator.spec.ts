import { FormControl, FormGroup, Validators } from '@angular/forms';
import { nifValidator, phoneValidator, postalCodeValidator } from './spanish-formats.validator';

describe('nifValidator', () => {
  describe('Valid NIFs', () => {
    it('should return null for a valid NIF', () => {
      const control = new FormControl('12345678Z');
      expect(nifValidator()(control)).toBeNull();
    });

    it('should accept valid NIFs with lowercase letters', () => {
      const control = new FormControl('12345678z');
      expect(nifValidator()(control)).toBeNull();
    });

    it('should accept multiple valid NIFs', () => {
      // Tabla: TRWAGMYFPDXBNJZSQVHLCKE (0=T, 1=R, 2=W, etc.)
      // 00000000 % 23 = 0 -> T ✓
      // 00000001 % 23 = 1 -> R ✓
      // 12345678 % 23 = 14 -> Z ✓
      // 99999999 % 23 = 1 -> R ✓
      const validNIFs = ['00000000T', '00000001R', '12345678Z', '99999999R'];

      validNIFs.forEach((nif) => {
        const control = new FormControl(nif);
        expect(nifValidator()(control)).toBeNull();
      });
    });

    it('should validate NIF letter calculation correctly', () => {
      // Test various numbers with their correct letters
      // Tabla: TRWAGMYFPDXBNJZSQVHLCKE
      const validPairs = [
        { number: '00000000', letter: 'T' }, // 0 % 23 = 0 -> T
        { number: '00000001', letter: 'R' }, // 1 % 23 = 1 -> R
        { number: '00000023', letter: 'T' }, // 23 % 23 = 0 -> T
        { number: '12345678', letter: 'Z' }, // 12345678 % 23 = 14 -> Z
      ];

      validPairs.forEach(({ number, letter }) => {
        const control = new FormControl(number + letter);
        expect(nifValidator()(control)).toBeNull();
      });
    });
  });

  describe('Invalid NIFs', () => {
    it('should return nifInvalid error for an invalid NIF format', () => {
      const control = new FormControl('1234567Z'); // Too short
      expect(nifValidator()(control)).toEqual({ nifInvalid: true });
    });

    it('should return nifInvalid error for an invalid NIF letter', () => {
      const control = new FormControl('12345678A'); // Incorrect letter for 12345678
      expect(nifValidator()(control)).toEqual({ nifInvalid: true });
    });

    it('should reject NIF with invalid format patterns', () => {
      const invalidNIFs = [
        'A2345678Z', // Letter at start
        '1234567ZZ', // Letter in wrong position
        '123456789', // No letter
        'ABCDEFGHZ', // All letters
        '12345-678Z', // Contains dash
        '12345 678Z', // Contains space
        '12.345.678Z', // Contains dots
      ];

      invalidNIFs.forEach((nif) => {
        const control = new FormControl(nif);
        expect(nifValidator()(control)).toEqual({ nifInvalid: true });
      });
    });

    it('should reject NIF with wrong check letter', () => {
      const control = new FormControl('12345678A'); // Should be Z
      expect(nifValidator()(control)).toEqual({ nifInvalid: true });
    });

    it('should reject NIF with invalid length', () => {
      const invalidLengths = [
        '1234567Z', // Too short
        '123456789Z', // Too long
        '12345Z', // Way too short
        '1234567890Z', // Way too long
      ];

      invalidLengths.forEach((nif) => {
        const control = new FormControl(nif);
        expect(nifValidator()(control)).toEqual({ nifInvalid: true });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(nifValidator()(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(nifValidator()(control)).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      expect(nifValidator()(control)).toBeNull();
    });

    it('should handle NIF with leading zeros', () => {
      const control = new FormControl('00000000T');
      expect(nifValidator()(control)).toBeNull();
    });
  });
});

describe('phoneValidator', () => {
  describe('Valid Phone Numbers', () => {
    it('should return null for a valid Spanish phone number starting with 6', () => {
      const control = new FormControl('612345678');
      expect(phoneValidator()(control)).toBeNull();
    });

    it('should accept phone numbers starting with 6, 7, 8, 9', () => {
      const validPhones = [
        '612345678', // Mobile
        '712345678', // Mobile
        '812345678', // Special services
        '912345678', // Landline
      ];

      validPhones.forEach((phone) => {
        const control = new FormControl(phone);
        expect(phoneValidator()(control)).toBeNull();
      });
    });

    it('should accept all valid mobile prefixes', () => {
      const mobilePrefixes = ['600', '610', '620', '630', '640', '650', '660', '670', '680', '690'];

      mobilePrefixes.forEach((prefix) => {
        const control = new FormControl(prefix + '123456');
        expect(phoneValidator()(control)).toBeNull();
      });
    });

    it('should accept valid landline numbers', () => {
      const landlines = ['910123456', '911234567', '912345678', '913456789'];

      landlines.forEach((phone) => {
        const control = new FormControl(phone);
        expect(phoneValidator()(control)).toBeNull();
      });
    });
  });

  describe('Invalid Phone Numbers', () => {
    it('should return phoneInvalid error for an invalid phone number format', () => {
      const control = new FormControl('123456789'); // Doesn't start with 6,7,8,9
      expect(phoneValidator()(control)).toEqual({ phoneInvalid: true });
    });

    it('should return phoneInvalid error for a phone number with incorrect length', () => {
      const control = new FormControl('61234567'); // Too short
      expect(phoneValidator()(control)).toEqual({ phoneInvalid: true });
    });

    it('should reject phone numbers with invalid prefixes', () => {
      const invalidPhones = [
        '012345678', // Starts with 0
        '112345678', // Starts with 1
        '212345678', // Starts with 2
        '312345678', // Starts with 3
        '412345678', // Starts with 4
        '512345678', // Starts with 5
      ];

      invalidPhones.forEach((phone) => {
        const control = new FormControl(phone);
        expect(phoneValidator()(control)).toEqual({ phoneInvalid: true });
      });
    });

    it('should reject phone numbers with invalid length', () => {
      const invalidLengths = [
        '6123', // Too short
        '612345', // Still too short
        '61234567', // 8 digits
        '6123456789', // 10 digits
        '61234567890', // 11 digits
      ];

      invalidLengths.forEach((phone) => {
        const control = new FormControl(phone);
        expect(phoneValidator()(control)).toEqual({ phoneInvalid: true });
      });
    });

    it('should reject phone numbers with non-numeric characters', () => {
      const invalidFormats = [
        '612-345-678',
        '612 345 678',
        '+34612345678',
        '(612)345678',
        '612.345.678',
        'abc123456',
      ];

      invalidFormats.forEach((phone) => {
        const control = new FormControl(phone);
        expect(phoneValidator()(control)).toEqual({ phoneInvalid: true });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(phoneValidator()(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(phoneValidator()(control)).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      expect(phoneValidator()(control)).toBeNull();
    });
  });
});

describe('postalCodeValidator', () => {
  describe('Valid Postal Codes', () => {
    it('should return null for a valid Spanish postal code', () => {
      const control = new FormControl('28001');
      expect(postalCodeValidator()(control)).toBeNull();
    });

    it('should accept postal codes from all Spanish provinces', () => {
      const validPostalCodes = [
        '01001', // Álava
        '08001', // Barcelona
        '28001', // Madrid
        '41001', // Sevilla
        '46001', // Valencia
        '48001', // Vizcaya
        '50001', // Zaragoza
        '52001', // Melilla
      ];

      validPostalCodes.forEach((code) => {
        const control = new FormControl(code);
        expect(postalCodeValidator()(control)).toBeNull();
      });
    });

    it('should accept postal codes at the boundaries', () => {
      const boundaryPostalCodes = [
        '01000', // Minimum valid
        '52999', // Maximum valid
      ];

      boundaryPostalCodes.forEach((code) => {
        const control = new FormControl(code);
        expect(postalCodeValidator()(control)).toBeNull();
      });
    });

    it('should accept postal codes from major cities', () => {
      const cityPostalCodes = [
        '28013', // Madrid centro
        '08002', // Barcelona
        '41001', // Sevilla
        '46001', // Valencia
        '29001', // Málaga
        '15001', // A Coruña
        '03001', // Alicante
        '30001', // Murcia
      ];

      cityPostalCodes.forEach((code) => {
        const control = new FormControl(code);
        expect(postalCodeValidator()(control)).toBeNull();
      });
    });
  });

  describe('Invalid Postal Codes', () => {
    it('should return postalCodeInvalid error for an invalid postal code format', () => {
      const control = new FormControl('123'); // Too short
      expect(postalCodeValidator()(control)).toEqual({ postalCodeInvalid: true });
    });

    it('should return postalCodeInvalid error for a postal code outside Spanish range', () => {
      const control = new FormControl('00001'); // Invalid range
      expect(postalCodeValidator()(control)).toEqual({ postalCodeInvalid: true });
    });

    it('should reject postal codes with invalid length', () => {
      const invalidLengths = [
        '123', // Too short
        '2800', // 4 digits
        '280011', // 6 digits
        '2800111', // 7 digits
      ];

      invalidLengths.forEach((code) => {
        const control = new FormControl(code);
        expect(postalCodeValidator()(control)).toEqual({ postalCodeInvalid: true });
      });
    });

    it('should reject postal codes outside valid range', () => {
      const invalidRanges = [
        '00000', // Too low
        '00999', // Too low
        '53000', // Too high
        '99999', // Too high
        '60000', // Invalid province
        '70000', // Invalid province
      ];

      invalidRanges.forEach((code) => {
        const control = new FormControl(code);
        expect(postalCodeValidator()(control)).toEqual({ postalCodeInvalid: true });
      });
    });

    it('should reject postal codes with non-numeric characters', () => {
      const invalidFormats = ['2800A', '28-001', '28 001', 'ABCDE', '28.001', 'CP28001'];

      invalidFormats.forEach((code) => {
        const control = new FormControl(code);
        expect(postalCodeValidator()(control)).toEqual({ postalCodeInvalid: true });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(postalCodeValidator()(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(postalCodeValidator()(control)).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      expect(postalCodeValidator()(control)).toBeNull();
    });
  });
});

describe('Integration Tests', () => {
  describe('Form with all Spanish validators', () => {
    it('should validate a complete Spanish user form', () => {
      const form = new FormGroup({
        nif: new FormControl('12345678Z', [nifValidator()]),
        phone: new FormControl('612345678', [phoneValidator()]),
        postalCode: new FormControl('28001', [postalCodeValidator()]),
      });

      expect(form.valid).toBeTruthy();
    });

    it('should invalidate form with any invalid Spanish field', () => {
      const form = new FormGroup({
        nif: new FormControl('12345678A', [nifValidator()]), // Invalid
        phone: new FormControl('612345678', [phoneValidator()]),
        postalCode: new FormControl('28001', [postalCodeValidator()]),
      });

      expect(form.valid).toBeFalsy();
      expect(form.get('nif')?.hasError('nifInvalid')).toBeTruthy();
    });

    it('should work with required validator', () => {
      const form = new FormGroup({
        nif: new FormControl('', [Validators.required, nifValidator()]),
        phone: new FormControl('', [Validators.required, phoneValidator()]),
        postalCode: new FormControl('', [Validators.required, postalCodeValidator()]),
      });

      expect(form.valid).toBeFalsy();
      expect(form.get('nif')?.hasError('required')).toBeTruthy();
    });
  });

  describe('Real-world scenarios', () => {
    it('should validate complete Madrid address', () => {
      const form = new FormGroup({
        nif: new FormControl('12345678Z', [nifValidator()]),
        phone: new FormControl('912345678', [phoneValidator()]),
        postalCode: new FormControl('28013', [postalCodeValidator()]),
      });

      expect(form.valid).toBeTruthy();
    });

    it('should validate complete Barcelona address', () => {
      // 44444444 % 23 = 9 -> D
      const form = new FormGroup({
        nif: new FormControl('44444444D', [nifValidator()]),
        phone: new FormControl('612345678', [phoneValidator()]),
        postalCode: new FormControl('08002', [postalCodeValidator()]),
      });

      expect(form.valid).toBeTruthy();
    });

    it('should handle user input corrections', () => {
      const control = new FormControl('1234567Z', [nifValidator()]);

      expect(control.valid).toBeFalsy();

      control.setValue('12345678Z');

      expect(control.valid).toBeTruthy();
    });
  });
});
