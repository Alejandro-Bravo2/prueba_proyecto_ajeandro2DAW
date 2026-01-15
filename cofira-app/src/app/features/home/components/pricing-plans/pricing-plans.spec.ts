import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { PricingPlans } from './pricing-plans';
import { AuthService } from '../../../../core/auth/auth.service';

describe('PricingPlans', () => {
  let component: PricingPlans;
  let fixture: ComponentFixture<PricingPlans>;
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    authService.isLoggedIn.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [PricingPlans],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingPlans);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login when user is not authenticated', () => {
    authService.isLoggedIn.and.returnValue(false);
    component.selectPlan('MENSUAL');

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { redirect: '/checkout', plan: 'MENSUAL' },
    });
  });

  it('should redirect to checkout when user is authenticated', () => {
    authService.isLoggedIn.and.returnValue(true);
    component.selectPlan('ANUAL');

    expect(router.navigate).toHaveBeenCalledWith(['/checkout'], {
      queryParams: { plan: 'ANUAL' },
    });
  });
});
