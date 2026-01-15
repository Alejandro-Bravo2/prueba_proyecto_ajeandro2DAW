import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CheckoutStore } from '../../stores/checkout.store';
import {
  PlanInfo,
  MetodoPago,
  METODOS_PAGO,
  CheckoutRequest
} from '../../models/checkout.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.scss'
})
export class PaymentForm {
  @Input() planInfo: PlanInfo | null = null;
  @Output() volver = new EventEmitter<void>();

  readonly store = inject(CheckoutStore);
  readonly metodosPago = METODOS_PAGO;
  readonly selectedMethod = signal<MetodoPago | null>(null);

  // Formulario para tarjeta
  cardForm = new FormGroup({
    nombreTitular: new FormControl('', [Validators.required]),
    numeroTarjeta: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)
    ]),
    fechaExpiracion: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
    ]),
    cvv: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3,4}$/)
    ])
  });

  // Formulario para PayPal
  paypalForm = new FormGroup({
    emailPaypal: new FormControl('', [Validators.required, Validators.email])
  });

  // Formulario para Bizum
  bizumForm = new FormGroup({
    telefonoBizum: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[6-7]\d{8}$/)
    ])
  });

  selectMethod(method: MetodoPago): void {
    this.selectedMethod.set(method);
    this.store.selectPaymentMethod(method);
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardForm.get('numeroTarjeta')?.setValue(formatted);
  }

  formatExpiryDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardForm.get('fechaExpiracion')?.setValue(value);
  }

  onVolver(): void {
    this.volver.emit();
  }

  processPayment(): void {
    const method = this.selectedMethod();
    if (!method) return;

    let formData: Partial<CheckoutRequest> = {};
    let isValid = false;

    switch (method) {
      case 'TARJETA':
        this.cardForm.markAllAsTouched();
        if (this.cardForm.valid) {
          formData = {
            nombreTitular: this.cardForm.value.nombreTitular || undefined,
            numeroTarjeta: this.cardForm.value.numeroTarjeta?.replace(/\s/g, '') || undefined,
            fechaExpiracion: this.cardForm.value.fechaExpiracion || undefined,
            cvv: this.cardForm.value.cvv || undefined
          };
          isValid = true;
        }
        break;

      case 'PAYPAL':
        this.paypalForm.markAllAsTouched();
        if (this.paypalForm.valid) {
          formData = {
            emailPaypal: this.paypalForm.value.emailPaypal || undefined
          };
          isValid = true;
        }
        break;

      case 'BIZUM':
        this.bizumForm.markAllAsTouched();
        if (this.bizumForm.valid) {
          formData = {
            telefonoBizum: this.bizumForm.value.telefonoBizum || undefined
          };
          isValid = true;
        }
        break;
    }

    if (isValid) {
      this.store.processPayment(formData);
    }
  }

  getIcon(metodo: string): string {
    switch (metodo) {
      case 'credit-card':
        return 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm0 4h18M7 15h4';
      case 'paypal':
        return 'M7.5 21L3 9h18l-4.5 12h-9zM12 4.5v4.5M8 6l4-2 4 2';
      case 'smartphone':
        return 'M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM12 18h.01';
      default:
        return '';
    }
  }
}
