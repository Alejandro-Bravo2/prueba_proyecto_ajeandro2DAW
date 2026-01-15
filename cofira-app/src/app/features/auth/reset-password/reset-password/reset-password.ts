import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { passwordStrengthValidator } from '../../../../shared/validators/password-strength.validator';
import { passwordMatchValidator } from '../../../../shared/validators/cross-field.validators';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastService);

  codeSent = false;

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  resetForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(6)]),
    newPassword: new FormControl('', [Validators.required, passwordStrengthValidator()]),
    confirmNewPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator('newPassword', 'confirmNewPassword') });

  // Methods to handle form submissions
  requestResetCode(): void {
    if (this.emailForm.valid) {
      this.loadingService.show();
      const email = this.emailForm.value.email;
      if (email) {
        this.authService.requestPasswordResetCode(email).subscribe({
          next: () => {
            this.loadingService.hide();
            this.toastService.success('Código de restablecimiento enviado a tu email.');
            this.codeSent = true;
          },
          error: (err) => {
            this.loadingService.hide();
            this.toastService.error('Error al enviar el código: ' + (err.message || 'Inténtalo de nuevo.'));
          }
        });
      }
    } else {
      this.emailForm.markAllAsTouched();
    }
  }

  resetPassword(): void {
    if (this.resetForm.valid) {
      this.loadingService.show();
      const { code, newPassword } = this.resetForm.value;
      const email = this.emailForm.value.email; // Get email from the first form
      if (email && code && newPassword) {
        this.authService.resetPasswordWithCode(email, code, newPassword).subscribe({
          next: () => {
            this.loadingService.hide();
            this.toastService.success('Contraseña restablecida con éxito.');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.loadingService.hide();
            this.toastService.error('Error al restablecer la contraseña: ' + (err.message || 'Inténtalo de nuevo.'));
          }
        });
      }
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
