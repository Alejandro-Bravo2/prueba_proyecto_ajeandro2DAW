import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with a default theme', () => {
    // El servicio inicializa con el tema del sistema o light por defecto
    expect(['light', 'dark']).toContain(service.currentTheme());
  });

  it('should set the theme correctly', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('cofira-theme')).toBe('dark');

    service.setTheme('light');
    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('cofira-theme')).toBe('light');
  });

  it('should toggle the theme correctly', () => {
    // Start with light theme
    service.setTheme('light');
    service.toggleTheme();
    expect(service.currentTheme()).toBe('dark');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('light');
  });

  it('should correctly report if theme is dark', () => {
    service.setTheme('dark');
    expect(service.isDark()).toBeTrue();
    service.setTheme('light');
    expect(service.isDark()).toBeFalse();
  });

  it('should persist theme to localStorage', () => {
    service.setTheme('dark');
    expect(localStorage.getItem('cofira-theme')).toBe('dark');
  });

  it('should apply theme to document element', () => {
    service.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
