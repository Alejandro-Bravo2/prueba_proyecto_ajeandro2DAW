import { FormControl, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from './cross-field.validators';

describe('passwordMatchValidator', () => {
  describe('Basic Functionality', () => {
    it('should return null if passwords match', () => {
      const formGroup = new FormGroup({
        password: new FormControl('password123'),
        confirmPassword: new FormControl('password123'),
      });
      expect(passwordMatchValidator('password', 'confirmPassword')(formGroup)).toBeNull();
    });

    it('should return passwordMatch error if passwords do not match', () => {
      const formGroup = new FormGroup({
        password: new FormControl('password123'),
        confirmPassword: new FormControl('different'),
      });
      const validator = passwordMatchValidator('password', 'confirmPassword')(formGroup);
      expect(validator).toEqual({ passwordMatch: true });
    });

    it('should return null if control or matchingControl are not found', () => {
      const formGroup = new FormGroup({
        password: new FormControl('password123'),
      });
      expect(passwordMatchValidator('password', 'nonExistent')(formGroup)).toBeNull();
    });

    it('should validate matching when both passwords are the same', () => {
      const formGroup = new FormGroup(
        {
          password: new FormControl('password123'),
          confirmPassword: new FormControl('password123'),
        },
        { validators: passwordMatchValidator('password', 'confirmPassword') }
      );
      expect(formGroup.valid).toBeTrue();
      expect(formGroup.errors).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty passwords', () => {
      const formGroup = new FormGroup({
        password: new FormControl(''),
        confirmPassword: new FormControl(''),
      });
      expect(passwordMatchValidator('password', 'confirmPassword')(formGroup)).toBeNull();
    });

    it('should handle null values', () => {
      const formGroup = new FormGroup({
        password: new FormControl(null),
        confirmPassword: new FormControl(null),
      });
      expect(passwordMatchValidator('password', 'confirmPassword')(formGroup)).toBeNull();
    });

    it('should handle undefined values', () => {
      const formGroup = new FormGroup({
        password: new FormControl(undefined),
        confirmPassword: new FormControl(undefined),
      });
      expect(passwordMatchValidator('password', 'confirmPassword')(formGroup)).toBeNull();
    });

    it('should handle very long passwords', () => {
      const longPassword = 'a'.repeat(1000);
      const formGroup = new FormGroup({
        password: new FormControl(longPassword),
        confirmPassword: new FormControl(longPassword),
      });
      expect(passwordMatchValidator('password', 'confirmPassword')(formGroup)).toBeNull();
    });

    it('should handle special characters in passwords', () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const formGroup = new FormGroup({
        password: new FormControl(specialPassword),
        confirmPassword: new FormControl(specialPassword),
      });
      expect(passwordMatchValidator('password', 'confirmPassword')(formGroup)).toBeNull();
    });

    it('should handle unicode characters', () => {
      const unicodePassword = 'パスワード123';
      const formGroup = new FormGroup({
        password: new FormControl(unicodePassword),
        confirmPassword: new FormControl(unicodePassword),
      });
      expect(passwordMatchValidator('password', 'confirmPassword')(formGroup)).toBeNull();
    });

    it('should be case sensitive', () => {
      const formGroup = new FormGroup({
        password: new FormControl('Password123'),
        confirmPassword: new FormControl('password123'),
      });
      const validator = passwordMatchValidator('password', 'confirmPassword')(formGroup);
      expect(validator).toEqual({ passwordMatch: true });
    });

    it('should handle whitespace differences', () => {
      const formGroup = new FormGroup({
        password: new FormControl('password 123'),
        confirmPassword: new FormControl('password123'),
      });
      const validator = passwordMatchValidator('password', 'confirmPassword')(formGroup);
      expect(validator).toEqual({ passwordMatch: true });
    });
  });

  describe('Error Handling', () => {
    it('should not override existing errors on matchingControl', () => {
      const formGroup = new FormGroup({
        password: new FormControl('password123'),
        confirmPassword: new FormControl('pwd', [Validators.minLength(8)]),
      });

      const confirmControl = formGroup.get('confirmPassword');
      expect(confirmControl?.errors).toEqual({ minlength: { requiredLength: 8, actualLength: 3 } });

      passwordMatchValidator('password', 'confirmPassword')(formGroup);

      // Original error should still exist
      expect(confirmControl?.hasError('minlength')).toBeTruthy();
    });

    it('should handle missing control gracefully', () => {
      const formGroup = new FormGroup({
        confirmPassword: new FormControl('password123'),
      });
      expect(() => {
        passwordMatchValidator('password', 'confirmPassword')(formGroup);
      }).not.toThrow();
    });

    it('should handle missing matchingControl gracefully', () => {
      const formGroup = new FormGroup({
        password: new FormControl('password123'),
      });
      expect(() => {
        passwordMatchValidator('password', 'confirmPassword')(formGroup);
      }).not.toThrow();
    });
  });

  describe('Dynamic Updates', () => {
    it('should revalidate when password changes', () => {
      const formGroup = new FormGroup(
        {
          password: new FormControl('password123'),
          confirmPassword: new FormControl('password123'),
        },
        { validators: passwordMatchValidator('password', 'confirmPassword') }
      );

      expect(formGroup.valid).toBeTrue();

      formGroup.get('password')?.setValue('newpassword');
      formGroup.updateValueAndValidity();

      expect(formGroup.errors).toEqual({ passwordMatch: true });
    });

    it('should revalidate when confirmPassword changes', () => {
      const formGroup = new FormGroup(
        {
          password: new FormControl('password123'),
          confirmPassword: new FormControl('different'),
        },
        { validators: passwordMatchValidator('password', 'confirmPassword') }
      );

      expect(formGroup.errors).toEqual({ passwordMatch: true });

      formGroup.get('confirmPassword')?.setValue('password123');
      formGroup.updateValueAndValidity();

      expect(formGroup.errors).toBeNull();
    });

    it('should handle multiple sequential changes', () => {
      const formGroup = new FormGroup(
        {
          password: new FormControl('password1'),
          confirmPassword: new FormControl('password1'),
        },
        { validators: passwordMatchValidator('password', 'confirmPassword') }
      );

      expect(formGroup.valid).toBeTrue();

      formGroup.get('password')?.setValue('password2');
      formGroup.updateValueAndValidity();
      expect(formGroup.errors).toEqual({ passwordMatch: true });

      formGroup.get('confirmPassword')?.setValue('password2');
      formGroup.updateValueAndValidity();
      expect(formGroup.errors).toBeNull();

      formGroup.get('password')?.setValue('password3');
      formGroup.updateValueAndValidity();
      expect(formGroup.errors).toEqual({ passwordMatch: true });
    });
  });

  describe('Form Integration', () => {
    it('should work with reactive forms', () => {
      const formGroup = new FormGroup(
        {
          password: new FormControl('SecurePass123!'),
          confirmPassword: new FormControl('SecurePass123!'),
        },
        { validators: passwordMatchValidator('password', 'confirmPassword') }
      );

      expect(formGroup.valid).toBeTruthy();
      expect(formGroup.errors).toBeNull();
    });

    it('should invalidate form when passwords do not match', () => {
      const formGroup = new FormGroup(
        {
          password: new FormControl('SecurePass123!'),
          confirmPassword: new FormControl('DifferentPass!'),
        },
        { validators: passwordMatchValidator('password', 'confirmPassword') }
      );

      expect(formGroup.valid).toBeFalsy();
      expect(formGroup.errors).toEqual({ passwordMatch: true });
    });

    it('should work with nested form groups', () => {
      const parentGroup = new FormGroup({
        credentials: new FormGroup(
          {
            password: new FormControl('password123'),
            confirmPassword: new FormControl('password123'),
          },
          { validators: passwordMatchValidator('password', 'confirmPassword') }
        ),
      });

      expect(parentGroup.get('credentials')?.valid).toBeTruthy();
    });
  });
});
