import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { loggingInterceptor } from './logging.interceptor';
import { Observable, of, throwError, delay } from 'rxjs';

describe('LoggingInterceptor', () => {
  let mockRequest: HttpRequest<any>;
  let mockNext: HttpHandlerFn;
  let consoleSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    consoleSpy = spyOn(console, 'log');
    consoleErrorSpy = spyOn(console, 'error');
    mockRequest = new HttpRequest('GET', '/api/test');
  });

  describe('Successful Requests', () => {
    it('should log successful request completion', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          expect(logMessage).toContain('HTTP Request');
          expect(logMessage).toContain('GET');
          expect(logMessage).toContain('/api/test');
          expect(logMessage).toContain('completed in');
          expect(logMessage).toContain('ms');
          done();
        });
      });
    });

    it('should include request method in log', (done) => {
      const postRequest = new HttpRequest('POST', '/api/users', { name: 'Test' });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(postRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          expect(logMessage).toContain('POST');
          done();
        });
      });
    });

    it('should include URL with params in log', (done) => {
      const requestWithParams = new HttpRequest('GET', '/api/users', {
        params: { page: '1', limit: '10' },
      });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(requestWithParams, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          expect(logMessage).toContain('/api/users');
          done();
        });
      });
    });

    it('should measure and log elapsed time', (done) => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(of({} as HttpEvent<any>).pipe(delay(100)));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          const timeMatch = logMessage.match(/(\d+)\s*ms/);
          expect(timeMatch).toBeTruthy();
          if (timeMatch) {
            const elapsed = parseInt(timeMatch[1], 10);
            expect(elapsed).toBeGreaterThanOrEqual(0);
          }
          done();
        });
      });
    });

    it('should log elapsed time in milliseconds', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          expect(logMessage).toMatch(/\d+\s*ms/);
          done();
        });
      });
    });
  });

  describe('Failed Requests', () => {
    it('should log failed request with error', (done) => {
      const error = new Error('Request failed');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            const errorArgs = consoleErrorSpy.calls.mostRecent().args;
            expect(errorArgs[0]).toContain('HTTP Request');
            expect(errorArgs[0]).toContain('GET');
            expect(errorArgs[0]).toContain('/api/test');
            expect(errorArgs[0]).toContain('failed in');
            expect(errorArgs[0]).toContain('ms');
            expect(errorArgs[1]).toBe(error);
            done();
          },
        });
      });
    });

    it('should log HTTP error responses', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'Not Found',
        status: 404,
        statusText: 'Not Found',
        url: '/api/test',
      });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => errorResponse));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            const errorArgs = consoleErrorSpy.calls.mostRecent().args;
            expect(errorArgs[0]).toContain('failed in');
            expect(errorArgs[1]).toBe(errorResponse);
            done();
          },
        });
      });
    });

    it('should log elapsed time on error', (done) => {
      const error = new Error('Network error');
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => error).pipe(delay(50)));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            const errorMessage = consoleErrorSpy.calls.mostRecent().args[0];
            expect(errorMessage).toMatch(/\d+\s*ms/);
            done();
          },
        });
      });
    });

    it('should include error object in log', (done) => {
      const customError = new Error('Custom error message');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => customError));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            const errorArgs = consoleErrorSpy.calls.mostRecent().args;
            expect(errorArgs[1]).toBe(customError);
            done();
          },
        });
      });
    });

    it('should log with "error:" label', (done) => {
      const error = new Error('Test error');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            const errorMessage = consoleErrorSpy.calls.mostRecent().args[0];
            expect(errorMessage).toContain('with error:');
            done();
          },
        });
      });
    });
  });

  describe('Different HTTP Methods', () => {
    ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach((method) => {
      it(`should log ${method} requests correctly`, (done) => {
        let request: HttpRequest<any>;

        if (method === 'GET' || method === 'DELETE') {
          request = new HttpRequest(method as any, '/api/test');
        } else {
          request = new HttpRequest(method as any, '/api/test', { data: 'test' });
        }

        mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

        TestBed.runInInjectionContext(() => {
          loggingInterceptor(request, mockNext).subscribe(() => {
            expect(consoleSpy).toHaveBeenCalled();
            const logMessage = consoleSpy.calls.mostRecent().args[0];
            expect(logMessage).toContain(method);
            done();
          });
        });
      });
    });
  });

  describe('Response Handling', () => {
    it('should not modify response data', (done) => {
      const responseData = { id: 1, name: 'Test' };
      const httpResponse = new HttpResponse({ body: responseData, status: 200 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(httpResponse));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe((response: any) => {
          if (response.body) {
            expect(response.body).toEqual(responseData);
          }
          done();
        });
      });
    });

    it('should pass through response events unmodified', (done) => {
      const httpResponse = new HttpResponse({ body: { data: 'test' }, status: 200 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(httpResponse));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe((response: any) => {
          expect(response).toEqual(httpResponse);
          done();
        });
      });
    });

    it('should log even for empty responses', (done) => {
      const emptyResponse = new HttpResponse({ body: null, status: 204 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(emptyResponse));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('Multiple Requests', () => {
    it('should log each request independently', (done) => {
      const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(of({} as HttpEvent<any>));
      const mockNext2 = jasmine.createSpy('mockNext2').and.returnValue(of({} as HttpEvent<any>));
      const mockNext3 = jasmine.createSpy('mockNext3').and.returnValue(of({} as HttpEvent<any>));

      let completedRequests = 0;
      const checkDone = () => {
        completedRequests++;
        if (completedRequests === 3) {
          expect(consoleSpy).toHaveBeenCalledTimes(3);
          done();
        }
      };

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext1).subscribe(() => checkDone());
        loggingInterceptor(mockRequest, mockNext2).subscribe(() => checkDone());
        loggingInterceptor(mockRequest, mockNext3).subscribe(() => checkDone());
      });
    });

    it('should track timing for each request separately', (done) => {
      const request1 = new HttpRequest('GET', '/api/endpoint1');
      const request2 = new HttpRequest('GET', '/api/endpoint2');

      const mockNext1 = jasmine
        .createSpy('mockNext1')
        .and.returnValue(of({} as HttpEvent<any>).pipe(delay(10)));
      const mockNext2 = jasmine
        .createSpy('mockNext2')
        .and.returnValue(of({} as HttpEvent<any>).pipe(delay(50)));

      let completedRequests = 0;
      const checkDone = () => {
        completedRequests++;
        if (completedRequests === 2) {
          expect(consoleSpy).toHaveBeenCalledTimes(2);
          done();
        }
      };

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(request1, mockNext1).subscribe(() => checkDone());
        loggingInterceptor(request2, mockNext2).subscribe(() => checkDone());
      });
    });

    it('should handle mix of successful and failed requests', (done) => {
      const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(of({} as HttpEvent<any>));
      const mockNext2 = jasmine
        .createSpy('mockNext2')
        .and.returnValue(throwError(() => new Error('Error')));

      let completedRequests = 0;
      const checkDone = () => {
        completedRequests++;
        if (completedRequests === 2) {
          expect(consoleSpy).toHaveBeenCalledTimes(1);
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
          done();
        }
      };

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext1).subscribe(() => checkDone());
        loggingInterceptor(mockRequest, mockNext2).subscribe({
          error: () => checkDone(),
        });
      });
    });
  });

  describe('URL Patterns', () => {
    it('should log requests to absolute URLs', (done) => {
      const absoluteRequest = new HttpRequest('GET', 'http://localhost:3000/api/users');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(absoluteRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          expect(logMessage).toContain('http://localhost:3000/api/users');
          done();
        });
      });
    });

    it('should log requests to relative URLs', (done) => {
      const relativeRequest = new HttpRequest('GET', '/api/users');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(relativeRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          expect(logMessage).toContain('/api/users');
          done();
        });
      });
    });

    it('should log requests with query parameters', (done) => {
      const url = '/api/users?page=1&limit=10';
      const paramsRequest = new HttpRequest('GET', url);
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(paramsRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          expect(logMessage).toContain('/api/users');
          done();
        });
      });
    });
  });

  describe('Timing Accuracy', () => {
    it('should measure time starting from request initiation', (done) => {
      const startTime = Date.now();
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(of({} as HttpEvent<any>).pipe(delay(100)));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe(() => {
          const endTime = Date.now();
          const actualElapsed = endTime - startTime;

          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          const timeMatch = logMessage.match(/(\d+)\s*ms/);

          if (timeMatch) {
            const loggedElapsed = parseInt(timeMatch[1], 10);
            expect(loggedElapsed).toBeGreaterThanOrEqual(0);
            expect(loggedElapsed).toBeLessThanOrEqual(actualElapsed + 50);
          }
          done();
        });
      });
    });

    it('should show 0 or small value for very fast requests', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          const timeMatch = logMessage.match(/(\d+)\s*ms/);

          if (timeMatch) {
            const elapsed = parseInt(timeMatch[1], 10);
            expect(elapsed).toBeGreaterThanOrEqual(0);
            expect(elapsed).toBeLessThan(100);
          }
          done();
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests with special characters in URL', (done) => {
      const specialRequest = new HttpRequest('GET', '/api/users/test@example.com');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(specialRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          const logMessage = consoleSpy.calls.mostRecent().args[0];
          expect(logMessage).toContain('/api/users/test@example.com');
          done();
        });
      });
    });

    it('should handle very long URLs', (done) => {
      const longUrl = '/api/users?' + 'param=value&'.repeat(50);
      const longRequest = new HttpRequest('GET', longUrl);
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(longRequest, mockNext).subscribe(() => {
          expect(consoleSpy).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle null error gracefully', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => null));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should handle undefined error gracefully', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => undefined));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            done();
          },
        });
      });
    });
  });

  describe('Observable Behavior', () => {
    it('should not prevent request from completing', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          complete: () => {
            expect(mockNext).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should propagate errors correctly', (done) => {
      const testError = new Error('Propagation test');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => testError));

      TestBed.runInInjectionContext(() => {
        loggingInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            expect(error).toBe(testError);
            done();
          },
        });
      });
    });
  });
});
