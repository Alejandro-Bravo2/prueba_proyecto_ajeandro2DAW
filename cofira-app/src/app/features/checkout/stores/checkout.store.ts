import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CheckoutService } from '../services/checkout.service';
import { SubscriptionStore } from '../../../core/stores/subscription.store';
import { ToastService } from '../../../core/services/toast.service';
import {
  TipoPlan,
  MetodoPago,
  CheckoutRequest,
  CheckoutResponse,
  PLANES_INFO,
  PlanInfo
} from '../models/checkout.model';

export type CheckoutStep = 'summary' | 'payment' | 'success';

@Injectable({ providedIn: 'root' })
export class CheckoutStore {
  private readonly checkoutService = inject(CheckoutService);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Estado privado
  private readonly _selectedPlan = signal<TipoPlan | null>(null);
  private readonly _selectedPaymentMethod = signal<MetodoPago | null>(null);
  private readonly _currentStep = signal<CheckoutStep>('summary');
  private readonly _processing = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _response = signal<CheckoutResponse | null>(null);

  // Estado publico readonly
  readonly selectedPlan = this._selectedPlan.asReadonly();
  readonly selectedPaymentMethod = this._selectedPaymentMethod.asReadonly();
  readonly currentStep = this._currentStep.asReadonly();
  readonly processing = this._processing.asReadonly();
  readonly error = this._error.asReadonly();
  readonly response = this._response.asReadonly();

  // Computed
  readonly planInfo = computed<PlanInfo | null>(() => {
    const plan = this._selectedPlan();
    return plan ? PLANES_INFO[plan] : null;
  });

  readonly canProceedToPayment = computed(
    () => this._selectedPlan() !== null && !this._processing()
  );

  readonly canProcessPayment = computed(
    () =>
      this._selectedPlan() !== null &&
      this._selectedPaymentMethod() !== null &&
      !this._processing()
  );

  readonly isComplete = computed(
    () => this._currentStep() === 'success' && this._response()?.exitoso === true
  );

  // Metodos
  selectPlan(plan: TipoPlan): void {
    this._selectedPlan.set(plan);
    this._error.set(null);
  }

  selectPaymentMethod(method: MetodoPago): void {
    this._selectedPaymentMethod.set(method);
    this._error.set(null);
  }

  goToStep(step: CheckoutStep): void {
    this._currentStep.set(step);
  }

  proceedToPayment(): void {
    if (this.canProceedToPayment()) {
      this._currentStep.set('payment');
    }
  }

  processPayment(formData: Partial<CheckoutRequest>): void {
    const plan = this._selectedPlan();
    const method = this._selectedPaymentMethod();

    if (!plan || !method) {
      this._error.set('Selecciona un plan y metodo de pago');
      return;
    }

    const request: CheckoutRequest = {
      tipoPlan: plan,
      metodoPago: method,
      ...formData
    };

    this._processing.set(true);
    this._error.set(null);

    this.checkoutService
      .procesarPago(request)
      .pipe(finalize(() => this._processing.set(false)))
      .subscribe({
        next: (response) => {
          this._response.set(response);

          if (response.exitoso) {
            this._currentStep.set('success');
            this.toastService.success(response.mensaje);

            // Actualizar el store global de subscripcion
            this.subscriptionStore.cargarEstado();
          } else {
            this._error.set(response.mensaje || 'Error al procesar el pago');
            this.toastService.error(response.mensaje || 'Error al procesar el pago');
          }
        },
        error: (err) => {
          console.error('Error en checkout:', err);
          const errorMsg = err.error?.mensaje || 'Error al procesar el pago';
          this._error.set(errorMsg);
          this.toastService.error(errorMsg);
        }
      });
  }

  goToDashboard(): void {
    this.reset();
    this.router.navigate(['/entrenamiento']);
  }

  reset(): void {
    this._selectedPlan.set(null);
    this._selectedPaymentMethod.set(null);
    this._currentStep.set('summary');
    this._processing.set(false);
    this._error.set(null);
    this._response.set(null);
  }
}
