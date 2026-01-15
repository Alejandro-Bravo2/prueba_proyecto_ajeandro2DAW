import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { StrengthGainChart } from './strength-gain-chart';

describe('StrengthGainChart', () => {
  let component: StrengthGainChart;
  let fixture: ComponentFixture<StrengthGainChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrengthGainChart],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StrengthGainChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
