import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../services/toast.service';
import { Observable, throwError, of } from 'rxjs';

describe('ErrorInterceptor', () => {
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;
  let mockRequest: HttpRequest<any>;
  let mockNext: HttpHandlerFn;

  beforeEach(() => {
    toastService = jasmine.createSpyObj('ToastService', ['error', 'warning', 'success', 'info']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router },
      ],
    });

    mockRequest = new HttpRequest('GET', '/api/test');
  });

  describe('HTTP Error Status Codes', () => {
    describe('401 - Unauthorized', () => {
      it('should show error toast and redirect to login on 401', (done) => {
        const errorResponse = new HttpErrorResponse({
          error: 'Unauthorized',
          status: 401,
          statusText: 'Unauthorized',
          url: '/api/test',
        });

        mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

        TestBed.runInInjectionContext(() => {
          errorInterceptor(mockRequest, mockNext).subscribe({
            error: (error) => {
              expect(toastService.error).toHaveBeenCalledWith(
                'Acceso no autorizado. Por favor, inicia sesión de nuevo.'
              );
              expect(router.navigate).toHaveBeenCalledWith(['/login']);
              expect(error.message).toContain('Acceso no autorizado');
              done();
            },
          });
        });
      });

      it('should log error message to console on 401', (done) => {
        spyOn(console, 'error');
        const errorResponse = new HttpErrorResponse({
          error: 'Unauthorized',
          status: 401,
          statusText: 'Unauthorized',
        });

        mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

        TestBed.runInInjectionContext(() => {
          errorInterceptor(mockRequest, mockNext).subscribe({
            error: () => {
              expect(console.error).toHaveBeenCalled();
              done();
            },
          });
        });
      });

      it('should call navigate exactly once on 401', (done) => {
        const errorResponse = new HttpErrorResponse({ status: 401 });
        mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

        TestBed.runInInjectionContext(() => {
          errorInterceptor(mockRequest, mockNext).subscribe({
            error: () => {
              expect(router.navigate).toHaveBeenCalledTimes(1);
              done();
            },
          });
        });
      });
    });

    describe('403 - Forbidden', () => {
      it('should show warning toast on 403', (done) => {
        const errorResponse = new HttpErrorResponse({
          error: 'Forbidden',
          status: 403,
          statusText: 'Forbidden',
        });

        mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

        TestBed.runInInjectionContext(() => {
          errorInterceptor(mockRequest, mockNext).subscribe({
            error: (error) => {
              expect(toastService.warning).toHaveBeenCalledWith(
                'No tienes permiso para acceder a este recurso.'
              );
              expect(router.navigate).not.toHaveBeenCalled();
              done();
            },
          });
        });
      });

      it('should not redirect on 403', (done) => {
        const errorResponse = new HttpErrorResponse({ status: 403 });
        mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

        TestBed.runInInjectionContext(() => {
          errorInterceptor(mockRequest, mockNext).subscribe({
            error: () => {
              expect(router.navigate).not.toHaveBeenCalled();
              done();
            },
          });
        });
      });
    });

    describe('404 - Not Found', () => {
      it('should show warning toast on 404', (done) => {
        const errorResponse = new HttpErrorResponse({
          error: 'Not Found',
          status: 404,
          statusText: 'Not Found',
        });

        mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

        TestBed.runInInjectionContext(() => {
          errorInterceptor(mockRequest, mockNext).subscribe({
            error: (error) => {
              expect(toastService.warning).toHaveBeenCalledWith(
                'El recurso solicitado no se encontró.'
              );
              expect(router.navigate).not.toHaveBeenCalled();
              done();
            },
          });
        });
      });
    });

    describe('500 - Internal Server Error', () => {
      it('should show error toast on 500', (done) => {
        const errorResponse = new HttpErrorResponse({
          error: 'Internal Server Error',
          status: 500,
          statusText: 'Internal Server Error',
        });

        mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

        TestBed.runInInjectionContext(() => {
          errorInterceptor(mockRequest, mockNext).subscribe({
            error: (error) => {
              expect(toastService.error).toHaveBeenCalledWith(
                'Error interno del servidor. Por favor, inténtalo más tarde.'
              );
              expect(router.navigate).not.toHaveBeenCalled();
              done();
            },
          });
        });
      });
    });

    describe('Other Status Codes', () => {
      [400, 408, 422, 429, 502, 503, 504].forEach((status) => {
        it(`should show error toast for status ${status}`, (done) => {
          const errorResponse = new HttpErrorResponse({
            status: status,
            statusText: `Error ${status}`,
          });

          mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

          TestBed.runInInjectionContext(() => {
            errorInterceptor(mockRequest, mockNext).subscribe({
              error: () => {
                // El interceptor muestra un mensaje genérico para estos códigos
                expect(toastService.error).toHaveBeenCalledWith(
                  'Ha ocurrido un error. Por favor, inténtalo de nuevo.'
                );
                done();
              },
            });
          });
        });
      });
    });
  });

  describe('Client-Side Errors', () => {
    it('should handle ErrorEvent (client-side errors)', (done) => {
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Connection timeout',
      });
      const errorResponse = new HttpErrorResponse({
        error: errorEvent,
        status: 0,
        statusText: 'Unknown Error',
      });

      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            expect(toastService.error).toHaveBeenCalled();
            const callArgs = toastService.error.calls.mostRecent().args[0];
            expect(callArgs).toContain('Error: Connection timeout');
            done();
          },
        });
      });
    });

    it('should handle network errors gracefully', (done) => {
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Failed to fetch',
      });
      const errorResponse = new HttpErrorResponse({
        error: errorEvent,
        status: 0,
      });

      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            expect(error.message).toContain('Failed to fetch');
            done();
          },
        });
      });
    });
  });

  describe('Successful Requests', () => {
    it('should not intercept successful requests', (done) => {
      const mockResponse = { data: 'success' };
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(mockResponse as any));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          next: (response) => {
            expect(toastService.error).not.toHaveBeenCalled();
            expect(toastService.warning).not.toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should pass through 2xx responses without modification', (done) => {
      const mockResponse = { status: 200, data: 'test' };
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(mockResponse as any));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          next: (response: any) => {
            expect(response).toEqual(mockResponse);
            done();
          },
        });
      });
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple concurrent errors independently', (done) => {
      const error1 = new HttpErrorResponse({ status: 401 });
      const error2 = new HttpErrorResponse({ status: 404 });
      const error3 = new HttpErrorResponse({ status: 500 });

      let errorCount = 0;
      const checkDone = () => {
        errorCount++;
        if (errorCount === 3) {
          expect(toastService.error).toHaveBeenCalledTimes(2); // 401 and 500
          expect(toastService.warning).toHaveBeenCalledTimes(1); // 404
          done();
        }
      };

      TestBed.runInInjectionContext(() => {
        const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(throwError(() => error1));
        errorInterceptor(mockRequest, mockNext1).subscribe({ error: () => checkDone() });

        const mockNext2 = jasmine.createSpy('mockNext2').and.returnValue(throwError(() => error2));
        errorInterceptor(mockRequest, mockNext2).subscribe({ error: () => checkDone() });

        const mockNext3 = jasmine.createSpy('mockNext3').and.returnValue(throwError(() => error3));
        errorInterceptor(mockRequest, mockNext3).subscribe({ error: () => checkDone() });
      });
    });
  });

  describe('Console Logging', () => {
    it('should always log errors to console', (done) => {
      spyOn(console, 'error');
      const errorResponse = new HttpErrorResponse({ status: 500 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(console.error).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should log error message with correct format', (done) => {
      spyOn(console, 'error');
      const errorResponse = new HttpErrorResponse({ status: 404 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            const consoleArgs = (console.error as jasmine.Spy).calls.mostRecent().args[0];
            expect(consoleArgs).toContain('El recurso solicitado no se encontró.');
            done();
          },
        });
      });
    });
  });

  describe('Error Response Structure', () => {
    it('should return Error object with message', (done) => {
      const errorResponse = new HttpErrorResponse({ status: 500 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBeTruthy();
            done();
          },
        });
      });
    });

    it('should include proper error message in thrown error', (done) => {
      const errorResponse = new HttpErrorResponse({ status: 403 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            expect(error.message).toBe('No tienes permiso para acceder a este recurso.');
            done();
          },
        });
      });
    });
  });

  describe('Service Injection', () => {
    it('should inject ToastService', (done) => {
      const errorResponse = new HttpErrorResponse({ status: 404 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(toastService.warning).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should inject Router', (done) => {
      const errorResponse = new HttpErrorResponse({ status: 401 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(router.navigate).toHaveBeenCalled();
            done();
          },
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle error with undefined status', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'Unknown error',
        status: undefined as any,
        statusText: 'Unknown',
      });

      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            expect(toastService.error).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should handle error with null error object', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: null,
        status: 500,
      });

      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            expect(toastService.error).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should handle error with custom error message from server', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Custom server error' },
        status: 400,
      });

      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(toastService.error).toHaveBeenCalled();
            done();
          },
        });
      });
    });
  });

  describe('Request Types', () => {
    it('should handle errors from GET requests', (done) => {
      const getRequest = new HttpRequest('GET', '/api/users');
      const errorResponse = new HttpErrorResponse({ status: 404 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(getRequest, mockNext).subscribe({
          error: () => {
            expect(toastService.warning).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should handle errors from POST requests', (done) => {
      const postRequest = new HttpRequest('POST', '/api/users', { name: 'Test' });
      const errorResponse = new HttpErrorResponse({ status: 500 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(postRequest, mockNext).subscribe({
          error: () => {
            expect(toastService.error).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should handle errors from DELETE requests', (done) => {
      const deleteRequest = new HttpRequest('DELETE', '/api/users/1');
      const errorResponse = new HttpErrorResponse({ status: 403 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        errorInterceptor(deleteRequest, mockNext).subscribe({
          error: () => {
            expect(toastService.warning).toHaveBeenCalled();
            done();
          },
        });
      });
    });
  });
});
