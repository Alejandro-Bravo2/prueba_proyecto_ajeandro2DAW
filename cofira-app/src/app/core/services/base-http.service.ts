import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { environment } from '../../../environments/environment';

export interface HttpOptions {
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  headers?: { [header: string]: string | string[] };
}

@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {
  private API_BASE_URL = environment.apiUrl; // Backend URL from environment

  constructor(protected http: HttpClient, private loadingService: LoadingService) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}
Message: ${error.message}`;
    }
    console.error(errorMessage);
    // Optionally re-throw to propagate error to component
    return throwError(() => new Error(errorMessage));
  }

  private request<T>(method: string, endpoint: string, data?: any, options?: HttpOptions): Observable<T> {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    // Check if endpoint is already a full URL
    const url = endpoint.startsWith('http') ? endpoint : `${this.API_BASE_URL}/${cleanEndpoint}`;
    this.loadingService.show();

    let requestObservable: Observable<T>;

    switch (method.toLowerCase()) {
      case 'get':
        requestObservable = this.http.get<T>(url, options);
        break;
      case 'post':
        requestObservable = this.http.post<T>(url, data, options);
        break;
      case 'put':
        requestObservable = this.http.put<T>(url, data, options);
        break;
      case 'delete':
        requestObservable = this.http.delete<T>(url, options);
        break;
      default:
        return throwError(() => new Error('Unsupported HTTP method'));
    }

    return requestObservable.pipe(
      retry(2), // Retry failed requests twice
      catchError(this.handleError),
      finalize(() => this.loadingService.hide())
    );
  }

  get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.request<T>('get', endpoint, undefined, options);
  }

  post<T>(endpoint: string, data: any, options?: HttpOptions): Observable<T> {
    return this.request<T>('post', endpoint, data, options);
  }

  put<T>(endpoint: string, data: any, options?: HttpOptions): Observable<T> {
    return this.request<T>('put', endpoint, data, options);
  }

  delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.request<T>('delete', endpoint, undefined, options);
  }
}
