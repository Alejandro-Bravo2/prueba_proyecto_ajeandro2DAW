import { Injectable, signal, inject, PLATFORM_ID, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

/**
 * Servicio de gestión de temas (claro/oscuro) con detección en tiempo real.
 *
 * @description
 * Características implementadas:
 * - Detección de preferencia del sistema (prefers-color-scheme)
 * - Listener en tiempo real para cambios del sistema (matchMedia.addEventListener)
 * - Persistencia en localStorage
 * - SSR-safe con PLATFORM_ID check y DOCUMENT token
 * - Manipulación del DOM con Renderer2 para compatibilidad SSR
 *
 * @example
 * ```typescript
 * // En componente
 * themeService = inject(ThemeService);
 *
 * // Leer tema actual
 * const isDark = this.themeService.isDark();
 *
 * // Cambiar tema
 * this.themeService.toggleTheme();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  /**
   * PLATFORM_ID inyectado para verificar si estamos en el navegador (SSR-safe).
   */
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Token DOCUMENT inyectado para acceso SSR-safe al documento.
   * @description Evita el uso directo de 'document' global
   */
  private readonly document = inject(DOCUMENT);

  /**
   * Instancia de Renderer2 para manipulación segura del DOM.
   * @description Creada via RendererFactory2 para uso en servicios
   */
  private readonly renderer: Renderer2;

  /**
   * Signal para el tema actual.
   * @description Valor por defecto 'light'
   */
  currentTheme = signal<Theme>('light');

  /**
   * Referencia al MediaQueryList para poder eliminar el listener.
   */
  private mediaQuery: MediaQueryList | null = null;

  /**
   * Referencia al handler para poder eliminarlo en OnDestroy.
   */
  private mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor(rendererFactory: RendererFactory2) {
    // En servicios, usamos RendererFactory2 para crear una instancia de Renderer2
    this.renderer = rendererFactory.createRenderer(null, null);

    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
      this.listenToSystemChanges();
    }
  }

  /**
   * Limpieza del listener al destruir el servicio.
   * @description Previene memory leaks eliminando el event listener
   */
  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaQueryHandler) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryHandler);
    }
  }

  /**
   * Inicializa el tema desde localStorage o preferencia del sistema.
   * @description Prioridad: localStorage > preferencia del sistema > light (default)
   */
  private initTheme(): void {
    // 1. Intentar leer de localStorage
    const savedTheme = localStorage.getItem('cofira-theme') as Theme | null;

    if (savedTheme) {
      this.setTheme(savedTheme);
      return;
    }

    // 2. Si no hay guardado, detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme: Theme = prefersDark ? 'dark' : 'light';
    this.setTheme(defaultTheme);
  }

  /**
   * Escucha cambios en la preferencia del sistema en tiempo real.
   * Usa matchMedia.addEventListener para detectar cuando el usuario
   * cambia el tema del sistema operativo.
   *
   * @description Solo actualiza si el usuario no ha establecido preferencia manual.
   */
  private listenToSystemChanges(): void {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler para cambios del sistema en tiempo real
    this.mediaQueryHandler = (e: MediaQueryListEvent) => {
      // Solo actualizar si el usuario no ha guardado una preferencia manual
      const savedTheme = localStorage.getItem('cofira-theme');
      if (!savedTheme) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Registrar listener con addEventListener (método moderno)
    this.mediaQuery.addEventListener('change', this.mediaQueryHandler);
  }

  /**
   * Establece el tema de la aplicación usando Renderer2 para manipulación SSR-safe.
   * Actualiza el atributo data-theme en el elemento raíz del documento.
   *
   * @param theme - El tema a aplicar ('light' o 'dark')
   *
   * @example
   * ```typescript
   * themeService.setTheme('dark');
   * ```
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    // Usar Renderer2 para manipulación SSR-safe del DOM
    this.renderer.setAttribute(this.document.documentElement, 'data-theme', theme);

    // Guardar en localStorage solo si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cofira-theme', theme);
    }
  }

  /**
   * Alterna entre tema claro y oscuro.
   *
   * @example
   * ```typescript
   * themeService.toggleTheme();
   * ```
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Verifica si el tema actual es oscuro.
   *
   * @returns true si el tema actual es 'dark'
   *
   * @example
   * ```typescript
   * if (themeService.isDark()) {
   *   console.log('Modo oscuro activo');
   * }
   * ```
   */
  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
