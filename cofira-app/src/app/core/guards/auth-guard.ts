import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Guard de autenticacion que protege rutas privadas
 *
 * Si el usuario no esta autenticado, redirige a /login con el parametro
 * returnUrl para poder volver a la pagina original despues del login.
 *
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'entrenamiento',
 *   loadComponent: () => import('./features/training/training').then(m => m.Training),
 *   canActivate: [authGuard]
 * }
 * ```
 *
 * @param route - Snapshot de la ruta activada
 * @param state - Estado del router con la URL actual
 * @returns true si esta autenticado, o UrlTree de redireccion a login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirigir a login con la URL de retorno como queryParam
  // Esto permite volver a la pagina original despues de iniciar sesion
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
