import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
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
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<EjerciciosDTO[]> => {
  const trainingService = inject(TrainingService);
  const loadingService = inject(LoadingService);
  const toastService = inject(ToastService);

  loadingService.show();

  return trainingService.listarEjercicios().pipe(
    catchError(() => {
      toastService.error('No se pudieron cargar los ejercicios. Por favor, intenta más tarde.');
      return of([]);
    }),
    finalize(() => {
      // Ocultar indicador de carga
      loadingService.hide();
    })
  );
};
