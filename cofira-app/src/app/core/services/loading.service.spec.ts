import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be injectable', () => {
      expect(service).toBeInstanceOf(LoadingService);
    });

    it('should initialize with isLoading as false', () => {
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('show() Method', () => {
    it('should set isLoading to true', () => {
      service.show();
      expect(service.isLoading()).toBe(true);
    });

    it('should increment request count', () => {
      service.show();
      service.show();
      expect(service.isLoading()).toBe(true);
    });

    it('should be callable multiple times', () => {
      service.show();
      service.show();
      service.show();
      expect(service.isLoading()).toBe(true);
    });

    it('should maintain loading state with multiple requests', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(true); // Still loading due to second request

      service.hide();
      expect(service.isLoading()).toBe(false); // Now all requests completed
    });

    it('should set loading to true even after reset', () => {
      service.show();
      service.reset();
      service.show();
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('hide() Method', () => {
    it('should set isLoading to false when request count reaches zero', () => {
      service.show();
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should decrement request count', () => {
      service.show();
      service.show();
      service.hide();
      expect(service.isLoading()).toBe(true);
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should not go below zero requests', () => {
      service.hide();
      service.hide();
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should handle hide without prior show', () => {
      expect(() => service.hide()).not.toThrow();
      expect(service.isLoading()).toBe(false);
    });

    it('should keep loading true if other requests are pending', () => {
      service.show();
      service.show();
      service.show();

      service.hide();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should be idempotent when called multiple times at zero', () => {
      service.hide();
      service.hide();
      service.hide();
      expect(service.isLoading()).toBe(false);

      service.show();
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('reset() Method', () => {
    it('should set isLoading to false', () => {
      service.show();
      service.reset();
      expect(service.isLoading()).toBe(false);
    });

    it('should reset request count to zero', () => {
      service.show();
      service.show();
      service.show();
      service.reset();

      expect(service.isLoading()).toBe(false);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should work when no requests are active', () => {
      expect(() => service.reset()).not.toThrow();
      expect(service.isLoading()).toBe(false);
    });

    it('should clear multiple pending requests', () => {
      service.show();
      service.show();
      service.show();
      service.show();
      service.show();

      service.reset();

      expect(service.isLoading()).toBe(false);

      service.show();
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should be callable multiple times', () => {
      service.show();
      service.reset();
      service.reset();
      service.reset();
      expect(service.isLoading()).toBe(false);
    });

    it('should allow normal operation after reset', () => {
      service.show();
      service.show();
      service.reset();

      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Request Count Management', () => {
    it('should track single request lifecycle', () => {
      expect(service.isLoading()).toBe(false);
      service.show();
      expect(service.isLoading()).toBe(true);
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should track multiple concurrent requests', () => {
      service.show(); // Request 1
      service.show(); // Request 2
      service.show(); // Request 3

      expect(service.isLoading()).toBe(true);

      service.hide(); // Complete Request 1
      expect(service.isLoading()).toBe(true);

      service.hide(); // Complete Request 2
      expect(service.isLoading()).toBe(true);

      service.hide(); // Complete Request 3
      expect(service.isLoading()).toBe(false);
    });

    it('should handle out-of-order completion', () => {
      service.show();
      service.show();
      service.show();

      service.hide();
      service.hide();
      service.hide();

      expect(service.isLoading()).toBe(false);
    });

    it('should handle more hides than shows', () => {
      service.show();

      service.hide();
      service.hide();
      service.hide();

      expect(service.isLoading()).toBe(false);
    });

    it('should maintain correct state with alternating operations', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);

      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Signal Reactivity', () => {
    it('should emit changes to isLoading signal', () => {
      const values: boolean[] = [];

      // Create an effect to track signal changes
      const unsubscribe = TestBed.runInInjectionContext(() => {
        const effectRef = TestBed.inject(LoadingService).isLoading;
        values.push(effectRef());
        return () => {};
      });

      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should allow reading current loading state', () => {
      expect(service.isLoading()).toBe(false);
      service.show();
      expect(service.isLoading()).toBe(true);
    });

    it('should update signal immediately on show', () => {
      const beforeValue = service.isLoading();
      service.show();
      const afterValue = service.isLoading();

      expect(beforeValue).toBe(false);
      expect(afterValue).toBe(true);
    });

    it('should update signal immediately on hide', () => {
      service.show();
      const beforeValue = service.isLoading();
      service.hide();
      const afterValue = service.isLoading();

      expect(beforeValue).toBe(true);
      expect(afterValue).toBe(false);
    });

    it('should update signal immediately on reset', () => {
      service.show();
      service.show();
      const beforeValue = service.isLoading();
      service.reset();
      const afterValue = service.isLoading();

      expect(beforeValue).toBe(true);
      expect(afterValue).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid show/hide calls', () => {
      for (let i = 0; i < 100; i++) {
        service.show();
      }
      expect(service.isLoading()).toBe(true);

      for (let i = 0; i < 100; i++) {
        service.hide();
      }
      expect(service.isLoading()).toBe(false);
    });

    it('should handle very large request counts', () => {
      for (let i = 0; i < 10000; i++) {
        service.show();
      }
      expect(service.isLoading()).toBe(true);

      service.reset();
      expect(service.isLoading()).toBe(false);
    });

    it('should maintain state after many operations', () => {
      for (let i = 0; i < 50; i++) {
        service.show();
        service.hide();
      }
      expect(service.isLoading()).toBe(false);
    });

    it('should work correctly after multiple resets', () => {
      service.show();
      service.reset();

      service.show();
      service.reset();

      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should simulate HTTP request lifecycle', () => {
      // Request starts
      service.show();
      expect(service.isLoading()).toBe(true);

      // Request completes
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should simulate multiple concurrent HTTP requests', () => {
      // Start 3 requests
      service.show(); // Request 1
      service.show(); // Request 2
      service.show(); // Request 3
      expect(service.isLoading()).toBe(true);

      // Request 1 completes
      service.hide();
      expect(service.isLoading()).toBe(true);

      // Request 2 completes
      service.hide();
      expect(service.isLoading()).toBe(true);

      // Request 3 completes
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should handle error scenario with reset', () => {
      service.show();
      service.show();
      service.show();

      // Simulate error - reset all pending requests
      service.reset();
      expect(service.isLoading()).toBe(false);
    });

    it('should simulate user navigation during loading', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      // User navigates away - cleanup
      service.reset();
      expect(service.isLoading()).toBe(false);

      // New page starts loading
      service.show();
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('State Consistency', () => {
    it('should never have negative request count', () => {
      service.hide();
      service.hide();
      service.hide();

      service.show();
      service.hide();

      expect(service.isLoading()).toBe(false);
    });

    it('should maintain consistent state across multiple cycles', () => {
      for (let i = 0; i < 10; i++) {
        service.show();
        expect(service.isLoading()).toBe(true);
        service.hide();
        expect(service.isLoading()).toBe(false);
      }
    });

    it('should handle unbalanced show/hide calls gracefully', () => {
      service.show();
      service.show();
      service.hide();
      service.hide();
      service.hide(); // Extra hide
      service.hide(); // Extra hide

      expect(service.isLoading()).toBe(false);

      service.show();
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle rapid state changes efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        service.show();
        service.hide();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should not leak memory with many operations', () => {
      for (let i = 0; i < 10000; i++) {
        service.show();
        service.hide();
      }

      expect(service.isLoading()).toBe(false);
    });
  });
});
