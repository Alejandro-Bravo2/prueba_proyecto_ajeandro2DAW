import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { AsyncValidatorsService } from './async-validators.service';
import { environment } from '../../../environments/environment';

describe('AsyncValidatorsService', () => {
  let service: AsyncValidatorsService;
  let httpMock: HttpTestingController;
  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsyncValidatorsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AsyncValidatorsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have API_URL configured', () => {
      expect((service as any).API_URL).toBe(environment.apiUrl);
    });
  });

  describe('emailUnique validator', () => {
    it('should return null for pristine control', fakeAsync(() => {
      const control = new FormControl('');
      const validator = service.emailUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(600);
      flush();

      expect(result).toBeNull();
    }));

    it('should return null for empty value', fakeAsync(() => {
      const control = new FormControl('');
      control.markAsDirty();
      const validator = service.emailUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(600);
      flush();

      expect(result).toBeNull();
    }));

    it('should return null when email matches excludeEmail', fakeAsync(() => {
      const control = new FormControl('user@example.com');
      control.markAsDirty();
      const validator = service.emailUnique('user@example.com');
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(600);
      flush();

      expect(result).toBeNull();
    }));

    it('should return emailTaken error when email exists (200 response)', fakeAsync(() => {
      const control = new FormControl('existing@example.com');
      control.markAsDirty();
      const validator = service.emailUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/email?email=existing@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 1, email: 'existing@example.com' }); // 200 = email exists

      tick(100);
      flush();

      expect(result).toEqual({ emailTaken: true });
    }));

    it('should return null when email is unique (404 response)', fakeAsync(() => {
      const control = new FormControl('unique@example.com');
      control.markAsDirty();
      const validator = service.emailUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/email?email=unique@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' }); // 404 = email doesn't exist

      tick(100);
      flush();

      expect(result).toBeNull();
    }));

    it('should return connectionError for status 0', fakeAsync(() => {
      const control = new FormControl('test@example.com');
      control.markAsDirty();
      const validator = service.emailUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/email?email=test@example.com`);
      req.error(new ProgressEvent('error'), { status: 0 });

      tick(100);
      flush();

      expect(result).toEqual({ connectionError: true });
    }));

    it('should return null for other errors (graceful handling)', fakeAsync(() => {
      const control = new FormControl('test@example.com');
      control.markAsDirty();
      const validator = service.emailUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/email?email=test@example.com`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      tick(100);
      flush();

      expect(result).toBeNull();
    }));
  });

  describe('usernameUnique validator', () => {
    it('should return null for pristine control', fakeAsync(() => {
      const control = new FormControl('');
      const validator = service.usernameUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(600);
      flush();

      expect(result).toBeNull();
    }));

    it('should return null for empty value', fakeAsync(() => {
      const control = new FormControl('');
      control.markAsDirty();
      const validator = service.usernameUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(600);
      flush();

      expect(result).toBeNull();
    }));

    it('should return null when username matches excludeUsername', fakeAsync(() => {
      const control = new FormControl('currentuser');
      control.markAsDirty();
      const validator = service.usernameUnique('currentuser');
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(600);
      flush();

      expect(result).toBeNull();
    }));

    it('should return usernameTaken error when username exists (200 response)', fakeAsync(() => {
      const control = new FormControl('existinguser');
      control.markAsDirty();
      const validator = service.usernameUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/username?username=existinguser`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 1, username: 'existinguser' }); // 200 = username exists

      tick(100);
      flush();

      expect(result).toEqual({ usernameTaken: true });
    }));

    it('should return null when username is unique (404 response)', fakeAsync(() => {
      const control = new FormControl('uniqueuser');
      control.markAsDirty();
      const validator = service.usernameUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/username?username=uniqueuser`);
      expect(req.request.method).toBe('GET');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' }); // 404 = username doesn't exist

      tick(100);
      flush();

      expect(result).toBeNull();
    }));

    it('should return connectionError for status 0', fakeAsync(() => {
      const control = new FormControl('testuser');
      control.markAsDirty();
      const validator = service.usernameUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/username?username=testuser`);
      req.error(new ProgressEvent('error'), { status: 0 });

      tick(100);
      flush();

      expect(result).toEqual({ connectionError: true });
    }));

    it('should return null for other errors (graceful handling)', fakeAsync(() => {
      const control = new FormControl('testuser');
      control.markAsDirty();
      const validator = service.usernameUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/username?username=testuser`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      tick(100);
      flush();

      expect(result).toBeNull();
    }));

    it('should handle special characters in username', fakeAsync(() => {
      const control = new FormControl('user_name-123');
      control.markAsDirty();
      const validator = service.usernameUnique();
      let result: any = null;

      const validationResult = validator(control);
      if (validationResult && 'subscribe' in validationResult) {
        validationResult.subscribe((res) => (result = res));
      }

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/usuarios/username?username=user_name-123`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      tick(100);
      flush();

      expect(result).toBeNull();
    }));
  });
});
