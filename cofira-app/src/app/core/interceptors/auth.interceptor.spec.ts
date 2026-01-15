import { TestBed } from '@angular/core/testing';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpHeaders,
} from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { Observable, of } from 'rxjs';

describe('AuthInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let mockRequest: HttpRequest<any>;
  let mockNext: HttpHandlerFn;

  beforeEach(() => {
    // Create spy for AuthService
    authService = jasmine.createSpyObj('AuthService', ['getToken']);

    // Setup TestBed
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
    });

    // Create mock HTTP request
    mockRequest = new HttpRequest('GET', '/api/test');

    // Create mock next handler
    mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));
  });

  describe('Token Management', () => {
    it('should add Authorization header when token exists', (done) => {
      const mockToken = 'test-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.has('Authorization')).toBe(true);
          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });

    it('should not add Authorization header when token is null', (done) => {
      authService.getToken.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.has('Authorization')).toBe(false);
          done();
        });
      });
    });

    it('should not add Authorization header when token is empty string', (done) => {
      authService.getToken.and.returnValue('');

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.has('Authorization')).toBe(false);
          done();
        });
      });
    });

    it('should not modify other headers when adding Authorization', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);

      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('X-Custom-Header', 'custom-value');

      const requestWithHeaders = new HttpRequest('GET', '/api/test', null, {
        headers: headers,
      });

      TestBed.runInInjectionContext(() => {
        authInterceptor(requestWithHeaders, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Content-Type')).toBe('application/json');
          expect(modifiedRequest.headers.get('X-Custom-Header')).toBe('custom-value');
          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });
  });

  describe('Request Cloning', () => {
    it('should not modify original request', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);

      const originalHeaders = mockRequest.headers;

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(mockRequest.headers).toBe(originalHeaders);
          expect(mockRequest.headers.has('Authorization')).toBe(false);
          done();
        });
      });
    });

    it('should create a new request instance when token exists', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest).not.toBe(mockRequest);
          done();
        });
      });
    });

    it('should pass original request when no token exists', (done) => {
      authService.getToken.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const passedRequest = call.args[0] as HttpRequest<any>;

          expect(passedRequest).toBe(mockRequest);
          done();
        });
      });
    });
  });

  describe('Different HTTP Methods', () => {
    it('should add Authorization header for GET requests', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);
      const request = new HttpRequest('GET', '/api/test');

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });

    it('should add Authorization header for POST requests', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);
      const request = new HttpRequest('POST', '/api/test', { data: 'test' });

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });

    it('should add Authorization header for PUT requests', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);
      const request = new HttpRequest('PUT', '/api/test', { data: 'test' });

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });

    it('should add Authorization header for PATCH requests', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);
      const request = new HttpRequest('PATCH', '/api/test', { data: 'test' });

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });

    it('should add Authorization header for DELETE requests', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);
      const request = new HttpRequest('DELETE', '/api/test');

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });
  });

  describe('Multiple Requests', () => {
    it('should handle multiple concurrent requests independently', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);

      const request1 = new HttpRequest('GET', '/api/endpoint1');
      const request2 = new HttpRequest('POST', '/api/endpoint2', { data: 'test' });
      const request3 = new HttpRequest('PUT', '/api/endpoint3', { data: 'test' });

      let completedRequests = 0;
      const checkDone = () => {
        completedRequests++;
        if (completedRequests === 3) done();
      };

      TestBed.runInInjectionContext(() => {
        authInterceptor(request1, mockNext).subscribe(() => {
          const modifiedRequest = (mockNext as jasmine.Spy).calls.all()[0].args[0];
          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          checkDone();
        });

        authInterceptor(request2, mockNext).subscribe(() => {
          const modifiedRequest = (mockNext as jasmine.Spy).calls.all()[1].args[0];
          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          checkDone();
        });

        authInterceptor(request3, mockNext).subscribe(() => {
          const modifiedRequest = (mockNext as jasmine.Spy).calls.all()[2].args[0];
          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          checkDone();
        });
      });
    });
  });

  describe('Special Characters in Token', () => {
    it('should handle tokens with special characters', (done) => {
      const mockToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      authService.getToken.and.returnValue(mockToken);

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });

    it('should handle tokens with unicode characters', (done) => {
      const mockToken = 'token-with-unicode-✓-✗-♠-♣';
      authService.getToken.and.returnValue(mockToken);

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });
  });

  describe('AuthService Integration', () => {
    it('should call AuthService.getToken() exactly once per request', (done) => {
      authService.getToken.and.returnValue('test-token');

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(authService.getToken).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('should handle AuthService.getToken() returning undefined', (done) => {
      authService.getToken.and.returnValue(undefined as any);

      TestBed.runInInjectionContext(() => {
        authInterceptor(mockRequest, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const passedRequest = call.args[0] as HttpRequest<any>;

          expect(passedRequest.headers.has('Authorization')).toBe(false);
          done();
        });
      });
    });
  });

  describe('URL Patterns', () => {
    it('should add token to requests to internal API', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);
      const request = new HttpRequest('GET', 'http://localhost:3000/api/users');

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });

    it('should add token to requests to external API', (done) => {
      const mockToken = 'test-token';
      authService.getToken.and.returnValue(mockToken);
      const request = new HttpRequest('GET', 'https://api.external.com/data');

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe(() => {
          const call = (mockNext as jasmine.Spy).calls.mostRecent();
          const modifiedRequest = call.args[0] as HttpRequest<any>;

          expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
          done();
        });
      });
    });
  });
});
