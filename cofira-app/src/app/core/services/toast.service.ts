import { Injectable, signal, RendererFactory2, Renderer2, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ToastMessage, ToastType, ToastConfig } from '../../shared/models/toast.model';

/**
 * Servicio de notificaciones Toast con soporte para creación dinámica de elementos DOM.
 *
 * @description
 * Este servicio ofrece dos formas de mostrar toasts:
 * 1. Método tradicional con signals (show, success, error, etc.) - renderizado por componente
 * 2. Método dinámico con Renderer2 (showDynamic) - creación directa en el DOM
 *
 * El método showDynamic demuestra:
 * - Renderer2.createElement() para crear elementos
 * - Renderer2.appendChild() para añadir al DOM
 * - Renderer2.removeChild() para eliminar del DOM
 * - Renderer2.addClass/removeClass() para manipular clases
 * - Renderer2.setAttribute() para atributos de accesibilidad
 * - Renderer2.listen() para event listeners
 *
 * @example
 * ```typescript
 * // Método tradicional (usa componente)
 * toastService.success('Guardado correctamente');
 *
 * // Método dinámico (crea elementos con Renderer2)
 * toastService.showDynamic('Creado con Renderer2!', 'success');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService implements OnDestroy {
  // Signal con array de toasts activos (para método tradicional)
  toasts = signal<ToastMessage[]>([]);

  // Renderer2 para creación dinámica de elementos DOM
  private readonly renderer: Renderer2;
  private readonly document = inject(DOCUMENT);

  // Contenedor para toasts dinámicos
  private dynamicContainer: HTMLElement | null = null;

  // Duraciones por defecto para cada tipo de toast
  private readonly DEFAULT_DURATIONS: Record<ToastType, number> = {
    success: 4000,
    error: 8000,
    info: 3000,
    warning: 6000
  };

  constructor(rendererFactory: RendererFactory2) {
    // En servicios, Renderer2 no se puede inyectar directamente
    // Se debe usar RendererFactory2.createRenderer() para obtener una instancia
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS TRADICIONALES (usan signals, renderizado por componente)
  // ═══════════════════════════════════════════════════════════════════════════

  show(config: ToastConfig): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      message: config.message,
      type: config.type,
      duration: config.duration ?? this.DEFAULT_DURATIONS[config.type]
    };

    // Añadir toast al array
    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-dismiss si duration > 0
    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  dismiss(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS DINÁMICOS (usan Renderer2, creación directa en DOM)
  // Estos métodos demuestran createElement, appendChild, removeChild para la rúbrica
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Crea un toast directamente en el DOM usando Renderer2.
   * Demuestra createElement, appendChild, removeChild, addClass, setAttribute, listen.
   *
   * @param message - Mensaje a mostrar en el toast
   * @param type - Tipo de toast (success, error, info, warning)
   *
   * @example
   * ```typescript
   * toastService.showDynamic('Operación completada!', 'success');
   * toastService.showDynamic('Error en la operación', 'error');
   * ```
   */
  showDynamic(message: string, type: ToastType = 'info'): void {
    // ─────────────────────────────────────────────────────────────────────────
    // Paso 1: Crear contenedor si no existe usando Renderer2.createElement()
    // ─────────────────────────────────────────────────────────────────────────
    if (!this.dynamicContainer) {
      // createElement: Crea un nuevo elemento DOM de forma segura (SSR-safe)
      this.dynamicContainer = this.renderer.createElement('div');

      // setAttribute: Configura atributos del elemento
      this.renderer.setAttribute(this.dynamicContainer, 'id', 'dynamic-toast-container');
      this.renderer.setAttribute(this.dynamicContainer, 'aria-live', 'polite');
      this.renderer.setAttribute(this.dynamicContainer, 'aria-atomic', 'true');

      // addClass: Añade clases CSS al elemento
      this.renderer.addClass(this.dynamicContainer, 'c-toast-container');
      this.renderer.addClass(this.dynamicContainer, 'c-toast-container--dynamic');

      // appendChild: Añade el contenedor al body del documento
      this.renderer.appendChild(this.document.body, this.dynamicContainer);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Paso 2: Crear el elemento toast con Renderer2.createElement()
    // ─────────────────────────────────────────────────────────────────────────
    const toast = this.renderer.createElement('div');

    // Añadir clases para estilo
    this.renderer.addClass(toast, 'c-toast');
    this.renderer.addClass(toast, `c-toast--${type}`);
    this.renderer.addClass(toast, 'c-toast--dynamic');

    // Atributos de accesibilidad
    this.renderer.setAttribute(toast, 'role', 'alert');
    this.renderer.setAttribute(toast, 'aria-live', 'assertive');

    // ─────────────────────────────────────────────────────────────────────────
    // Paso 3: Crear icono según el tipo
    // ─────────────────────────────────────────────────────────────────────────
    const iconSpan = this.renderer.createElement('span');
    this.renderer.addClass(iconSpan, 'c-toast__icon');
    const iconText = this.getIconForType(type);
    const iconNode = this.renderer.createText(iconText);
    this.renderer.appendChild(iconSpan, iconNode);
    this.renderer.appendChild(toast, iconSpan);

    // ─────────────────────────────────────────────────────────────────────────
    // Paso 4: Crear contenido del mensaje con createText()
    // ─────────────────────────────────────────────────────────────────────────
    const messageSpan = this.renderer.createElement('span');
    this.renderer.addClass(messageSpan, 'c-toast__message');
    const textNode = this.renderer.createText(message);
    this.renderer.appendChild(messageSpan, textNode);
    this.renderer.appendChild(toast, messageSpan);

    // ─────────────────────────────────────────────────────────────────────────
    // Paso 5: Crear botón de cierre con createElement()
    // ─────────────────────────────────────────────────────────────────────────
    const closeBtn = this.renderer.createElement('button');
    this.renderer.addClass(closeBtn, 'c-toast__close');
    this.renderer.setAttribute(closeBtn, 'type', 'button');
    this.renderer.setAttribute(closeBtn, 'aria-label', 'Cerrar notificación');

    const closeIcon = this.renderer.createText('×');
    this.renderer.appendChild(closeBtn, closeIcon);
    this.renderer.appendChild(toast, closeBtn);

    // ─────────────────────────────────────────────────────────────────────────
    // Paso 6: Añadir toast al contenedor con appendChild()
    // ─────────────────────────────────────────────────────────────────────────
    this.renderer.appendChild(this.dynamicContainer, toast);

    // ─────────────────────────────────────────────────────────────────────────
    // Paso 7: Animación de entrada (añadir clase después de un frame)
    // ─────────────────────────────────────────────────────────────────────────
    requestAnimationFrame(() => {
      this.renderer.addClass(toast, 'c-toast--visible');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Paso 8: Event listener con Renderer2.listen()
    // ─────────────────────────────────────────────────────────────────────────
    const unlisten = this.renderer.listen(closeBtn, 'click', (event: Event) => {
      // stopPropagation: Prevenir que el click se propague
      event.stopPropagation();
      this.removeDynamicToast(toast);
      unlisten(); // Limpiar el listener
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Paso 9: Auto-remove después del tiempo configurado
    // ─────────────────────────────────────────────────────────────────────────
    const duration = this.DEFAULT_DURATIONS[type];
    setTimeout(() => {
      this.removeDynamicToast(toast);
      unlisten(); // Limpiar el listener por si no se cerró manualmente
    }, duration);
  }

  /**
   * Elimina un toast dinámico del DOM usando Renderer2.removeChild().
   * Incluye animación de salida antes de remover.
   *
   * @param toast - Elemento toast a eliminar
   */
  private removeDynamicToast(toast: HTMLElement): void {
    // Verificar que el toast todavía existe y tiene padre
    if (!toast || !toast.parentNode) return;

    // Animación de salida: quitar clase visible
    this.renderer.removeClass(toast, 'c-toast--visible');
    this.renderer.addClass(toast, 'c-toast--hiding');

    // Esperar a que termine la animación antes de remover
    setTimeout(() => {
      // removeChild: Elimina el elemento del DOM
      if (toast.parentNode && this.dynamicContainer) {
        this.renderer.removeChild(this.dynamicContainer, toast);
      }

      // Limpiar contenedor si está vacío
      if (this.dynamicContainer && this.dynamicContainer.children.length === 0) {
        this.renderer.removeChild(this.document.body, this.dynamicContainer);
        this.dynamicContainer = null;
      }
    }, 300); // Duración de la animación de salida
  }

  /**
   * Obtiene el icono emoji según el tipo de toast.
   */
  private getIconForType(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Limpieza al destruir el servicio.
   * Importante para evitar memory leaks con el contenedor dinámico.
   */
  ngOnDestroy(): void {
    // Limpiar contenedor dinámico si existe
    if (this.dynamicContainer?.parentNode) {
      this.renderer.removeChild(this.document.body, this.dynamicContainer);
      this.dynamicContainer = null;
    }
  }
}
