import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Guard que previene acceso a registro si el usuario ya esta autenticado.
 *
 * Si el usuario ya esta logueado:
 * - Si necesita onboarding -> redirige a /onboarding
 * - Si ya completo onboarding -> redirige a /
 *
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'register',
 *   loadComponent: () => import('./features/auth/signup-wizard/signup-wizard').then(m => m.SignupWizard),
 *   canActivate: [signupGuard]
 * }
 * ```
 */
export const signupGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya esta logueado, redirigir
  if (authService.isLoggedIn()) {
    if (authService.needsOnboarding()) {
      return router.parseUrl('/onboarding');
    }
    return router.parseUrl('/');
  }

  return true;
};
