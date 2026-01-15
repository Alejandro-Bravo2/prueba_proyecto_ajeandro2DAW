import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { WeeklyTable } from './weekly-table';

describe('WeeklyTable', () => {
  let component: WeeklyTable;
  let fixture: ComponentFixture<WeeklyTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyTable],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
