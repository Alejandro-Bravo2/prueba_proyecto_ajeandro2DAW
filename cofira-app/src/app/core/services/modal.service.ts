import { Injectable, signal, Type, Renderer2, RendererFactory2, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Servicio para gestionar modales con manipulación del DOM segura para SSR.
 *
 * @description
 * Este servicio utiliza Renderer2 para manipulación del DOM, asegurando:
 * - Compatibilidad con Server-Side Rendering (SSR)
 * - Abstracción de la plataforma
 * - Integración correcta con la detección de cambios de Angular
 *
 * @example
 * ```typescript
 * // Abrir un modal con un componente
 * modalService.open(ConfirmacionModalComponent, { titulo: 'Confirmar acción' });
 *
 * // Cerrar el modal activo
 * modalService.close();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  /**
   * Token DOCUMENT inyectado para acceso SSR-safe al documento.
   * @description Evita el uso directo de 'document' global
   */
  private readonly document = inject(DOCUMENT);

  /**
   * Factory para crear instancias de Renderer2.
   */
  private readonly rendererFactory = inject(RendererFactory2);

  /**
   * Instancia de Renderer2 para manipulación segura del DOM.
   * @description Creada via RendererFactory2 para uso en servicios
   */
  private readonly renderer: Renderer2 = this.rendererFactory.createRenderer(null, null);

  /**
   * Signal que contiene el modal activo y sus inputs.
   * @description null cuando no hay modal abierto
   */
  private activeModal = signal<{ component: Type<unknown>, inputs: Record<string, unknown> } | null>(null);

  /**
   * Abre un modal con el componente especificado.
   * Usa Renderer2.addClass para bloqueo de scroll SSR-safe.
   *
   * @param component - El tipo de componente a renderizar en el modal
   * @param inputs - Inputs opcionales para pasar al componente
   *
   * @example
   * ```typescript
   * modalService.open(EditarPerfilComponent, { usuarioId: 123 });
   * ```
   */
  open<T>(component: Type<T>, inputs?: Record<string, unknown>): void {
    this.activeModal.set({ component, inputs: inputs || {} });
    // Usar Renderer2 para manipulación SSR-safe del DOM
    this.renderer.addClass(this.document.body, 'modal-open');
  }

  /**
   * Cierra el modal activo.
   * Usa Renderer2.removeClass para limpieza SSR-safe.
   *
   * @example
   * ```typescript
   * modalService.close();
   * ```
   */
  close(): void {
    this.activeModal.set(null);
    // Usar Renderer2 para manipulación SSR-safe del DOM
    this.renderer.removeClass(this.document.body, 'modal-open');
  }

  /**
   * Expone el signal del modal activo como readonly para suscripción.
   *
   * @returns Signal readonly del modal activo
   *
   * @example
   * ```typescript
   * effect(() => {
   *   const modal = modalService.activeModal$();
   *   if (modal) {
   *     console.log('Modal abierto:', modal.component.name);
   *   }
   * });
   * ```
   */
  get activeModal$() {
    return this.activeModal.asReadonly();
  }
}
