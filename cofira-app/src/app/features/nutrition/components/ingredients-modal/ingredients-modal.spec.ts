import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { IngredientsModal } from './ingredients-modal';

describe('IngredientsModal', () => {
  let component: IngredientsModal;
  let fixture: ComponentFixture<IngredientsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsModal],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
