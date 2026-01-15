import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AsyncValidatorsService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  emailUnique(excludeEmail?: string): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      }
      return timer(500).pipe(
        // Debounce for 500ms
        switchMap(() => {
          if (!control.value) {
            return of(null); // No value, no validation needed
          }
          if (control.value === excludeEmail) {
            return of(null); // Current email, no validation needed
          }
          // API call to check if email exists (Spring Boot endpoint)
          return this.http
            .get<any>(`${this.API_URL}/usuarios/email?email=${control.value}`)
            .pipe(
              map(() => {
                // If email exists (200 response), it's taken
                return { emailTaken: true };
              }),
              catchError((error) => {
                // 404 means email doesn't exist (unique)
                if (error.status === 404) {
                  return of(null);
                }
                // Connection error (status 0) - server not available
                if (error.status === 0) {
                  return of({ connectionError: true });
                }
                // Other errors, don't block validation
                return of(null);
              })
            );
        })
      );
    };
  }

  usernameUnique(excludeUsername?: string): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      }
      return timer(500).pipe(
        // Debounce for 500ms
        switchMap(() => {
          if (!control.value) {
            return of(null); // No value, no validation needed
          }
          if (control.value === excludeUsername) {
            return of(null); // Current username, no validation needed
          }
          // API call to check if username exists (Spring Boot endpoint)
          return this.http
            .get<any>(`${this.API_URL}/usuarios/username?username=${control.value}`)
            .pipe(
              map(() => {
                // If username exists (200 response), it's taken
                return { usernameTaken: true };
              }),
              catchError((error) => {
                // 404 means username doesn't exist (unique)
                if (error.status === 404) {
                  return of(null);
                }
                // Connection error (status 0) - server not available
                if (error.status === 0) {
                  return of({ connectionError: true });
                }
                // Other errors, don't block validation
                return of(null);
              })
            );
        })
      );
    };
  }
}
