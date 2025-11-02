import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Email Verification Result Interface
 * Matches backend response from email-verification.service.ts
 */
export interface VerificationResult {
  success: boolean;
  message: string;
  emailVerified?: boolean;
}

/**
 * Resend Verification Response Interface
 */
export interface ResendVerificationResponse {
  message: string;
  email?: string;
}

/**
 * Email Verification Service (Frontend)
 *
 * Purpose: Handle email verification flow on the frontend
 *
 * Features:
 * - Verify email with token from URL
 * - Resend verification email
 * - Handle verification responses
 *
 * Integration:
 * - Used by verify-email.page.ts
 * - Communicates with backend API at /api/auth/verify-email
 */
@Injectable({
  providedIn: 'root',
})
export class EmailVerificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Verify email using token
   *
   * @param token - Verification token from email link
   * @returns Observable<VerificationResult>
   *
   * Backend: POST /api/auth/verify-email
   * Body: { token: string }
   *
   * Responses:
   * - 200: { success: true, message: "Email verified successfully", emailVerified: true }
   * - 400: { success: false, message: "Invalid verification token" }
   * - 400: { success: false, message: "Verification token has expired..." }
   * - 200: { success: true, message: "Email already verified", emailVerified: true }
   */
  verifyEmail(token: string): Observable<VerificationResult> {
    return this.http.post<VerificationResult>(`${this.apiUrl}/verify-email`, {
      token,
    });
  }

  /**
   * Resend verification email to user
   *
   * Note: This requires userId, which means user must be logged in.
   * For guest users, we might need a different approach (send to email directly)
   *
   * @param userId - User ID (from logged in user or token)
   * @returns Observable<ResendVerificationResponse>
   *
   * Backend: POST /api/auth/resend-verification
   * Body: { userId: string }
   *
   * Responses:
   * - 200: { message: "Verification email sent successfully" }
   * - 404: { message: "User not found" }
   * - 400: { message: "Email already verified" }
   */
  resendVerification(userId: string): Observable<ResendVerificationResponse> {
    return this.http.post<ResendVerificationResponse>(
      `${this.apiUrl}/resend-verification`,
      {
        userId,
      },
    );
  }

  /**
   * Alternative: Resend verification by email
   * (If backend supports this endpoint - to be implemented if needed)
   *
   * This would allow guest users to resend without logging in
   */
  resendVerificationByEmail?(
    email: string,
  ): Observable<ResendVerificationResponse> {
    return this.http.post<ResendVerificationResponse>(
      `${this.apiUrl}/resend-verification-by-email`,
      {
        email,
      },
    );
  }
}
