import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal para estado de loading
  isLoading = signal<boolean>(false);

  // Contador de requests pendientes
  private requestCount = 0;

  show(): void {
    this.requestCount++;
    this.isLoading.set(true);
  }

  hide(): void {
    this.requestCount--;

    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.isLoading.set(false);
    }
  }

  reset(): void {
    this.requestCount = 0;
    this.isLoading.set(false);
  }
}
