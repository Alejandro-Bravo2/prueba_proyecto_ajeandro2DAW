import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { Preferences } from './preferences';

describe('Preferences', () => {
  let component: Preferences;
  let fixture: ComponentFixture<Preferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Preferences],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(Preferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have tabs configuration', () => {
    expect(component.tabs.length).toBe(3);
    expect(component.tabs[0].id).toBe('nutrition');
    expect(component.tabs[1].id).toBe('account');
    expect(component.tabs[2].id).toBe('notifications');
  });

  it('should start with nutrition tab active', () => {
    expect(component.activeTab()).toBe('nutrition');
  });

  it('should change active tab', () => {
    component.onTabChanged('account');
    expect(component.activeTab()).toBe('account');

    component.onTabChanged('notifications');
    expect(component.activeTab()).toBe('notifications');
  });

  it('should have available allergies', () => {
    expect(component.availableAllergies.length).toBeGreaterThan(0);
  });

  it('should have available ingredients', () => {
    expect(component.availableIngredients.length).toBeGreaterThan(0);
  });
});
