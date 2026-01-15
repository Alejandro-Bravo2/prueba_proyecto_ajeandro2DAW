import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente que muestra un estado vacío con icono, título, mensaje y acción opcional
 *
 * @example
 * ```html
 * <!-- Estado vacío básico -->
 * <app-empty-state
 *   icon="📭"
 *   title="No hay datos"
 *   message="Aún no tienes elementos para mostrar"
 * />
 *
 * <!-- Con acción -->
 * <app-empty-state
 *   icon="🏋️"
 *   title="No hay ejercicios"
 *   message="Comienza agregando tu primer ejercicio para ver tu progreso"
 *   actionLabel="Agregar ejercicio"
 *   (actionClicked)="openAddExerciseDialog()"
 * />
 *
 * <!-- Condicional -->
 * @if (exercises().length === 0) {
 *   <app-empty-state
 *     icon="🏋️"
 *     title="No hay ejercicios"
 *     message="Empieza a entrenar hoy"
 *     actionLabel="Crear rutina"
 *     (actionClicked)="createRoutine()"
 *   />
 * }
 * ```
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss'
})
export class EmptyState {
  /**
   * Icono o emoji a mostrar (opcional)
   */
  icon = input<string>('');

  /**
   * Título del estado vacío
   */
  title = input.required<string>();

  /**
   * Mensaje descriptivo del estado vacío
   */
  message = input.required<string>();

  /**
   * Texto del botón de acción principal (opcional)
   */
  actionLabel = input<string>('');

  /**
   * Texto del botón de acción secundaria (opcional)
   */
  secondaryActionLabel = input<string>('');

  /**
   * Tamaño del componente (small, medium, large)
   */
  size = input<'small' | 'medium' | 'large'>('medium');

  /**
   * Evento emitido cuando se hace clic en el botón de acción principal
   */
  actionClicked = output<void>();

  /**
   * Evento emitido cuando se hace clic en el botón de acción secundaria
   */
  secondaryActionClicked = output<void>();
}
