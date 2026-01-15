import { inject } from '@angular/core';
import { ResolveFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TrainingService, EjerciciosDTO } from '../services/training.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Resolver que pre-carga los datos de un ejercicio específico antes de activar la ruta
 *
 * @param route - Snapshot de la ruta activada con el parámetro :id
 * @param state - Estado del router
 * @returns Observable con el ejercicio o null en caso de error
 *
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'entrenamiento/:id',
 *   loadComponent: () => import('./features/training/components/exercise-detail/exercise-detail')
 *     .then(m => m.ExerciseDetail),
 *   resolve: { exercise: exerciseDetailResolver }
 * }
 *
 * // En el componente
 * export class ExerciseDetail implements OnInit {
 *   private route = inject(ActivatedRoute);
 *
 *   ngOnInit(): void {
 *     const exercise = this.route.snapshot.data['exercise'] as EjerciciosDTO;
 *   }
 * }
 * ```
 */
export const exerciseDetailResolver: ResolveFn<EjerciciosDTO | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<EjerciciosDTO | null> => {
  const trainingService = inject(TrainingService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);
  const toastService = inject(ToastService);

  const id = route.paramMap.get('id');

  if (!id || isNaN(Number(id))) {
    toastService.error('ID de ejercicio inválido');
    router.navigate(['/entrenamiento']);
    return of(null);
  }

  loadingService.show();

  return trainingService.obtenerEjercicio(Number(id)).pipe(
    catchError((error) => {
      console.error('Error al cargar ejercicio en resolver:', error);
      toastService.error(`No se encontró el ejercicio con ID ${id}`);

      // Redirigir a la lista con mensaje de error en state
      router.navigate(['/entrenamiento'], {
        state: { error: `No existe el ejercicio con id ${id}` }
      });

      return of(null);
    }),
    finalize(() => {
      loadingService.hide();
    })
  );
};
