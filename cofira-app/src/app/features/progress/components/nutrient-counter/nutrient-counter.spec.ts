import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { NutrientCounter } from './nutrient-counter';

describe('NutrientCounter', () => {
  let component: NutrientCounter;
  let fixture: ComponentFixture<NutrientCounter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutrientCounter],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NutrientCounter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
