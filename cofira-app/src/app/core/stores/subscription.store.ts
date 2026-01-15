import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CheckoutService } from '../../features/checkout/services/checkout.service';
import { AuthService } from '../auth/auth.service';
import {
  SubscripcionEstado,
  TipoPlan,
  MetodoPago
} from '../../features/checkout/models/checkout.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionStore {
  private readonly checkoutService = inject(CheckoutService);
  private readonly authService = inject(AuthService);

  // Estado privado
  private readonly _subscripcionActiva = signal(false);
  private readonly _tipoPlan = signal<TipoPlan | null>(null);
  private readonly _nombrePlan = signal<string | null>(null);
  private readonly _precio = signal<number | null>(null);
  private readonly _fechaInicio = signal<string | null>(null);
  private readonly _fechaFin = signal<string | null>(null);
  private readonly _diasRestantes = signal(0);
  private readonly _metodoPago = signal<MetodoPago | null>(null);
  private readonly _ultimosDigitosTarjeta = signal<string | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Estado publico readonly
  readonly subscripcionActiva = this._subscripcionActiva.asReadonly();
  readonly tipoPlan = this._tipoPlan.asReadonly();
  readonly nombrePlan = this._nombrePlan.asReadonly();
  readonly precio = this._precio.asReadonly();
  readonly fechaInicio = this._fechaInicio.asReadonly();
  readonly fechaFin = this._fechaFin.asReadonly();
  readonly diasRestantes = this._diasRestantes.asReadonly();
  readonly metodoPago = this._metodoPago.asReadonly();
  readonly ultimosDigitosTarjeta = this._ultimosDigitosTarjeta.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed
  readonly estado = computed<SubscripcionEstado>(() => ({
    activa: this._subscripcionActiva(),
    tipoPlan: this._tipoPlan() ?? undefined,
    nombrePlan: this._nombrePlan() ?? undefined,
    precio: this._precio() ?? undefined,
    fechaInicio: this._fechaInicio() ?? undefined,
    fechaFin: this._fechaFin() ?? undefined,
    diasRestantes: this._diasRestantes(),
    metodoPago: this._metodoPago() ?? undefined,
    ultimosDigitosTarjeta: this._ultimosDigitosTarjeta() ?? undefined
  }));

  readonly isPremium = computed(() => this._subscripcionActiva());

  readonly badgeText = computed(() => {
    if (!this._subscripcionActiva()) return null;
    const tipo = this._tipoPlan();
    if (tipo === 'ANUAL') return 'PRO';
    return 'PREMIUM';
  });

  constructor() {
    // Cargar estado cuando el usuario se autentique
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.cargarEstado();
      } else {
        this.limpiar();
      }
    });
  }

  cargarEstado(): void {
    this._loading.set(true);
    this._error.set(null);

    this.checkoutService
      .obtenerEstadoSubscripcion()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (estado) => this.actualizarDesdeRespuesta(estado),
        error: (err) => {
          console.error('Error cargando estado de subscripcion:', err);
          this._error.set('Error al cargar estado de subscripcion');
        }
      });
  }

  actualizarEstado(estado: SubscripcionEstado): void {
    this.actualizarDesdeRespuesta(estado);
  }

  private actualizarDesdeRespuesta(estado: SubscripcionEstado): void {
    this._subscripcionActiva.set(estado.activa ?? false);
    this._tipoPlan.set(estado.tipoPlan ?? null);
    this._nombrePlan.set(estado.nombrePlan ?? null);
    this._precio.set(estado.precio ?? null);
    this._fechaInicio.set(estado.fechaInicio ?? null);
    this._fechaFin.set(estado.fechaFin ?? null);
    this._diasRestantes.set(estado.diasRestantes ?? 0);
    this._metodoPago.set(estado.metodoPago ?? null);
    this._ultimosDigitosTarjeta.set(estado.ultimosDigitosTarjeta ?? null);
  }

  limpiar(): void {
    this._subscripcionActiva.set(false);
    this._tipoPlan.set(null);
    this._nombrePlan.set(null);
    this._precio.set(null);
    this._fechaInicio.set(null);
    this._fechaFin.set(null);
    this._diasRestantes.set(0);
    this._metodoPago.set(null);
    this._ultimosDigitosTarjeta.set(null);
    this._error.set(null);
  }
}
