import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CanComponentDeactivate } from '../../../../core/guards/can-deactivate.guard';
import { SubscriptionStore } from '../../../../core/stores/subscription.store';
import { CheckoutService } from '../../../checkout/services/checkout.service';
import { ToastService } from '../../../../core/services/toast.service';

/**
 * Componente hijo para las preferencias de cuenta
 * Se renderiza dentro del router-outlet de PreferencesLayout
 * Implementa CanComponentDeactivate para prevenir perdida de cambios
 *
 * Ruta: /preferencias/cuenta
 */
@Component({
  selector: 'app-preferences-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './preferences-account.html',
  styleUrl: './preferences-account.scss',
})
export class PreferencesAccount implements CanComponentDeactivate {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private toastService = inject(ToastService);
  readonly subscriptionStore = inject(SubscriptionStore);

  isEditing = signal(false);
  isSaving = signal(false);
  isCancellingSubscription = signal(false);

  accountForm = new FormGroup({
    name: new FormControl('Usuario COFIRA', [Validators.required]),
    email: new FormControl('usuario@cofira.com', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  privacySettings = signal({
    publicProfile: true,
    showProgress: true,
    shareStats: false,
  });

  toggleEdit(): void {
    this.isEditing.update(v => !v);
  }

  saveChanges(): void {
    if (this.accountForm.valid) {
      this.isSaving.set(true);

      // Simular guardado
      setTimeout(() => {
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.accountForm.markAsPristine();
      }, 1000);
    }
  }

  cancelEdit(): void {
    this.accountForm.reset({
      name: 'Usuario COFIRA',
      email: 'usuario@cofira.com',
      phone: '',
    });
    this.isEditing.set(false);
  }

  updatePrivacy(setting: 'publicProfile' | 'showProgress' | 'shareStats'): void {
    this.privacySettings.update(current => ({
      ...current,
      [setting]: !current[setting]
    }));
  }

  cancelarSubscripcion(): void {
    if (!confirm('¿Estas seguro de que quieres cancelar tu subscripcion? Perderas acceso a las funciones premium.')) {
      return;
    }

    this.isCancellingSubscription.set(true);

    this.checkoutService.cancelarSubscripcion().subscribe({
      next: () => {
        this.toastService.success('Subscripcion cancelada correctamente');
        this.subscriptionStore.cargarEstado();
        this.isCancellingSubscription.set(false);
      },
      error: (err) => {
        console.error('Error cancelando subscripcion:', err);
        this.toastService.error('Error al cancelar la subscripcion');
        this.isCancellingSubscription.set(false);
      }
    });
  }

  /**
   * Implementacion de CanComponentDeactivate
   * Previene la navegacion si hay cambios sin guardar
   */
  canDeactivate(): boolean {
    if (this.accountForm.dirty) {
      return confirm(
        'Tienes cambios sin guardar en tu cuenta. ¿Seguro que quieres salir?'
      );
    }
    return true;
  }

  /**
   * Navegar a cambiar contrasena con queryParams
   */
  changePassword(): void {
    this.router.navigate(['/preferencias/cuenta'], {
      queryParams: { action: 'change-password' },
      fragment: 'security'
    });
  }
}
