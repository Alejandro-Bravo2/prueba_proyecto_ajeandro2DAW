import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { FoodItem } from './food-item';

describe('FoodItem', () => {
  let component: FoodItem;
  let fixture: ComponentFixture<FoodItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodItem],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
