import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CheckoutRequest,
  CheckoutResponse,
  SubscripcionEstado
} from '../models/checkout.model';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/checkout`;

  procesarPago(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.API_URL}/procesar`, request);
  }

  cancelarSubscripcion(): Observable<{ mensaje: string; estado: string }> {
    return this.http.post<{ mensaje: string; estado: string }>(
      `${this.API_URL}/cancelar`,
      {}
    );
  }

  obtenerEstadoSubscripcion(): Observable<SubscripcionEstado> {
    return this.http.get<SubscripcionEstado>(`${this.API_URL}/estado`);
  }
}
