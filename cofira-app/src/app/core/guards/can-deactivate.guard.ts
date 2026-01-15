import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Interfaz que deben implementar los componentes que quieran usar el guard canDeactivate
 *
 * @example
 * ```typescript
 * export class MyComponent implements CanComponentDeactivate {
 *   myForm = this.fb.group({...});
 *
 *   canDeactivate(): boolean {
 *     if (this.myForm.dirty) {
 *       return confirm('Tienes cambios sin guardar. ¿Estás seguro de salir?');
 *     }
 *     return true;
 *   }
 * }
 * ```
 */
export interface CanComponentDeactivate {
  /**
   * Método que determina si el componente puede ser desactivado (salir de la ruta)
   * @returns true si puede salir, false si debe permanecer, o un Observable<boolean>
   */
  canDeactivate: () => boolean | Observable<boolean>;
}

/**
 * Guard funcional que previene la navegación si hay cambios sin guardar
 *
 * Este guard verifica si el componente implementa la interfaz CanComponentDeactivate
 * y llama a su método canDeactivate() para determinar si se permite la navegación.
 *
 * @param component - Componente que implementa CanComponentDeactivate
 * @returns boolean o Observable<boolean> que indica si se permite la navegación
 *
 * @example
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'editar',
 *   component: EditComponent,
 *   canDeactivate: [canDeactivateGuard]
 * }
 *
 * // En el componente
 * export class EditComponent implements CanComponentDeactivate {
 *   editForm = this.fb.group({...});
 *
 *   canDeactivate(): boolean {
 *     if (this.editForm.dirty) {
 *       return confirm('¿Descartar cambios?');
 *     }
 *     return true;
 *   }
 * }
 * ```
 */
export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate
): boolean | Observable<boolean> => {
  // Verificar si el componente implementa el método canDeactivate
  if (component.canDeactivate) {
    return component.canDeactivate();
  }

  // Si no implementa el método, permitir la navegación
  return true;
};

/**
 * Versión mejorada del guard con mensajes personalizados
 *
 * @example
 * ```typescript
 * export class MyComponent implements CanComponentDeactivate {
 *   canDeactivate(): boolean {
 *     return this.confirmNavigation(
 *       'Tienes un formulario sin completar',
 *       '¿Estás seguro de que quieres salir?'
 *     );
 *   }
 *
 *   private confirmNavigation(title: string, message: string): boolean {
 *     // Aquí podrías usar un servicio de Modal personalizado
 *     return confirm(`${title}\n\n${message}`);
 *   }
 * }
 * ```
 */
