import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  ApiResponse,
  PasswordResetResponse,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  VerifyResetTokenRequest,
  VerifyTokenResponse,
} from './password-reset.types';

/**
 * Password Reset Service
 * Handles password reset functionality including:
 * - Requesting password reset (send email)
 * - Verifying reset tokens
 * - Resetting passwords with valid tokens
 */
@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private http = inject(HttpClient);

  /**
   * Request a password reset link to be sent to the user's email
   * @param email - User's email address
   * @returns Observable with success message
   */
  requestPasswordReset(email: string): Observable<string> {
    const body: RequestPasswordResetRequest = { email };

    return this.http
      .post<
        ApiResponse<PasswordResetResponse>
      >('/api/auth/request-password-reset', body)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data.message;
          }
          throw new Error(response.error?.message || 'Request failed');
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Verify if a reset token is valid and not expired
   * @param token - Reset token from email link
   * @returns Observable with validation result
   */
  verifyResetToken(token: string): Observable<VerifyTokenResponse> {
    const body: VerifyResetTokenRequest = { token };

    return this.http
      .post<
        ApiResponse<VerifyTokenResponse>
      >('/api/auth/verify-reset-token', body)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(
            response.error?.message || 'Token verification failed',
          );
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Reset password using a valid token
   * @param token - Reset token from email link
   * @param newPassword - New password to set
   * @returns Observable with success message
   */
  resetPassword(token: string, newPassword: string): Observable<string> {
    const body: ResetPasswordRequest = { token, newPassword };

    return this.http
      .post<
        ApiResponse<PasswordResetResponse>
      >('/api/auth/reset-password', body)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data.message;
          }
          throw new Error(response.error?.message || 'Password reset failed');
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable error with user-friendly message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.error?.error?.message) {
      // Standard API error format
      errorMessage = error.error.error.message;
    } else if (error.error?.message) {
      // Alternative error format
      errorMessage = error.error.message;
    } else if (error.status === 429) {
      // Rate limit error
      errorMessage =
        'Too many requests. Please wait a moment before trying again.';
    } else if (error.status === 0) {
      // Network error
      errorMessage =
        'Network error. Please check your internet connection and try again.';
    } else if (error.status >= 500) {
      // Server error
      errorMessage = 'Server error. Please try again later.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
