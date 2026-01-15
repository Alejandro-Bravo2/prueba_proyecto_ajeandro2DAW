import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Detectar si es una petición de validación asíncrona
      const isValidationRequest = req.url.includes('/api/usuarios/username') ||
                                   req.url.includes('/api/usuarios/email');

      // Detectar si es una petición de logout
      const isLogoutRequest = req.url.includes('/api/auth/logout');

      let errorMessage = 'Ha ocurrido un error inesperado.';
      let shouldShowToast = true;

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 0: // Connection error
            // No mostrar notificación para validaciones asíncronas
            if (isValidationRequest) {
              shouldShowToast = false;
              errorMessage = 'No se pudo verificar la disponibilidad. Por favor, intenta de nuevo.';
            } else {
              errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
            }
            break;
          case 401: // Unauthorized
            errorMessage = 'Acceso no autorizado. Por favor, inicia sesión de nuevo.';
            toastService.error(errorMessage);
            router.navigate(['/login']); // Redirect to login page
            shouldShowToast = false; // Ya mostramos el toast arriba
            break;
          case 403: // Forbidden
            errorMessage = 'No tienes permiso para acceder a este recurso.';
            toastService.warning(errorMessage);
            shouldShowToast = false; // Ya mostramos el toast arriba
            break;
          case 404: // Not Found
            // No mostrar notificación para validaciones asíncronas (404 es esperado)
            if (isValidationRequest) {
              shouldShowToast = false;
              errorMessage = 'Recurso no encontrado';
            } else {
              errorMessage = 'El recurso solicitado no se encontró.';
              toastService.warning(errorMessage);
              shouldShowToast = false; // Ya mostramos el toast arriba
            }
            break;
          case 409: // Conflict
            // No mostrar notificación para logout (token ya invalidado es esperado)
            if (isLogoutRequest) {
              shouldShowToast = false;
              errorMessage = 'Sesión ya cerrada';
            } else {
              errorMessage = 'Conflicto: El recurso ya existe o está en uso.';
            }
            break;
          case 500: // Internal Server Error
            errorMessage = 'Error interno del servidor. Por favor, inténtalo más tarde.';
            toastService.error(errorMessage);
            shouldShowToast = false; // Ya mostramos el toast arriba
            break;
          default:
            errorMessage = `Ha ocurrido un error. Por favor, inténtalo de nuevo.`;
            break;
        }
      }

      // Mostrar toast solo si es necesario
      if (shouldShowToast && !isValidationRequest) {
        toastService.error(errorMessage);
      }

      console.error(errorMessage, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
