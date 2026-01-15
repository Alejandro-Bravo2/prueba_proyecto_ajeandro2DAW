import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

/**
 * Directiva que detecta clics fuera del elemento host
 *
 * @example
 * ```html
 * <div (appClickOutside)="closeDropdown()">
 *   <!-- Contenido del dropdown -->
 * </div>
 * ```
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  /**
   * Evento que se emite cuando se hace clic fuera del elemento
   */
  clickedOutside = output<void>({ alias: 'appClickOutside' });

  private elementRef = inject(ElementRef);

  /**
   * Escucha los clics en el documento y determina si fueron fuera del elemento
   * @param target - El elemento HTML que recibió el clic
   */
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickedOutside.emit();
    }
  }
}
