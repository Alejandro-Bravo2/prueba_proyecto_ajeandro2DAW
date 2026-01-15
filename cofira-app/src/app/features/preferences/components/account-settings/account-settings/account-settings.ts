import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../../shared/components/ui/input/input/input';
import { Button } from '../../../../../shared/components/ui/button/button/button';
import { UserService } from '../../../../user/services/user.service';
import { passwordStrengthValidator } from '../../../../../shared/validators/password-strength.validator';
import { passwordMatchValidator } from '../../../../../shared/validators/cross-field.validators';
import { LoadingService } from '../../../../../core/services/loading.service';
import { ToastService } from '../../../../../core/services/toast.service';

interface User {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, Button],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.scss',
})
export class AccountSettings implements OnInit {
  accountSettingsForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [passwordStrengthValidator()]), // Optional new password
    confirmNewPassword: new FormControl(''),
  }, { validators: passwordMatchValidator('newPassword', 'confirmNewPassword') });

  currentUser: User | null = null; // Placeholder for current user data

  constructor(
    private userService: UserService,
    private router: Router,
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Simulate fetching current user data
    this.loadingService.show();
    // In a real app, get actual user ID
    this.userService.getUserById('1').subscribe({ // Assuming user with ID 1 exists
      next: (user: User) => {
        this.currentUser = user;
        this.accountSettingsForm.patchValue({
          name: user.name,
          email: user.email,
        });
        this.loadingService.hide();
      },
      error: (err: Error) => {
        console.error('Error fetching user data', err);
        this.loadingService.hide();
        this.toastService.error('Error al cargar datos del usuario.');
      }
    });
  }

  onSubmit(): void {
    if (this.accountSettingsForm.valid) {
      this.loadingService.show();
      // Prepare data for update (excluding currentPassword)
      const { name, email, newPassword } = this.accountSettingsForm.value;
      const updatedUser: Partial<User> = { name: name!, email: email! };
      if (newPassword) {
        // In a real app, you'd handle password change securely on backend
        // For mock, just include it
        // updatedUser.password = newPassword;
      }

      if (this.currentUser) {
        this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
          next: (response) => {
            console.log('Account settings updated:', response);
            this.loadingService.hide();
            this.toastService.success('Configuración de cuenta actualizada.');
            // Optionally, update local user state or refresh token
          },
          error: (err: Error) => {
            console.error('Error updating account settings:', err);
            this.loadingService.hide();
            this.toastService.error('Error al actualizar la configuración: ' + (err.message || 'Inténtalo de nuevo.'));
          }
        });
      }
    } else {
      this.accountSettingsForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }
}
