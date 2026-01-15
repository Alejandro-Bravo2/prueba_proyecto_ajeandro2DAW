import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  Renderer2,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Directiva que muestra un tooltip al hacer hover o focus sobre el elemento.
 * Implementa Renderer2 para manipulación segura del DOM (SSR-safe).
 *
 * @example
 * ```html
 * <button appTooltip="Guardar cambios" tooltipPosition="top" [tooltipDelay]="300">
 *   Guardar
 * </button>
 * ```
 *
 * @description
 * Esta directiva crea tooltips accesibles con las siguientes características:
 * - Delay configurable para evitar parpadeo (por defecto 300ms)
 * - Animación fade-in/fade-out suave
 * - Flecha indicadora de dirección
 * - Soporte completo de accesibilidad (aria-describedby)
 * - Manipulación segura del DOM mediante Renderer2
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  /**
   * Texto a mostrar en el tooltip
   */
  tooltipText = input<string>('', { alias: 'appTooltip' });

  /**
   * Posición del tooltip relativa al elemento (top, bottom, left, right)
   */
  tooltipPosition = input<TooltipPosition>('top', { alias: 'tooltipPosition' });

  /**
   * Delay en milisegundos antes de mostrar el tooltip (por defecto 300ms)
   * Permite evitar tooltips que aparecen accidentalmente al pasar el cursor
   */
  tooltipDelay = input<number>(300);

  // Inyección de dependencias usando inject() para mejor rendimiento
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Token DOCUMENT inyectado para acceso SSR-safe al documento.
   * @description Evita el uso directo de 'document' global
   */
  private readonly document = inject(DOCUMENT);

  // Estado interno del tooltip
  private tooltipElement: HTMLElement | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly OFFSET = 8; // Píxeles de separación del elemento

  // ID único para accesibilidad (aria-describedby)
  private readonly tooltipId = `tooltip-${Math.random().toString(36).substring(2, 11)}`;

  /**
   * Muestra el tooltip cuando el mouse entra en el elemento.
   * Usa delay configurable para evitar tooltips accidentales.
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.scheduleShow();
  }

  /**
   * Oculta el tooltip cuando el mouse sale del elemento.
   * Cancela cualquier timeout pendiente de mostrar el tooltip.
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.cancelScheduledShow();
    this.hideTooltip();
  }

  /**
   * Oculta el tooltip cuando el elemento pierde el foco (accesibilidad).
   * Importante para usuarios que navegan con teclado.
   */
  @HostListener('blur')
  onBlur(): void {
    this.cancelScheduledShow();
    this.hideTooltip();
  }

  /**
   * Muestra el tooltip cuando el elemento recibe el foco (accesibilidad).
   * Permite a usuarios de teclado ver tooltips al navegar.
   */
  @HostListener('focus')
  onFocus(): void {
    this.scheduleShow();
  }

  /**
   * Programa la visualización del tooltip después del delay configurado.
   * Esto evita tooltips que aparecen accidentalmente al pasar el cursor.
   */
  private scheduleShow(): void {
    // Verificar que estamos en el navegador (SSR-safe)
    if (!isPlatformBrowser(this.platformId)) return;

    this.cancelScheduledShow();
    this.showTimeout = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay());
  }

  /**
   * Cancela cualquier timeout pendiente de mostrar el tooltip.
   */
  private cancelScheduledShow(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }

  /**
   * Crea y muestra el tooltip usando Renderer2 para manipulación segura del DOM.
   *
   * Renderer2 proporciona:
   * - Seguridad SSR (Server-Side Rendering)
   * - Abstracción de la plataforma
   * - Mejor rendimiento en detección de cambios
   */
  private showTooltip(): void {
    const text = this.tooltipText();
    if (!text || this.tooltipElement) return;

    // Crear elemento del tooltip usando Renderer2 (SSR-safe)
    this.tooltipElement = this.renderer.createElement('div');

    // Añadir clases usando Renderer2
    this.renderer.addClass(this.tooltipElement, 'c-tooltip');
    this.renderer.addClass(this.tooltipElement, `c-tooltip--${this.tooltipPosition()}`);

    // Crear elemento de texto y añadirlo al tooltip
    const textNode = this.renderer.createText(text);
    this.renderer.appendChild(this.tooltipElement, textNode);

    // Crear flecha indicadora usando Renderer2
    const arrowElement = this.renderer.createElement('span');
    this.renderer.addClass(arrowElement, 'c-tooltip__arrow');
    this.renderer.appendChild(this.tooltipElement, arrowElement);

    // Configurar atributos de accesibilidad usando Renderer2
    this.renderer.setAttribute(this.tooltipElement, 'role', 'tooltip');
    this.renderer.setAttribute(this.tooltipElement, 'id', this.tooltipId);

    // Añadir aria-describedby al elemento host para accesibilidad
    this.renderer.setAttribute(
      this.elementRef.nativeElement,
      'aria-describedby',
      this.tooltipId
    );

    // Agregar al DOM usando Renderer2 con DOCUMENT token (SSR-safe)
    this.renderer.appendChild(this.document.body, this.tooltipElement);

    // Posicionar el tooltip usando Renderer2
    this.positionTooltip();

    // Activar animación fade-in después de un frame para que CSS transition funcione
    requestAnimationFrame(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'c-tooltip--visible');
      }
    });
  }

  /**
   * Elimina el tooltip del DOM usando Renderer2.
   * También limpia el atributo aria-describedby del elemento host.
   */
  private hideTooltip(): void {
    if (this.tooltipElement) {
      // Primero quitar la clase visible para animar fade-out
      this.renderer.removeClass(this.tooltipElement, 'c-tooltip--visible');

      // Esperar a que termine la animación antes de remover
      const tooltipToRemove = this.tooltipElement;
      setTimeout(() => {
        if (tooltipToRemove && tooltipToRemove.parentNode) {
          // Eliminar del DOM usando Renderer2 con DOCUMENT token (SSR-safe)
          this.renderer.removeChild(this.document.body, tooltipToRemove);
        }
      }, 200); // Duración de la animación fade-out

      this.tooltipElement = null;

      // Limpiar aria-describedby del elemento host
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
    }
  }

  /**
   * Calcula y aplica la posición del tooltip según la posición configurada.
   * Usa Renderer2.setStyle() para aplicar estilos de forma segura.
   */
  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostElement = this.elementRef.nativeElement as HTMLElement;
    const hostRect = hostElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const position = this.tooltipPosition();

    let top = 0;
    let left = 0;

    // Calcular posición según la configuración
    switch (position) {
      case 'top':
        top = hostRect.top - tooltipRect.height - this.OFFSET;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;

      case 'bottom':
        top = hostRect.bottom + this.OFFSET;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;

      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left - tooltipRect.width - this.OFFSET;
        break;

      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + this.OFFSET;
        break;
    }

    // Ajustar si el tooltip se sale de la pantalla
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = this.OFFSET;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - this.OFFSET;
    }
    if (top < 0) top = this.OFFSET;
    if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - this.OFFSET;
    }

    // Aplicar estilos usando Renderer2 (SSR-safe)
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  /**
   * Limpia el tooltip y timeouts al destruir la directiva.
   * Importante para evitar memory leaks.
   */
  ngOnDestroy(): void {
    this.cancelScheduledShow();
    // Eliminación inmediata al destruir (sin animación)
    // Usar this.document para SSR-safety
    if (this.tooltipElement && this.tooltipElement.parentNode) {
      this.renderer.removeChild(this.document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
    // Limpiar aria-describedby
    this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
  }
}
