import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { FeedbackForm } from './feedback-form';

describe('FeedbackForm', () => {
  let component: FeedbackForm;
  let fixture: ComponentFixture<FeedbackForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
