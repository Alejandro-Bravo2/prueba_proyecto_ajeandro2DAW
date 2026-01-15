import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { canDeactivateGuard } from './core/guards/can-deactivate.guard';
import { onboardingGuard, skipIfOnboardedGuard } from './core/guards/onboarding.guard';
import { signupGuard } from './core/guards/signup.guard';
import { trainingResolver } from './features/training/resolvers/training.resolver';
import { nutritionResolver } from './features/nutrition/resolvers/nutrition.resolver';
import { exerciseDetailResolver } from './features/training/resolvers/exercise-detail.resolver';

/**
 * Configuracion de rutas de la aplicacion COFIRA
 *
 * Estructura:
 * - Rutas publicas: login, register, reset-password
 * - Rutas protegidas: requieren authGuard y onboardingGuard
 * - Rutas con parametros: /entrenamiento/:id
 * - Rutas hijas: /preferencias/alimentacion, /preferencias/cuenta, /preferencias/notificaciones
 * - Ruta wildcard: ** para pagina 404
 *
 * Todas las rutas usan lazy loading con loadComponent/loadChildren
 * y estrategia de precarga PreloadAllModules configurada en app.config.ts
 */
export const routes: Routes = [
  // ==========================================
  // RUTA PRINCIPAL (publica - sin guards)
  // ==========================================
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    data: { breadcrumb: 'Inicio' }
  },

  // ==========================================
  // RUTAS DE AUTENTICACION (publicas)
  // ==========================================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login/login').then(m => m.Login),
    data: { breadcrumb: 'Iniciar Sesion' }
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/signup-wizard/signup-wizard').then(m => m.SignupWizard),
    canActivate: [signupGuard],
    data: { breadcrumb: 'Registro' }
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password/reset-password').then(m => m.ResetPassword),
    data: { breadcrumb: 'Restablecer Contrasena' }
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/auth/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [authGuard, skipIfOnboardedGuard],
    data: { breadcrumb: 'Configuracion Inicial' }
  },

  // ==========================================
  // RUTAS LEGALES (publicas)
  // ==========================================
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms/terms').then(m => m.Terms),
    data: { breadcrumb: 'Terminos de Servicio' }
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/privacy/privacy').then(m => m.Privacy),
    data: { breadcrumb: 'Politica de Privacidad' }
  },

  // ==========================================
  // RUTA DE CHECKOUT (requiere autenticacion)
  // ==========================================
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES),
    data: { breadcrumb: 'Pago' }
  },

  // ==========================================
  // RUTAS DE ENTRENAMIENTO (con parametro :id)
  // ==========================================
  {
    path: 'entrenamiento',
    loadComponent: () => import('./features/training/training').then(m => m.Training),
    canActivate: [authGuard, onboardingGuard],
    resolve: { exercises: trainingResolver },
    data: { breadcrumb: 'Entrenamiento' }
  },
  {
    // Ruta con parametro :id para detalle de ejercicio
    path: 'entrenamiento/:id',
    loadComponent: () => import('./features/training/components/exercise-detail/exercise-detail').then(m => m.ExerciseDetail),
    canActivate: [authGuard, onboardingGuard],
    resolve: { exercise: exerciseDetailResolver },
    data: { breadcrumb: 'Detalle Ejercicio' }
  },

  // ==========================================
  // RUTA DE ALIMENTACION
  // ==========================================
  {
    path: 'alimentacion',
    loadComponent: () => import('./features/nutrition/nutrition').then(m => m.Nutrition),
    canActivate: [authGuard, onboardingGuard],
    resolve: { foods: nutritionResolver },
    data: { breadcrumb: 'Alimentacion' }
  },

  // ==========================================
  // RUTA DE SEGUIMIENTO
  // ==========================================
  {
    path: 'seguimiento',
    loadComponent: () => import('./features/progress/progress').then(m => m.Progress),
    canActivate: [authGuard, onboardingGuard],
    data: { breadcrumb: 'Seguimiento' }
  },

  // ==========================================
  // RUTAS DE PREFERENCIAS (con rutas hijas anidadas)
  // ==========================================
  {
    path: 'preferencias',
    loadComponent: () => import('./features/preferences/preferences-layout/preferences-layout').then(m => m.PreferencesLayout),
    canActivate: [authGuard, onboardingGuard],
    data: { breadcrumb: 'Preferencias' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'alimentacion'
      },
      {
        path: 'alimentacion',
        loadComponent: () => import('./features/preferences/pages/preferences-nutrition/preferences-nutrition').then(m => m.PreferencesNutrition),
        data: { breadcrumb: 'Alimentacion' }
      },
      {
        path: 'cuenta',
        loadComponent: () => import('./features/preferences/pages/preferences-account/preferences-account').then(m => m.PreferencesAccount),
        canDeactivate: [canDeactivateGuard],
        data: { breadcrumb: 'Cuenta' }
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./features/preferences/pages/preferences-notifications/preferences-notifications').then(m => m.PreferencesNotifications),
        data: { breadcrumb: 'Notificaciones' }
      }
    ]
  },

  // ==========================================
  // RUTA WILDCARD 404 (siempre al final)
  // ==========================================
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFound),
    data: { breadcrumb: 'Pagina no encontrada' }
  }
];
