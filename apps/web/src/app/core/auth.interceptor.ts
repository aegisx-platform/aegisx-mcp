import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Add auth headers if user is authenticated
  const authHeaders = authService.getAuthHeaders();
  const authReq =
    Object.keys(authHeaders).length > 0
      ? req.clone({
          setHeaders: authHeaders,
        })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors by trying to refresh token
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original request with new token
            const retryHeaders = authService.getAuthHeaders();
            const retryReq = req.clone({
              setHeaders: retryHeaders,
            });
            return next(retryReq);
          }),
          catchError(() => {
            // Refresh failed, redirect to login
            return throwError(() => error);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
