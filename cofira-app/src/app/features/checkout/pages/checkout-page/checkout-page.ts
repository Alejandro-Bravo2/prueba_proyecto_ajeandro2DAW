import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutStore } from '../../stores/checkout.store';
import { PlanSummary } from '../../components/plan-summary/plan-summary';
import { PaymentForm } from '../../components/payment-form/payment-form';
import { PaymentSuccess } from '../../components/payment-success/payment-success';
import { TipoPlan } from '../../models/checkout.model';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, PlanSummary, PaymentForm, PaymentSuccess],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss'
})
export class CheckoutPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(CheckoutStore);

  ngOnInit(): void {
    const planType = this.route.snapshot.queryParams['plan'] as TipoPlan;

    if (planType && ['INDIVIDUAL', 'MENSUAL', 'ANUAL'].includes(planType)) {
      this.store.selectPlan(planType);
    } else {
      // Si no hay plan valido, redirigir a home
      this.router.navigate(['/']);
    }
  }

  onProceedToPayment(): void {
    this.store.proceedToPayment();
  }

  onBackToSummary(): void {
    this.store.goToStep('summary');
  }

  onPaymentComplete(): void {
    // El store ya maneja la transicion a success
  }

  onGoToDashboard(): void {
    this.store.goToDashboard();
  }
}
