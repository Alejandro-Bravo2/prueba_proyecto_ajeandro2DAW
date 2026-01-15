import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { passwordStrengthValidator } from '../../../../shared/validators/password-strength.validator';
import { passwordMatchValidator } from '../../../../shared/validators/cross-field.validators';
import { AsyncValidatorsService } from '../../../../shared/validators/async-validators.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PasswordStrength } from '../../../../shared/components/ui/password-strength/password-strength';
import { CanComponentDeactivate } from '../../../../core/guards/can-deactivate.guard';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordStrength, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements CanComponentDeactivate {
  registerForm: FormGroup;

  constructor(
    private asyncValidatorsService: AsyncValidatorsService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private toastService: ToastService // Placeholder ToastService
  ) {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required, Validators.minLength(3)], [this.asyncValidatorsService.usernameUnique()]),
      email: new FormControl('', [Validators.required, Validators.email], [this.asyncValidatorsService.emailUnique()]),
      password: new FormControl('', [Validators.required, passwordStrengthValidator()]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validators: passwordMatchValidator('password', 'confirmPassword') });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { name, username, email, password } = this.registerForm.value;
      if (name && username && email && password) {
        this.loadingService.show();
        this.authService.register(name, username, email, password).subscribe({
          next: (response) => {
            console.log('Registration successful', response);
            this.loadingService.hide();
            this.toastService.success('Registro exitoso. ¡Bienvenido!');
            // Redirect to onboarding for new users
            this.router.navigate(['/onboarding']);
          },
          error: (err) => {
            console.error('Registration failed', err);
            this.loadingService.hide();
            this.toastService.error('Error en el registro: ' + (err.message || 'Inténtalo de nuevo.'));
          }
        });
      }
    } else {
      console.log('Form is invalid');
      this.registerForm.markAllAsTouched();
    }
  }

  /**
   * Implementación de CanComponentDeactivate
   * Previene que el usuario salga si hay cambios sin guardar
   */
  canDeactivate(): boolean {
    if (this.registerForm.dirty && !this.registerForm.value.email) {
      return confirm(
        '¿Estás seguro de que quieres salir?\n\nTienes cambios sin guardar en el formulario de registro.'
      );
    }
    return true;
  }
}
