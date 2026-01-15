import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { DailyMenu } from './daily-menu';

describe('DailyMenu', () => {
  let component: DailyMenu;
  let fixture: ComponentFixture<DailyMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyMenu],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
