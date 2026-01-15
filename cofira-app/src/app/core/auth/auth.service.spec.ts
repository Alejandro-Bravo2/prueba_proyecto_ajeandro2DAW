import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Mock de AuthResponse según la interfaz real del backend
  const mockAuthResponse = {
    token: 'mock-jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    rol: 'USER',
    isOnboarded: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user successfully', (done) => {
      service.register('Test User', 'testuser', 'test@example.com', 'password123').subscribe({
        next: (response) => {
          expect(response.token).toBe('mock-jwt-token');
          expect(response.email).toBe('test@example.com');
          expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        nombre: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      req.flush(mockAuthResponse);
    });

    it('should handle registration error', (done) => {
      service.register('Test User', 'testuser', 'test@example.com', 'password123').subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should login user successfully', (done) => {
      service.login('testuser', 'password123').subscribe({
        next: (response) => {
          expect(response.token).toBe('mock-jwt-token');
          expect(response.email).toBe('test@example.com');
          expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'testuser',
        password: 'password123',
      });
      req.flush(mockAuthResponse);
    });

    it('should handle login with wrong password', (done) => {
      service.login('testuser', 'wrongpassword').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle login with non-existent user', (done) => {
      service.login('nonexistent', 'password123').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'User not found' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear token and user data', () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: 1, name: 'Test' }));

      service.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('authToken', 'mock-token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const token = 'mock-jwt-token';
      localStorage.setItem('authToken', token);
      expect(service.getToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('saveToken', () => {
    it('should save token to localStorage', () => {
      service.saveToken('test-token');
      expect(localStorage.getItem('authToken')).toBe('test-token');
    });
  });
});
