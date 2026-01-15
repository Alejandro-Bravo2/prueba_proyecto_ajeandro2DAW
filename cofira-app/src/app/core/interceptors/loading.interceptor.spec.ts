import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('LoadingInterceptor', () => {
  let loadingService: jasmine.SpyObj<LoadingService>;
  let mockRequest: HttpRequest<any>;
  let mockNext: HttpHandlerFn;

  beforeEach(() => {
    loadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [{ provide: LoadingService, useValue: loadingService }],
    });

    mockRequest = new HttpRequest('GET', '/api/test');
  });

  describe('Loading State Management', () => {
    it('should call show() before request starts', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should call hide() after request completes successfully', fakeAsync(() => {
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should call hide() after request fails', fakeAsync(() => {
      const error = new Error('Request failed');
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => error).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            /* expected error */
          },
        });
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should call show() exactly once per request', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('should call hide() exactly once per request', fakeAsync(() => {
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalledTimes(1);
    }));

    it('should call show() before hide()', fakeAsync(() => {
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));
      const callOrder: string[] = [];

      loadingService.show.and.callFake(() => callOrder.push('show'));
      loadingService.hide.and.callFake(() => callOrder.push('hide'));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });

      tick(1);
      expect(callOrder).toEqual(['show', 'hide']);
    }));
  });

  describe('Multiple Concurrent Requests', () => {
    it('should call show() for each concurrent request', () => {
      const response = new HttpResponse({ body: {} });
      const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(of(response));
      const mockNext2 = jasmine.createSpy('mockNext2').and.returnValue(of(response));
      const mockNext3 = jasmine.createSpy('mockNext3').and.returnValue(of(response));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext1).subscribe();
        loadingInterceptor(mockRequest, mockNext2).subscribe();
        loadingInterceptor(mockRequest, mockNext3).subscribe();
      });

      expect(loadingService.show).toHaveBeenCalledTimes(3);
    });

    it('should call hide() for each concurrent request', fakeAsync(() => {
      const response = new HttpResponse({ body: {} });
      const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(of(response).pipe(delay(0)));
      const mockNext2 = jasmine.createSpy('mockNext2').and.returnValue(of(response).pipe(delay(0)));
      const mockNext3 = jasmine.createSpy('mockNext3').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext1).subscribe();
        loadingInterceptor(mockRequest, mockNext2).subscribe();
        loadingInterceptor(mockRequest, mockNext3).subscribe();
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalledTimes(3);
    }));

    it('should handle mix of successful and failed requests', fakeAsync(() => {
      const response = new HttpResponse({ body: {} });
      const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(of(response).pipe(delay(0)));
      const mockNext2 = jasmine
        .createSpy('mockNext2')
        .and.returnValue(throwError(() => new Error('Error')).pipe(delay(0)));
      const mockNext3 = jasmine.createSpy('mockNext3').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext1).subscribe();
        loadingInterceptor(mockRequest, mockNext2).subscribe({
          error: () => {
            /* expected */
          },
        });
        loadingInterceptor(mockRequest, mockNext3).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalledTimes(3);
      expect(loadingService.hide).toHaveBeenCalledTimes(3);
    }));
  });

  describe('Different HTTP Methods', () => {
    it('should handle GET requests', fakeAsync(() => {
      const getRequest = new HttpRequest('GET', '/api/users');
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(getRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should handle POST requests', fakeAsync(() => {
      const postRequest = new HttpRequest('POST', '/api/users', { name: 'Test' });
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(postRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should handle PUT requests', fakeAsync(() => {
      const putRequest = new HttpRequest('PUT', '/api/users/1', { name: 'Updated' });
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(putRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should handle PATCH requests', fakeAsync(() => {
      const patchRequest = new HttpRequest('PATCH', '/api/users/1', { name: 'Patched' });
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(patchRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should handle DELETE requests', fakeAsync(() => {
      const deleteRequest = new HttpRequest('DELETE', '/api/users/1');
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(deleteRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('Error Handling', () => {
    it('should hide loading on HTTP error', fakeAsync(() => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => new Error('HTTP Error')).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            /* expected */
          },
        });
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should hide loading on network error', fakeAsync(() => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => new Error('Network Error')).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            /* expected */
          },
        });
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should hide loading on timeout error', fakeAsync(() => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => new Error('Timeout')).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            /* expected */
          },
        });
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should not call hide() twice if error occurs', fakeAsync(() => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => new Error('Error')).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            /* expected */
          },
        });
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Response Handling', () => {
    it('should not modify response data', (done) => {
      const responseData = { id: 1, name: 'Test User', email: 'test@example.com' };
      const httpResponse = new HttpResponse({ body: responseData, status: 200 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(httpResponse));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe((response: any) => {
          if (response.body) {
            expect(response.body).toEqual(responseData);
          }
          done();
        });
      });
    });

    it('should pass through all response events', (done) => {
      const httpResponse = new HttpResponse({ body: { data: 'test' }, status: 200 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(httpResponse));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe((response: any) => {
          expect(response).toEqual(httpResponse);
          done();
        });
      });
    });
  });

  describe('Timing and Performance', () => {
    it('should show loading before request is sent', () => {
      let showCalled = false;
      let nextCalled = false;

      loadingService.show.and.callFake(() => {
        showCalled = true;
        expect(nextCalled).toBe(false, 'show should be called before next');
      });

      mockNext = jasmine.createSpy('mockNext').and.callFake(() => {
        nextCalled = true;
        expect(showCalled).toBe(true, 'show should be called before next');
        return of({} as HttpEvent<any>);
      });

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });
    });

    it('should hide loading after response is received', (done) => {
      let responseReceived = false;

      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(of({} as HttpEvent<any>).pipe(delay(10)));

      loadingService.hide.and.callFake(() => {
        expect(responseReceived).toBe(true, 'Response should be received before hide');
      });

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          responseReceived = true;
          setTimeout(() => {
            expect(loadingService.hide).toHaveBeenCalled();
            done();
          }, 20);
        });
      });
    });
  });

  describe('Service Integration', () => {
    it('should inject LoadingService', () => {
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });

      expect(loadingService.show).toHaveBeenCalled();
    });

    it('should work with LoadingService methods', fakeAsync(() => {
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('Observable Behavior', () => {
    it('should complete the observable after hiding loading', fakeAsync(() => {
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));
      let completed = false;

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          complete: () => {
            completed = true;
          },
        });
      });

      tick(1);
      expect(completed).toBeTrue();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should propagate errors after hiding loading', fakeAsync(() => {
      const testError = new Error('Test Error');
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => testError).pipe(delay(0)));
      let receivedError: unknown = null;

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            receivedError = error;
          },
        });
      });

      tick(1);
      expect(loadingService.hide).toHaveBeenCalled();
      expect((receivedError as Error)?.message).toBe('Test Error');
    }));
  });

  describe('Edge Cases', () => {
    it('should handle empty response', fakeAsync(() => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(null as any).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should handle undefined response', fakeAsync(() => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(undefined as any).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should handle very fast requests', fakeAsync(() => {
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('Request URL Patterns', () => {
    it('should handle requests to internal API', fakeAsync(() => {
      const internalRequest = new HttpRequest('GET', 'http://localhost:3000/api/users');
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(internalRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should handle requests to external API', fakeAsync(() => {
      const externalRequest = new HttpRequest('GET', 'https://api.external.com/data');
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(externalRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('should handle relative URLs', fakeAsync(() => {
      const relativeRequest = new HttpRequest('GET', '/api/users');
      const response = new HttpResponse({ body: {} });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(response).pipe(delay(0)));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(relativeRequest, mockNext).subscribe();
      });

      tick(1);
      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });
});
