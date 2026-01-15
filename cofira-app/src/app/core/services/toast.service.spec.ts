import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { ToastMessage, ToastType } from '../../shared/models/toast.model';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast message', () => {
    service.show({ message: 'Test message', type: 'info' });
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Test message');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should automatically dismiss a toast after its duration', (done) => {
    jasmine.clock().install(); // Use Jasmine's fake timers
    service.show({ message: 'Auto dismiss', type: 'success', duration: 100 });
    expect(service.toasts().length).toBe(1);

    jasmine.clock().tick(101); // Advance time past the duration
    expect(service.toasts().length).toBe(0);
    jasmine.clock().uninstall();
    done();
  });

  it('should not auto-dismiss if duration is 0', (done) => {
    jasmine.clock().install();
    service.show({ message: 'No dismiss', type: 'info', duration: 0 });
    expect(service.toasts().length).toBe(1);

    jasmine.clock().tick(5000); // Advance a long time
    expect(service.toasts().length).toBe(1); // Should still be there
    jasmine.clock().uninstall();
    done();
  });

  it('should dismiss a toast by ID', () => {
    service.show({ message: 'Toast 1', type: 'info' });
    service.show({ message: 'Toast 2', type: 'success' });
    const toastToDismiss = service.toasts()[0];

    service.dismiss(toastToDismiss.id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Toast 2');
  });

  it('should clear all toasts', () => {
    service.show({ message: 'Toast 1', type: 'info' });
    service.show({ message: 'Toast 2', type: 'success' });
    service.clear();
    expect(service.toasts().length).toBe(0);
  });

  it('should use default durations if not provided', (done) => {
    jasmine.clock().install();
    service.success('Success message');
    expect(service.toasts()[0].duration).toBe(4000);
    jasmine.clock().tick(4001);
    expect(service.toasts().length).toBe(0);

    service.error('Error message');
    expect(service.toasts()[0].duration).toBe(8000);
    jasmine.clock().tick(8001);
    expect(service.toasts().length).toBe(0);
    jasmine.clock().uninstall();
    done();
  });
});
