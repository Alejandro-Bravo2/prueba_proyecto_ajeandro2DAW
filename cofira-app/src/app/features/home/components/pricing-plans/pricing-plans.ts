import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { TipoPlan } from '../../../checkout/models/checkout.model';

@Component({
  selector: 'app-pricing-plans',
  standalone: true,
  imports: [],
  templateUrl: './pricing-plans.html',
  styleUrl: './pricing-plans.scss',
})
export class PricingPlans {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  selectPlan(planType: TipoPlan): void {
    if (this.authService.isLoggedIn()) {
      // Usuario autenticado: ir directamente a checkout
      this.router.navigate(['/checkout'], {
        queryParams: { plan: planType }
      });
    } else {
      // Usuario no autenticado: guardar plan y redirigir a login
      sessionStorage.setItem('selectedPlan', planType);
      this.router.navigate(['/login'], {
        queryParams: {
          redirect: '/checkout',
          plan: planType
        }
      });
    }
  }
}
