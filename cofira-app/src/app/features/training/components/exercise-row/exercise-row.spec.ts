import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ExerciseRow } from './exercise-row';

describe('ExerciseRow', () => {
  let component: ExerciseRow;
  let fixture: ComponentFixture<ExerciseRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseRow],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseRow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
