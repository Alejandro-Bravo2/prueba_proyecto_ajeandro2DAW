import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  output
} from '@angular/core';

/**
 * Directiva que detecta cuando el elemento entra en el viewport
 * para implementar infinite scroll usando IntersectionObserver
 *
 * @example
 * ```html
 * <!-- Sentinel al final del listado -->
 * <div appInfiniteScroll (scrolled)="loadMore()"></div>
 * ```
 *
 * @example
 * ```html
 * <!-- Con clase para ocultar el sentinel -->
 * <div
 *   class="infinite-scroll-sentinel"
 *   appInfiniteScroll
 *   (scrolled)="store.loadMore()"
 * ></div>
 * ```
 */
@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  /**
   * Evento que se emite cuando el elemento entra en el viewport
   * Usar este evento para cargar más datos
   */
  scrolled = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }

  /**
   * Configura el IntersectionObserver para detectar
   * cuando el elemento sentinel entra en el viewport
   */
  private setupObserver(): void {
    const options: IntersectionObserverInit = {
      root: null, // viewport como root
      rootMargin: '100px', // cargar antes de llegar al final
      threshold: 0.1 // 10% visible para activar
    };

    this.observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        this.scrolled.emit();
      }
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  /**
   * Desconecta el observer para evitar memory leaks
   */
  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
