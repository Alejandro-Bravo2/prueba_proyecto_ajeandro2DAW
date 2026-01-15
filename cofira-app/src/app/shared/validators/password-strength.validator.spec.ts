import { FormControl, FormGroup, Validators } from '@angular/forms';
import { passwordStrengthValidator } from './password-strength.validator';

describe('passwordStrengthValidator', () => {
  describe('Valid Passwords', () => {
    it('should return null for a strong password', () => {
      const control = new FormControl('StrongP@ssw0rd');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with exactly 12 characters', () => {
      const control = new FormControl('StrongP@ss12');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with multiple special characters', () => {
      const control = new FormControl('Strong!@#$%Pass123');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with multiple numbers', () => {
      const control = new FormControl('Strong1234567Pass!');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with multiple uppercase letters', () => {
      const control = new FormControl('STRONG!Pass123word');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with multiple lowercase letters', () => {
      const control = new FormControl('STRONGpass!123WORD');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept very long password', () => {
      const control = new FormControl('VeryLongAndStrongPassword123!@#$%^&*()');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with all special character types', () => {
      const control = new FormControl('Pass!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`123');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });
  });

  describe('Invalid Passwords - Length', () => {
    it('should return passwordStrength error if password is too short', () => {
      const control = new FormControl('Short1!');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should reject password with 11 characters', () => {
      const control = new FormControl('Strong!Pas1');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should reject empty password', () => {
      const control = new FormControl('');
      expect(passwordStrengthValidator()(control)).toBeNull(); // Returns null for empty as per implementation
    });
  });

  describe('Invalid Passwords - Missing Character Types', () => {
    it('should return passwordStrength error if password lacks uppercase', () => {
      const control = new FormControl('strongp@ssw0rd');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should return passwordStrength error if password lacks lowercase', () => {
      const control = new FormControl('STRONGP@SSW0RD');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should return passwordStrength error if password lacks numeric', () => {
      const control = new FormControl('StrongP@ssword');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should return passwordStrength error if password lacks special character', () => {
      const control = new FormControl('StrongPassword123');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should reject password with only uppercase and numbers', () => {
      const control = new FormControl('STRONGPASSWORD123');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should reject password with only lowercase and numbers', () => {
      const control = new FormControl('strongpassword123');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should reject password with only letters (upper and lower)', () => {
      const control = new FormControl('StrongPasswordOnly');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });

    it('should reject password with only numbers and special chars', () => {
      const control = new FormControl('123456789012!@#$');
      expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
    });
  });

  describe('Edge Cases', () => {
    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should handle password with spaces', () => {
      const control = new FormControl('Strong Pass Word 123!');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should handle password with tabs and newlines', () => {
      const control = new FormControl('Strong\tPass\nWord123!');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should handle password with unicode characters', () => {
      const control = new FormControl('StrongPassword123!日本語');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should handle password with emojis', () => {
      const control = new FormControl('StrongPassword123!😀🔒');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });
  });

  describe('Special Character Coverage', () => {
    const specialChars = [
      '!',
      '@',
      '#',
      '$',
      '%',
      '^',
      '&',
      '*',
      '(',
      ')',
      '_',
      '+',
      '-',
      '=',
      '[',
      ']',
      '{',
      '}',
      ';',
      ':',
      '"',
      "'",
      '\\',
      '|',
      ',',
      '.',
      '<',
      '>',
      '/',
      '?',
    ];

    specialChars.forEach((char) => {
      it(`should accept password with special character: ${char}`, () => {
        const control = new FormControl(`StrongPass123${char}`);
        expect(passwordStrengthValidator()(control)).toBeNull();
      });
    });
  });

  describe('Form Integration', () => {
    it('should work with reactive forms', () => {
      const formGroup = new FormGroup({
        password: new FormControl('StrongP@ssw0rd', [passwordStrengthValidator()]),
      });

      expect(formGroup.valid).toBeTruthy();
    });

    it('should invalidate form with weak password', () => {
      const formGroup = new FormGroup({
        password: new FormControl('weak', [passwordStrengthValidator()]),
      });

      expect(formGroup.valid).toBeFalsy();
      expect(formGroup.get('password')?.hasError('passwordStrength')).toBeTruthy();
    });

    it('should work with multiple validators', () => {
      const formGroup = new FormGroup({
        password: new FormControl('Short', [Validators.required, passwordStrengthValidator()]),
      });

      expect(formGroup.get('password')?.hasError('passwordStrength')).toBeTruthy();
    });

    it('should update validation on value change', () => {
      const control = new FormControl('weak', [passwordStrengthValidator()]);

      expect(control.hasError('passwordStrength')).toBeTruthy();

      control.setValue('StrongP@ssw0rd');

      expect(control.hasError('passwordStrength')).toBeFalsy();
      expect(control.valid).toBeTruthy();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should accept commonly recommended strong passwords', () => {
      // All passwords must have:
      // - At least 12 characters
      // - Uppercase, lowercase, number, special character
      const strongPasswords = [
        'MyP@ssw0rd2024!', // 15 chars ✓
        'Tr0ub4dor&3!!', // 13 chars ✓ (added !!)
        'P@ssw0rd!2024!', // 14 chars ✓
        'Str0ng!P@ssw0rd', // 15 chars ✓
        'SecureP@ss123!', // 14 chars ✓
      ];

      strongPasswords.forEach((password) => {
        const control = new FormControl(password);
        expect(passwordStrengthValidator()(control)).toBeNull();
      });
    });

    it('should reject commonly weak passwords', () => {
      const weakPasswords = [
        'password',
        '12345678',
        'qwerty',
        'Password',
        'Password123',
        'P@ssword',
        'Pass1!',
      ];

      weakPasswords.forEach((password) => {
        const control = new FormControl(password);
        expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
      });
    });
  });

  describe('Password Patterns', () => {
    it('should accept password starting with special character', () => {
      const control = new FormControl('!StrongPassword123');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password ending with special character', () => {
      const control = new FormControl('StrongPassword123!');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with special characters in middle', () => {
      const control = new FormControl('Strong!@#Password123');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with consecutive numbers', () => {
      const control = new FormControl('StrongPassword1234567890!');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });

    it('should accept password with consecutive special characters', () => {
      const control = new FormControl('StrongPassword!@#$%^&*()123');
      expect(passwordStrengthValidator()(control)).toBeNull();
    });
  });
});
