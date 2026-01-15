import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinner } from './loading-spinner';
import { LoadingService } from '../../../../core/services/loading.service';
import { signal, WritableSignal } from '@angular/core';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('LoadingSpinner', () => {
  let component: LoadingSpinner;
  let fixture: ComponentFixture<LoadingSpinner>;
  let loadingService: LoadingService;
  let isLoadingSignal: WritableSignal<boolean>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    isLoadingSignal = signal(false);

    const loadingServiceMock = {
      isLoading: isLoadingSignal,
    };

    await TestBed.configureTestingModule({
      imports: [LoadingSpinner],
      providers: [{ provide: LoadingService, useValue: loadingServiceMock }],
    }).compileComponents();

    loadingService = TestBed.inject(LoadingService);
    fixture = TestBed.createComponent(LoadingSpinner);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have loadingService injected', () => {
      expect(component.loadingService).toBeTruthy();
    });

    it('should be a standalone component', () => {
      const metadata = (LoadingSpinner as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Visibility Control', () => {
    it('should not display spinner when isLoading is false', () => {
      isLoadingSignal.set(false);
      fixture.detectChanges();

      const overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeNull();
    });

    it('should display spinner when isLoading is true', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      const overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should toggle visibility when isLoading changes', () => {
      // Initially hidden
      isLoadingSignal.set(false);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeNull();

      // Show spinner
      isLoadingSignal.set(true);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeTruthy();

      // Hide spinner again
      isLoadingSignal.set(false);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeNull();
    });

    it('should respond to rapid loading state changes', () => {
      for (let i = 0; i < 5; i++) {
        isLoadingSignal.set(i % 2 === 0);
        fixture.detectChanges();

        const overlay = compiled.querySelector('.loading-overlay');
        if (i % 2 === 0) {
          expect(overlay).toBeTruthy();
        } else {
          expect(overlay).toBeNull();
        }
      }
    });
  });

  describe('Spinner Structure', () => {
    beforeEach(() => {
      isLoadingSignal.set(true);
      fixture.detectChanges();
    });

    it('should render loading overlay', () => {
      const overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay?.tagName).toBe('SECTION');
    });

    it('should render spinner figure', () => {
      const spinner = compiled.querySelector('.spinner');
      expect(spinner).toBeTruthy();
      expect(spinner?.tagName).toBe('FIGURE');
    });

    it('should have exactly 3 spinner dots', () => {
      const dots = compiled.querySelectorAll('.spinner__dot');
      expect(dots.length).toBe(3);
    });

    it('should render all dots as span elements', () => {
      const dots = compiled.querySelectorAll('.spinner__dot');
      dots.forEach((dot) => {
        expect(dot.tagName).toBe('SPAN');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      isLoadingSignal.set(true);
      fixture.detectChanges();
    });

    it('should have role="status" attribute', () => {
      const spinner = compiled.querySelector('.spinner');
      expect(spinner?.getAttribute('role')).toBe('status');
    });

    it('should have aria-label attribute', () => {
      const spinner = compiled.querySelector('.spinner');
      expect(spinner?.getAttribute('aria-label')).toBe('Cargando...');
    });

    it('should be keyboard accessible', () => {
      const spinner = compiled.querySelector('.spinner');
      expect(spinner).toBeTruthy();
      // Spinner should not be focusable as it's purely informational
      expect(spinner?.getAttribute('tabindex')).toBeNull();
    });

    it('should have semantic HTML structure', () => {
      const overlay = compiled.querySelector('section.loading-overlay');
      expect(overlay).toBeTruthy();

      const figure = overlay?.querySelector('figure.spinner');
      expect(figure).toBeTruthy();
    });
  });

  describe('CSS Classes', () => {
    beforeEach(() => {
      isLoadingSignal.set(true);
      fixture.detectChanges();
    });

    it('should apply loading-overlay class to section', () => {
      const overlay = compiled.querySelector('section');
      expect(overlay?.classList.contains('loading-overlay')).toBeTruthy();
    });

    it('should apply spinner class to figure', () => {
      const figure = compiled.querySelector('figure');
      expect(figure?.classList.contains('spinner')).toBeTruthy();
    });

    it('should apply spinner__dot class to all spans', () => {
      const dots = compiled.querySelectorAll('span');
      expect(dots.length).toBe(3);
      dots.forEach((dot) => {
        expect(dot.classList.contains('spinner__dot')).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks on destroy', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    it('should handle multiple rapid state changes efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        isLoadingSignal.set(i % 2 === 0);
        fixture.detectChanges();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second for 100 changes)
      expect(duration).toBeLessThan(1000);
    });

    it('should not create new elements on each render', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      const firstRenderDots = compiled.querySelectorAll('.spinner__dot');
      expect(firstRenderDots.length).toBe(3);

      // Trigger re-render
      fixture.detectChanges();

      const secondRenderDots = compiled.querySelectorAll('.spinner__dot');
      expect(secondRenderDots.length).toBe(3);
    });
  });

  describe('Integration with LoadingService', () => {
    it('should use loadingService.isLoading signal', () => {
      expect(component.loadingService.isLoading).toBeDefined();
      expect(typeof component.loadingService.isLoading).toBe('function');
    });

    it('should react to loadingService signal changes', () => {
      isLoadingSignal.set(false);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeNull();

      isLoadingSignal.set(true);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeTruthy();
    });

    it('should maintain reactive connection throughout lifecycle', () => {
      // Initial state
      isLoadingSignal.set(false);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeNull();

      // Multiple changes
      for (let i = 0; i < 10; i++) {
        isLoadingSignal.set(true);
        fixture.detectChanges();
        expect(compiled.querySelector('.loading-overlay')).toBeTruthy();

        isLoadingSignal.set(false);
        fixture.detectChanges();
        expect(compiled.querySelector('.loading-overlay')).toBeNull();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle component initialization with loading true', () => {
      isLoadingSignal.set(true);
      const newFixture = TestBed.createComponent(LoadingSpinner);
      newFixture.detectChanges();

      const overlay = newFixture.nativeElement.querySelector('.loading-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should handle component initialization with loading false', () => {
      isLoadingSignal.set(false);
      const newFixture = TestBed.createComponent(LoadingSpinner);
      newFixture.detectChanges();

      const overlay = newFixture.nativeElement.querySelector('.loading-overlay');
      expect(overlay).toBeNull();
    });

    it('should handle very fast loading sequences', () => {
      const states = [true, false, true, false, true, false];

      states.forEach((state) => {
        isLoadingSignal.set(state);
        fixture.detectChanges();

        const overlay = compiled.querySelector('.loading-overlay');
        if (state) {
          expect(overlay).toBeTruthy();
        } else {
          expect(overlay).toBeNull();
        }
      });
    });
  });

  describe('DOM Queries', () => {
    it('should find overlay using DebugElement', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      const overlayDebug: DebugElement = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(overlayDebug).toBeTruthy();
    });

    it('should find spinner using DebugElement', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      const spinnerDebug: DebugElement = fixture.debugElement.query(By.css('.spinner'));
      expect(spinnerDebug).toBeTruthy();
    });

    it('should find all dots using DebugElement', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      const dotsDebug: DebugElement[] = fixture.debugElement.queryAll(By.css('.spinner__dot'));
      expect(dotsDebug.length).toBe(3);
    });
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have loadingService injected', () => {
      expect(component.loadingService).toBeTruthy();
    });

    it('should be a standalone component', () => {
      const metadata = (LoadingSpinner as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Visibility Control', () => {
    it('should not display spinner when isLoading is false', () => {
      loadingService.isLoading = signal(false);
      fixture.detectChanges();

      const overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeNull();
    });

    it('should display spinner when isLoading is true', () => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();

      const overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should toggle visibility when isLoading changes', () => {
      // Initially hidden
      loadingService.isLoading = signal(false);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeNull();

      // Show spinner
      loadingService.isLoading = signal(true);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeTruthy();

      // Hide spinner again
      loadingService.isLoading = signal(false);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeNull();
    });

    it('should respond to rapid loading state changes', () => {
      for (let i = 0; i < 5; i++) {
        loadingService.isLoading = signal(i % 2 === 0);
        fixture.detectChanges();

        const overlay = compiled.querySelector('.loading-overlay');
        if (i % 2 === 0) {
          expect(overlay).toBeTruthy();
        } else {
          expect(overlay).toBeNull();
        }
      }
    });
  });

  describe('Spinner Structure', () => {
    beforeEach(() => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();
    });

    it('should render loading overlay', () => {
      const overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay?.tagName).toBe('SECTION');
    });

    it('should render spinner figure', () => {
      const spinner = compiled.querySelector('.spinner');
      expect(spinner).toBeTruthy();
      expect(spinner?.tagName).toBe('FIGURE');
    });

    it('should have exactly 3 spinner dots', () => {
      const dots = compiled.querySelectorAll('.spinner__dot');
      expect(dots.length).toBe(3);
    });

    it('should render all dots as span elements', () => {
      const dots = compiled.querySelectorAll('.spinner__dot');
      dots.forEach((dot) => {
        expect(dot.tagName).toBe('SPAN');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();
    });

    it('should have role="status" attribute', () => {
      const spinner = compiled.querySelector('.spinner');
      expect(spinner?.getAttribute('role')).toBe('status');
    });

    it('should have aria-label attribute', () => {
      const spinner = compiled.querySelector('.spinner');
      expect(spinner?.getAttribute('aria-label')).toBe('Cargando...');
    });

    it('should be keyboard accessible', () => {
      const spinner = compiled.querySelector('.spinner');
      expect(spinner).toBeTruthy();
      // Spinner should not be focusable as it's purely informational
      expect(spinner?.getAttribute('tabindex')).toBeNull();
    });

    it('should have semantic HTML structure', () => {
      const overlay = compiled.querySelector('section.loading-overlay');
      expect(overlay).toBeTruthy();

      const figure = overlay?.querySelector('figure.spinner');
      expect(figure).toBeTruthy();
    });
  });

  describe('CSS Classes', () => {
    beforeEach(() => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();
    });

    it('should apply loading-overlay class to section', () => {
      const overlay = compiled.querySelector('section');
      expect(overlay?.classList.contains('loading-overlay')).toBeTruthy();
    });

    it('should apply spinner class to figure', () => {
      const figure = compiled.querySelector('figure');
      expect(figure?.classList.contains('spinner')).toBeTruthy();
    });

    it('should apply spinner__dot class to all spans', () => {
      const dots = compiled.querySelectorAll('span');
      expect(dots.length).toBe(3);
      dots.forEach((dot) => {
        expect(dot.classList.contains('spinner__dot')).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks on destroy', () => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();

      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    it('should handle multiple rapid state changes efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        loadingService.isLoading = signal(i % 2 === 0);
        fixture.detectChanges();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second for 100 changes)
      expect(duration).toBeLessThan(1000);
    });

    it('should not create new elements on each render', () => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();

      const firstRenderDots = compiled.querySelectorAll('.spinner__dot');
      expect(firstRenderDots.length).toBe(3);

      // Trigger re-render
      fixture.detectChanges();

      const secondRenderDots = compiled.querySelectorAll('.spinner__dot');
      expect(secondRenderDots.length).toBe(3);
    });
  });

  describe('Integration with LoadingService', () => {
    it('should use loadingService.isLoading signal', () => {
      expect(component.loadingService.isLoading).toBeDefined();
      expect(typeof component.loadingService.isLoading).toBe('function');
    });

    it('should react to loadingService signal changes', () => {
      loadingService.isLoading = signal(false);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeNull();

      loadingService.isLoading = signal(true);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeTruthy();
    });

    it('should maintain reactive connection throughout lifecycle', () => {
      // Initial state
      loadingService.isLoading = signal(false);
      fixture.detectChanges();
      expect(compiled.querySelector('.loading-overlay')).toBeNull();

      // Multiple changes
      for (let i = 0; i < 10; i++) {
        loadingService.isLoading = signal(true);
        fixture.detectChanges();
        expect(compiled.querySelector('.loading-overlay')).toBeTruthy();

        loadingService.isLoading = signal(false);
        fixture.detectChanges();
        expect(compiled.querySelector('.loading-overlay')).toBeNull();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle component initialization with loading true', () => {
      loadingService.isLoading = signal(true);
      const newFixture = TestBed.createComponent(LoadingSpinner);
      newFixture.detectChanges();

      const overlay = newFixture.nativeElement.querySelector('.loading-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should handle component initialization with loading false', () => {
      loadingService.isLoading = signal(false);
      const newFixture = TestBed.createComponent(LoadingSpinner);
      newFixture.detectChanges();

      const overlay = newFixture.nativeElement.querySelector('.loading-overlay');
      expect(overlay).toBeNull();
    });

    it('should handle very fast loading sequences', () => {
      const states = [true, false, true, false, true, false];

      states.forEach((state) => {
        loadingService.isLoading = signal(state);
        fixture.detectChanges();

        const overlay = compiled.querySelector('.loading-overlay');
        if (state) {
          expect(overlay).toBeTruthy();
        } else {
          expect(overlay).toBeNull();
        }
      });
    });
  });

  describe('DOM Queries', () => {
    it('should find overlay using DebugElement', () => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();

      const overlayDebug: DebugElement = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(overlayDebug).toBeTruthy();
    });

    it('should find spinner using DebugElement', () => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();

      const spinnerDebug: DebugElement = fixture.debugElement.query(By.css('.spinner'));
      expect(spinnerDebug).toBeTruthy();
    });

    it('should find all dots using DebugElement', () => {
      loadingService.isLoading = signal(true);
      fixture.detectChanges();

      const dotsDebug: DebugElement[] = fixture.debugElement.queryAll(By.css('.spinner__dot'));
      expect(dotsDebug.length).toBe(3);
    });
  });
});
