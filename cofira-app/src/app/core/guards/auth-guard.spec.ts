import { TestBed } from '@angular/core/testing';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { authGuard } from './auth-guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    });

    router = TestBed.inject(Router);
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/entrenamiento' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user is logged in', () => {
    authService.isLoggedIn.and.returnValue(true);

    const result = executeGuard(mockRoute, mockState);

    expect(result).toBeTrue();
  });

  it('should redirect to login when user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);

    const result = executeGuard(mockRoute, mockState);

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain('/login');
  });

  it('should include returnUrl query param when redirecting', () => {
    authService.isLoggedIn.and.returnValue(false);
    mockState = { url: '/preferencias/cuenta' } as RouterStateSnapshot;

    const result = executeGuard(mockRoute, mockState);

    expect(result).toBeInstanceOf(UrlTree);
    const urlTree = result as UrlTree;
    expect(urlTree.queryParams['returnUrl']).toBe('/preferencias/cuenta');
  });

  it('should handle root URL correctly', () => {
    authService.isLoggedIn.and.returnValue(false);
    mockState = { url: '/' } as RouterStateSnapshot;

    const result = executeGuard(mockRoute, mockState);

    expect(result).toBeInstanceOf(UrlTree);
  });
});
