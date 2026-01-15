import { inject } from '@angular/core';
import { ResolveFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TrainingService, EjerciciosDTO } from '../services/training.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Resolver que pre-carga la lista de ejercicios antes de activar la ruta de Training
 *
 * @param route - Snapshot de la ruta activada
 * @param state - Estado del router
 * @returns Observable con la lista de ejercicios o array vacío en caso de error
 *
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'entrenamiento',
 *   loadComponent: () => import('./features/training/training').then(m => m.Training),
 *   resolve: { exercises: trainingResolver }
 * }
 *
 * // En el componente Training
 * export class Training implements OnInit {
 *   private route = inject(ActivatedRoute);
 *   exercises = signal<EjerciciosDTO[]>([]);
 *
 *   ngOnInit(): void {
 *     const exercises = this.route.snapshot.data['exercises'] as EjerciciosDTO[];
 *     this.exercises.set(exercises);
 *   }
 * }
 * ```
 */
export const trainingResolver: ResolveFn<EjerciciosDTO[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<EjerciciosDTO[]> => {
  const trainingService = inject(TrainingService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);
  const toastService = inject(ToastService);

  // Mostrar indicador de carga
  loadingService.show();

  return trainingService.listarEjercicios().pipe(
    catchError((error) => {
      console.error('Error al cargar ejercicios en resolver:', error);

      // Mostrar toast de error
      toastService.error('No se pudieron cargar los ejercicios. Por favor, intenta más tarde.');

      // Opcional: redirigir a una página de error o al home
      // router.navigate(['/']);

      // Retornar array vacío para permitir que la navegación continúe
      return of([]);
    }),
    finalize(() => {
      // Ocultar indicador de carga
      loadingService.hide();
    })
  );
};
