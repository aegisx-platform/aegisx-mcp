import { Injectable, ErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

export interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  stack?: string;
  context?: Record<string, any>;
  type: 'javascript' | 'http' | 'angular' | 'custom';
}

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  private router = inject(Router);
  private errorQueue: ErrorLogEntry[] = [];
  private readonly maxQueueSize = 50;
  private readonly logEndpoint = '/api/client-errors';

  handleError(error: any): void {
    console.error('Global error caught:', error);

    let errorEntry: ErrorLogEntry;

    if (error instanceof HttpErrorResponse) {
      errorEntry = this.createHttpErrorEntry(error);
    } else if (error instanceof Error) {
      errorEntry = this.createJavaScriptErrorEntry(error);
    } else {
      errorEntry = this.createGenericErrorEntry(error);
    }

    this.logError(errorEntry);
    this.handleErrorResponse(error);
  }

  private createHttpErrorEntry(error: HttpErrorResponse): ErrorLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `HTTP Error ${error.status}: ${error.message}`,
      url: error.url || undefined,
      userAgent: navigator.userAgent,
      correlationId: error.headers.get('x-correlation-id') || undefined,
      stack: undefined,
      context: {
        status: error.status,
        statusText: error.statusText,
        headers: this.headersToObject(error.headers),
        body: error.error,
      },
      type: 'http',
    };
  }

  private createJavaScriptErrorEntry(error: Error): ErrorLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message || 'Unknown JavaScript error',
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: error.stack,
      context: {
        name: error.name,
        fileName: (error as any).fileName,
        lineNumber: (error as any).lineNumber,
        columnNumber: (error as any).columnNumber,
      },
      type: 'javascript',
    };
  }

  private createGenericErrorEntry(error: any): ErrorLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error?.toString() || 'Unknown error occurred',
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: error?.stack,
      context: {
        errorType: typeof error,
        error: error,
      },
      type: 'angular',
    };
  }

  private headersToObject(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    if (headers && headers.keys) {
      headers.keys().forEach((key: string) => {
        result[key] = headers.get(key);
      });
    }
    return result;
  }

  private async logError(errorEntry: ErrorLogEntry): Promise<void> {
    try {
      // Add to queue
      this.errorQueue.push(errorEntry);

      // Maintain queue size
      if (this.errorQueue.length > this.maxQueueSize) {
        this.errorQueue.shift();
      }

      // Try to send immediately for critical errors
      if (errorEntry.level === 'error') {
        await this.sendErrorLogs([errorEntry]);
      }
    } catch (sendError) {
      console.error('Failed to log error:', sendError);

      // Fallback to localStorage for critical errors
      try {
        const storedErrors = JSON.parse(
          localStorage.getItem('aegisx_error_log') || '[]',
        );
        storedErrors.push(errorEntry);

        // Keep only last 20 errors in localStorage
        if (storedErrors.length > 20) {
          storedErrors.splice(0, storedErrors.length - 20);
        }

        localStorage.setItem('aegisx_error_log', JSON.stringify(storedErrors));
      } catch (storageError) {
        console.error('Failed to store error in localStorage:', storageError);
      }
    }
  }

  private async sendErrorLogs(errors: ErrorLogEntry[]): Promise<void> {
    if (errors.length === 0) return;

    try {
      const response = await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Errors': 'true',
        },
        body: JSON.stringify({ errors }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to send error logs: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending logs to server:', error);
      throw error;
    }
  }

  private handleErrorResponse(error: any): void {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 401:
          // Unauthorized - redirect to login
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: this.router.url },
          });
          break;
        case 403:
          // Forbidden - show access denied
          console.warn('Access denied:', error.message);
          break;
        case 404:
          // Not found - could navigate to 404 page
          console.warn('Resource not found:', error.url);
          break;
        case 500:
          // Server error - show maintenance message
          console.error('Server error:', error.message);
          break;
        default:
          console.error('HTTP error:', error);
      }
    }
  }

  // Public method to manually log custom errors
  logCustomError(
    message: string,
    level: 'error' | 'warn' | 'info' = 'error',
    context?: Record<string, any>,
  ): void {
    const errorEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
      type: 'custom',
    };

    this.logError(errorEntry);
  }

  // Method to flush queued errors
  async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length > 0) {
      const errors = [...this.errorQueue];
      this.errorQueue = [];

      try {
        await this.sendErrorLogs(errors);
      } catch (error) {
        // Put errors back in queue if sending failed
        this.errorQueue = [...errors, ...this.errorQueue];
        throw error;
      }
    }
  }

  // Method to get error statistics
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
  } {
    const errorsByType: Record<string, number> = {};

    this.errorQueue.forEach((error) => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    });

    return {
      totalErrors: this.errorQueue.length,
      errorsByType,
    };
  }
}

// Factory function for providing the error handler
export function provideGlobalErrorHandler() {
  return {
    provide: ErrorHandler,
    useClass: GlobalErrorHandler,
  };
}
