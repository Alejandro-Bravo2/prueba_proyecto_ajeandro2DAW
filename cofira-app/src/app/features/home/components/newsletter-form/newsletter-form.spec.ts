import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { NewsletterForm } from './newsletter-form';

describe('NewsletterForm', () => {
  let component: NewsletterForm;
  let fixture: ComponentFixture<NewsletterForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsletterForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
