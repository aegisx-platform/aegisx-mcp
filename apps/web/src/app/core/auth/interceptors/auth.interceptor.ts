import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth requests to avoid circular calls
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Get token from AuthService
  const token = authService.getAccessToken();

  // Add auth headers if token exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors by trying to refresh token
      if (error.status === 401) {
        console.log('401 error, attempting token refresh...');

        return authService.refreshToken().pipe(
          switchMap((response) => {
            console.log('Token refresh successful, retrying request');
            const newToken = authService.getAccessToken();

            if (newToken) {
              // Retry the original request with new token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(retryReq);
            }
            throw error;
          }),
          catchError((refreshError) => {
            console.log('Token refresh failed, redirecting to login');
            router.navigate(['/login']);
            return EMPTY; // Complete the stream silently
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
