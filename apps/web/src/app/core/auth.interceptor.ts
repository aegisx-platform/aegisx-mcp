import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  // Get token directly from localStorage instead of injecting AuthService
  const token = localStorage.getItem('accessToken');

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
      if (error.status === 401 && !req.url.includes('/auth/')) {
        const router = inject(Router);
        const http = inject(HttpClient);

        // Try to refresh token
        return http
          .post<any>(
            `${environment.apiUrl}/api/auth/refresh`,
            {},
            {
              withCredentials: true,
            },
          )
          .pipe(
            switchMap((response) => {
              if (response.success && response.data) {
                // Store new token
                localStorage.setItem('accessToken', response.data.accessToken);

                // Retry the original request with new token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.data.accessToken}`,
                  },
                });
                return next(retryReq);
              }
              throw error;
            }),
            catchError(() => {
              // Refresh failed, clear storage and redirect to login
              localStorage.removeItem('accessToken');
              router.navigate(['/login']);
              return throwError(() => error);
            }),
          );
      }

      return throwError(() => error);
    }),
  );
};
