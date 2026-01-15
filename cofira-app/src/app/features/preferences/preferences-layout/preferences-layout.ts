import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * Layout component para las preferencias con rutas hijas anidadas
 *
 * Este componente demuestra el uso de child routes en Angular Router.
 * Contiene un <router-outlet> interno donde se renderizan los componentes hijos.
 *
 * @example
 * Estructura de rutas:
 * /preferencias          -> redirige a /preferencias/alimentacion
 * /preferencias/alimentacion -> PreferencesNutritionComponent
 * /preferencias/cuenta       -> PreferencesAccountComponent
 * /preferencias/notificaciones -> PreferencesNotificationsComponent
 */
@Component({
  selector: 'app-preferences-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './preferences-layout.html',
  styleUrl: './preferences-layout.scss',
})
export class PreferencesLayout {
  navItems = [
    { path: 'alimentacion', label: 'Alimentacion', icon: 'nutrition' },
    { path: 'cuenta', label: 'Cuenta', icon: 'account' },
    { path: 'notificaciones', label: 'Notificaciones', icon: 'notifications' }
  ];
}
