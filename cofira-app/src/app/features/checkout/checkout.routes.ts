import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/checkout-page/checkout-page').then((m) => m.CheckoutPage),
    canActivate: [authGuard],
    data: { breadcrumb: 'Checkout' }
  }
];
