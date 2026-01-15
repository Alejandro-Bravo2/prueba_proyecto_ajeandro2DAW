import { inject } from '@angular/core';
import { ResolveFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
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
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<AlimentoDTO[]> => {
  const nutritionService = inject(NutritionService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);
  const toastService = inject(ToastService);

  // Mostrar indicador de carga
  loadingService.show();

  return nutritionService.listarAlimentos().pipe(
    catchError((error) => {
      console.error('Error al cargar alimentos en resolver:', error);

      // Mostrar toast de error
      toastService.error('No se pudieron cargar los alimentos. Por favor, intenta más tarde.');

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
