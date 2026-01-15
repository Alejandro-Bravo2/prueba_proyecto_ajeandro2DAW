import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

/**
 * Componente de pagina 404 - Not Found
 *
 * Se muestra cuando el usuario navega a una ruta que no existe.
 * Configurado como ruta wildcard (**) en app.routes.ts
 *
 * @example
 * // En app.routes.ts
 * { path: '**', component: NotFoundComponent }
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private router = inject(Router);

  /** URL actual que no fue encontrada */
  currentUrl = this.router.url;

  /** Sugerencias de navegacion */
  suggestions = [
    { path: '/', label: 'Inicio', icon: 'home' },
    { path: '/entrenamiento', label: 'Entrenamiento', icon: 'fitness' },
    { path: '/alimentacion', label: 'Alimentacion', icon: 'nutrition' },
    { path: '/seguimiento', label: 'Seguimiento', icon: 'progress' },
  ];

  /**
   * Navega a la pagina anterior usando el historial del navegador
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Navega a la pagina de inicio
   */
  goHome(): void {
    this.router.navigate(['/']);
  }
}
