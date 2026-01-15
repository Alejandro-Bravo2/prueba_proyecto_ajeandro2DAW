import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

/**
 * Componente hijo para las preferencias de notificaciones
 * Se renderiza dentro del router-outlet de PreferencesLayout
 *
 * Ruta: /preferencias/notificaciones
 */
@Component({
  selector: 'app-preferences-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preferences-notifications.html',
  styleUrl: './preferences-notifications.scss',
})
export class PreferencesNotifications {
  emailSettings = signal<NotificationSetting[]>([
    {
      id: 'training-reminders',
      label: 'Recordatorios de entrenamiento',
      description: 'Recibe un email cuando tengas un entrenamiento programado',
      enabled: true
    },
    {
      id: 'progress-updates',
      label: 'Actualizaciones de progreso',
      description: 'Resumen semanal de tu progreso y logros',
      enabled: true
    },
    {
      id: 'promotions',
      label: 'Novedades y promociones',
      description: 'Informacion sobre nuevas funciones y ofertas',
      enabled: false
    },
    {
      id: 'nutrition-tips',
      label: 'Consejos de nutricion',
      description: 'Tips personalizados basados en tus preferencias',
      enabled: true
    }
  ]);

  pushSettings = signal<NotificationSetting[]>([
    {
      id: 'daily-reminders',
      label: 'Recordatorios diarios',
      description: 'Notificacion diaria para mantener tu rutina',
      enabled: true
    },
    {
      id: 'achievements',
      label: 'Logros y objetivos cumplidos',
      description: 'Celebra tus victorias cuando alcances metas',
      enabled: false
    },
    {
      id: 'motivation',
      label: 'Mensajes de motivacion',
      description: 'Frases motivacionales para mantenerte enfocado',
      enabled: true
    }
  ]);

  toggleEmailSetting(id: string): void {
    this.emailSettings.update(settings =>
      settings.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  }

  togglePushSetting(id: string): void {
    this.pushSettings.update(settings =>
      settings.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  }

  enableAllEmail(): void {
    this.emailSettings.update(settings =>
      settings.map(s => ({ ...s, enabled: true }))
    );
  }

  disableAllEmail(): void {
    this.emailSettings.update(settings =>
      settings.map(s => ({ ...s, enabled: false }))
    );
  }

  enableAllPush(): void {
    this.pushSettings.update(settings =>
      settings.map(s => ({ ...s, enabled: true }))
    );
  }

  disableAllPush(): void {
    this.pushSettings.update(settings =>
      settings.map(s => ({ ...s, enabled: false }))
    );
  }
}
