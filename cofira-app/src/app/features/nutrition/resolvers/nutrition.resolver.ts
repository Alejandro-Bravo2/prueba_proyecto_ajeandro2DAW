import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NutritionService, AlimentoDTO } from '../services/nutrition.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Resolver que pre-carga la lista de alimentos antes de activar la ruta de Nutrition
 *
 * @param route - Snapshot de la ruta activada
 * @param state - Estado del router
 * @returns Observable con la lista de alimentos o array vacío en caso de error
 *
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'alimentacion',
 *   loadComponent: () => import('./features/nutrition/nutrition').then(m => m.Nutrition),
 *   resolve: { foods: nutritionResolver }
 * }
 *
 * // En el componente Nutrition
 * export class Nutrition implements OnInit {
 *   private route = inject(ActivatedRoute);
 *   foods = signal<AlimentoDTO[]>([]);
 *
 *   ngOnInit(): void {
 *     const foods = this.route.snapshot.data['foods'] as AlimentoDTO[];
 *     this.foods.set(foods);
 *   }
 * }
 * ```
 */
export const nutritionResolver: ResolveFn<AlimentoDTO[]> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<AlimentoDTO[]> => {
  const nutritionService = inject(NutritionService);
  const loadingService = inject(LoadingService);
  const toastService = inject(ToastService);

  loadingService.show();

  return nutritionService.listarAlimentos().pipe(
    catchError(() => {
      toastService.error('No se pudieron cargar los alimentos. Por favor, intenta más tarde.');
      return of([]);
    }),
    finalize(() => {
      // Ocultar indicador de carga
      loadingService.hide();
    })
  );
};
