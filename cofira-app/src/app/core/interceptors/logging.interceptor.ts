import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  return next(req).pipe(
    tap(
      () => {
        const elapsed = Date.now() - started;
        console.log(`HTTP Request ${req.method} "${req.urlWithParams}" completed in ${elapsed} ms.`);
      },
      (error) => {
        const elapsed = Date.now() - started;
        console.error(`HTTP Request ${req.method} "${req.urlWithParams}" failed in ${elapsed} ms with error:`, error);
      }
    )
  );
};
