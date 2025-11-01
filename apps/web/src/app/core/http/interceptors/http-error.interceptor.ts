import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalErrorHandler } from '../../error-handling/services/error-handler.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private errorHandler = inject(GlobalErrorHandler);
  private snackBar = inject(MatSnackBar);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Add correlation ID if not present
    const correlationId =
      req.headers.get('x-correlation-id') || this.generateCorrelationId();

    const modifiedReq = req.clone({
      setHeaders: {
        'x-correlation-id': correlationId,
        'x-client-timestamp': new Date().toISOString(),
        'x-client-version': '1.0.0', // Could be injected from environment
      },
    });

    const startTime = Date.now();

    return next.handle(modifiedReq).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          // Log successful requests (optional, can be disabled)
          if (this.shouldLogRequest(req)) {
            const responseTime = Date.now() - startTime;
            this.logRequestSuccess(req, event, responseTime, correlationId);
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const responseTime = Date.now() - startTime;

        // Log the HTTP error
        this.logHttpError(req, error, responseTime, correlationId);

        // Handle specific error types
        this.handleHttpError(error);

        return throwError(() => error);
      }),
    );
  }

  private generateCorrelationId(): string {
    return (
      'client-' +
      Math.random().toString(36).substr(2, 9) +
      '-' +
      Date.now().toString(36)
    );
  }

  private shouldLogRequest(req: HttpRequest<any>): boolean {
    // Skip logging for certain requests (health checks, metrics, etc.)
    const skipPaths = ['/health', '/metrics', '/ping'];
    return !skipPaths.some((path) => req.url.includes(path));
  }

  private logRequestSuccess(
    req: HttpRequest<any>,
    response: HttpResponse<any>,
    responseTime: number,
    correlationId: string,
  ): void {
    // Only log in development or if explicitly enabled
    if (this.isLoggingEnabled()) {
      console.log(`✅ ${req.method} ${req.url}`, {
        status: response.status,
        responseTime: `${responseTime}ms`,
        correlationId,
        contentType: response.headers.get('content-type'),
      });
    }

    // Log slow requests as warnings
    if (responseTime > 3000) {
      this.errorHandler.logCustomError(
        `Slow API request: ${req.method} ${req.url}`,
        'warn',
        {
          method: req.method,
          url: req.url,
          responseTime: `${responseTime}ms`,
          status: response.status,
          correlationId,
        },
      );
    }
  }

  private logHttpError(
    req: HttpRequest<any>,
    error: HttpErrorResponse,
    responseTime: number,
    correlationId: string,
  ): void {
    console.error(`❌ ${req.method} ${req.url}`, {
      status: error.status,
      message: error.message,
      responseTime: `${responseTime}ms`,
      correlationId,
      error: error.error,
    });

    // Additional context for the error
    const errorContext = {
      method: req.method,
      url: req.url,
      status: error.status,
      statusText: error.statusText,
      responseTime: `${responseTime}ms`,
      correlationId,
      requestHeaders: this.extractSafeHeaders(req.headers),
      responseHeaders: this.extractSafeHeaders(error.headers),
      requestBody: this.getSafeRequestBody(req),
      responseBody: error.error,
    };

    // Log to error handler
    this.errorHandler.logCustomError(
      `HTTP ${error.status} Error: ${req.method} ${req.url}`,
      'error',
      errorContext,
    );
  }

  private handleHttpError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 0:
        // Network error
        console.error('Network error - check your connection');
        break;
      case 400:
        console.warn('Bad Request:', error.error?.message || error.message);
        break;
      case 401:
        console.warn('Unauthorized - redirecting to login');
        // Error handler will handle the redirect
        break;
      case 403:
        console.warn('Forbidden - insufficient permissions');
        // Show user-friendly toaster notification
        this.snackBar.open(
          error.error?.message ||
            'Access denied. You do not have permission to perform this action.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          },
        );
        break;
      case 404:
        console.warn('Resource not found');
        break;
      case 409:
        console.warn('Conflict:', error.error?.message || error.message);
        break;
      case 422:
        console.warn(
          'Validation error:',
          error.error?.message || error.message,
        );
        break;
      case 429:
        console.warn('Rate limit exceeded - please slow down');
        break;
      case 500:
        console.error('Internal server error');
        break;
      case 502:
        console.error('Bad gateway - server is unreachable');
        break;
      case 503:
        console.error('Service unavailable - server is temporarily down');
        break;
      case 504:
        console.error('Gateway timeout - request took too long');
        break;
      default:
        console.error(`HTTP error ${error.status}:`, error.message);
    }
  }

  private extractSafeHeaders(headers: any): Record<string, string> {
    const safeHeaders: Record<string, string> = {};
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'set-cookie',
      'x-api-key',
    ];

    if (headers && headers.keys) {
      headers.keys().forEach((key: string) => {
        const lowerKey = key.toLowerCase();
        if (!sensitiveHeaders.includes(lowerKey)) {
          safeHeaders[key] = headers.get(key);
        } else {
          safeHeaders[key] = '[REDACTED]';
        }
      });
    }

    return safeHeaders;
  }

  private getSafeRequestBody(req: HttpRequest<any>): any {
    if (!req.body) return undefined;

    // Don't log sensitive data
    if (typeof req.body === 'object') {
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
      const safebody = { ...req.body };

      Object.keys(safebody).forEach((key) => {
        if (
          sensitiveFields.some((field) => key.toLowerCase().includes(field))
        ) {
          safebody[key] = '[REDACTED]';
        }
      });

      return safebody;
    }

    return req.body;
  }

  private isLoggingEnabled(): boolean {
    // Enable in development or when explicitly configured
    return (
      !environment.production ||
      localStorage.getItem('aegisx_enable_request_logging') === 'true'
    );
  }
}

// Export for easier imports
export const httpErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: HttpErrorInterceptor,
  multi: true,
};

// We need these imports at the top
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
