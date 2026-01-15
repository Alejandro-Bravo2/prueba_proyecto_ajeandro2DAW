import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { StepsIndicator } from './steps-indicator';

describe('StepsIndicator', () => {
  let component: StepsIndicator;
  let fixture: ComponentFixture<StepsIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepsIndicator],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StepsIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
