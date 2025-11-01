/**
 * Password Reset Types
 * Types and interfaces for password reset functionality
 */

// Request types
export interface RequestPasswordResetRequest {
  email: string;
}

export interface VerifyResetTokenRequest {
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Response types
export interface PasswordResetResponse {
  message: string;
}

export interface VerifyTokenResponse {
  message: string;
  valid: boolean;
}

// API Response wrapper (standard format)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
    statusCode: number;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    environment: string;
  };
}
