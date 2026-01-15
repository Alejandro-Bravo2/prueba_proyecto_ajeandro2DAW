import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Guard que verifica si el usuario ha completado el onboarding.
 * Si no lo ha completado, redirige a la pagina de onboarding.
 * Debe usarse DESPUES de authGuard en las rutas protegidas.
 */
export const onboardingGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no esta logueado, dejar que authGuard maneje la redireccion
  if (!authService.isLoggedIn()) {
    return true; // authGuard se encargara de redirigir a login
  }

  // Si el usuario necesita onboarding, redirigir
  if (authService.needsOnboarding()) {
    return router.parseUrl('/onboarding');
  }

  return true;
};

/**
 * Guard que previene el acceso a la pagina de onboarding si ya esta completado.
 * Redirige al usuario a la pagina principal si ya ha completado el onboarding.
 */
export const skipIfOnboardedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no esta logueado, dejar que authGuard maneje la redireccion
  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  // Si ya completo el onboarding, redirigir a home
  if (!authService.needsOnboarding()) {
    return router.parseUrl('/');
  }

  return true;
};
