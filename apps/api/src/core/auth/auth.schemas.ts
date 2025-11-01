import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema } from '../../schemas/base.schemas';

/**
 * Auth Module Schemas
 * Using TypeBox for type safety and runtime validation
 */

// User Entity Schema
export const AuthUserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  username: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  isActive: Type.Boolean(),
  role: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// Request Schemas
export const RegisterRequestSchema = Type.Object({
  email: Type.String({
    format: 'email',
    description: 'User email address',
  }),
  username: Type.String({
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]+$',
    description: 'Username (alphanumeric, underscore, hyphen only)',
  }),
  password: Type.String({
    minLength: 8,
    description: 'Password (minimum 8 characters)',
  }),
  firstName: Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'First name',
  }),
  lastName: Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'Last name',
  }),
});

export const LoginRequestSchema = Type.Object({
  email: Type.String({
    description: 'User email address or username',
  }),
  password: Type.String({
    description: 'User password',
  }),
});

export const RefreshRequestSchema = Type.Object({
  refreshToken: Type.Optional(
    Type.String({
      description: 'Refresh token (optional if sent via cookie)',
    }),
  ),
});

export const UnlockAccountRequestSchema = Type.Object({
  identifier: Type.String({
    description: 'Email address or username to unlock',
  }),
});

export const VerifyEmailRequestSchema = Type.Object({
  token: Type.String({
    description: 'Email verification token from email',
  }),
});

export const ResendVerificationRequestSchema = Type.Object({
  email: Type.Optional(
    Type.String({
      format: 'email',
      description: 'Email address (optional if authenticated)',
    }),
  ),
});

// Response Schemas
export const AuthResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    user: AuthUserSchema,
    accessToken: Type.String(),
    refreshToken: Type.String(),
    expiresIn: Type.String(),
  }),
);

export const RegisterResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    user: AuthUserSchema,
    accessToken: Type.String(),
    refreshToken: Type.String(),
    expiresIn: Type.String(),
  }),
);

export const RefreshResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    accessToken: Type.String(),
  }),
);

export const ProfileResponseSchema = ApiSuccessResponseSchema(AuthUserSchema);

export const LogoutResponseSchema = ApiSuccessResponseSchema(Type.Object({}));

export const PermissionsResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    permissions: Type.Array(Type.String(), {
      description: 'Array of user permissions in format "resource:action"',
    }),
  }),
);

export const UnlockAccountResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    message: Type.String({
      description: 'Success message',
    }),
    identifier: Type.String({
      description: 'The unlocked identifier',
    }),
  }),
);

export const VerifyEmailResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    emailVerified: Type.Boolean({
      description: 'Whether email is now verified',
    }),
  }),
);

export const ResendVerificationResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    message: Type.String({
      description: 'Success message',
    }),
  }),
);

// Password Reset Schemas
export const RequestPasswordResetRequestSchema = Type.Object({
  email: Type.String({
    format: 'email',
    description: 'Email address for password reset',
  }),
});

export const RequestPasswordResetResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    message: Type.String({
      description: 'Success message (always returns success for security)',
    }),
  }),
);

export const VerifyResetTokenRequestSchema = Type.Object({
  token: Type.String({
    minLength: 1,
    description: 'Password reset token from email',
  }),
});

export const VerifyResetTokenResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    message: Type.String({
      description: 'Token validation message',
    }),
    valid: Type.Boolean({
      description: 'Whether token is valid',
    }),
  }),
);

export const ResetPasswordRequestSchema = Type.Object({
  token: Type.String({
    minLength: 1,
    description: 'Password reset token from email',
  }),
  newPassword: Type.String({
    minLength: 8,
    description: 'New password (minimum 8 characters)',
  }),
});

export const ResetPasswordResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    message: Type.String({
      description: 'Password reset success message',
    }),
  }),
);

// TypeScript Types
export type AuthUser = Static<typeof AuthUserSchema>;
export type RegisterRequest = Static<typeof RegisterRequestSchema>;
export type LoginRequest = Static<typeof LoginRequestSchema>;
export type RefreshRequest = Static<typeof RefreshRequestSchema>;
export type UnlockAccountRequest = Static<typeof UnlockAccountRequestSchema>;
export type VerifyEmailRequest = Static<typeof VerifyEmailRequestSchema>;
export type ResendVerificationRequest = Static<
  typeof ResendVerificationRequestSchema
>;
export type AuthResponse = Static<typeof AuthResponseSchema>;
export type RegisterResponse = Static<typeof RegisterResponseSchema>;
export type RefreshResponse = Static<typeof RefreshResponseSchema>;
export type ProfileResponse = Static<typeof ProfileResponseSchema>;
export type LogoutResponse = Static<typeof LogoutResponseSchema>;
export type PermissionsResponse = Static<typeof PermissionsResponseSchema>;
export type UnlockAccountResponse = Static<typeof UnlockAccountResponseSchema>;
export type VerifyEmailResponse = Static<typeof VerifyEmailResponseSchema>;
export type ResendVerificationResponse = Static<
  typeof ResendVerificationResponseSchema
>;
export type RequestPasswordResetRequest = Static<
  typeof RequestPasswordResetRequestSchema
>;
export type RequestPasswordResetResponse = Static<
  typeof RequestPasswordResetResponseSchema
>;
export type VerifyResetTokenRequest = Static<
  typeof VerifyResetTokenRequestSchema
>;
export type VerifyResetTokenResponse = Static<
  typeof VerifyResetTokenResponseSchema
>;
export type ResetPasswordRequest = Static<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = Static<typeof ResetPasswordResponseSchema>;

// Export schemas for registration
export const authSchemas = {
  'auth-user': AuthUserSchema,
  'register-request': RegisterRequestSchema,
  'login-request': LoginRequestSchema,
  'refresh-request': RefreshRequestSchema,
  'unlock-account-request': UnlockAccountRequestSchema,
  'verify-email-request': VerifyEmailRequestSchema,
  'resend-verification-request': ResendVerificationRequestSchema,
  'request-password-reset-request': RequestPasswordResetRequestSchema,
  'verify-reset-token-request': VerifyResetTokenRequestSchema,
  'reset-password-request': ResetPasswordRequestSchema,
  'auth-response': AuthResponseSchema,
  'register-response': RegisterResponseSchema,
  'refresh-response': RefreshResponseSchema,
  'profile-response': ProfileResponseSchema,
  'logout-response': LogoutResponseSchema,
  'permissions-response': PermissionsResponseSchema,
  'unlock-account-response': UnlockAccountResponseSchema,
  'verify-email-response': VerifyEmailResponseSchema,
  'resend-verification-response': ResendVerificationResponseSchema,
  'request-password-reset-response': RequestPasswordResetResponseSchema,
  'verify-reset-token-response': VerifyResetTokenResponseSchema,
  'reset-password-response': ResetPasswordResponseSchema,

  // Legacy compatibility
  authUser: AuthUserSchema,
  registerRequest: RegisterRequestSchema,
  loginRequest: LoginRequestSchema,
  refreshRequest: RefreshRequestSchema,
  unlockAccountRequest: UnlockAccountRequestSchema,
  verifyEmailRequest: VerifyEmailRequestSchema,
  resendVerificationRequest: ResendVerificationRequestSchema,
  authResponse: AuthResponseSchema,
  registerResponse: RegisterResponseSchema,
  refreshResponse: RefreshResponseSchema,
  profileResponse: ProfileResponseSchema,
  logoutResponse: LogoutResponseSchema,
  permissionsResponse: PermissionsResponseSchema,
  unlockAccountResponse: UnlockAccountResponseSchema,
  verifyEmailResponse: VerifyEmailResponseSchema,
  resendVerificationResponse: ResendVerificationResponseSchema,
  requestPasswordResetRequest: RequestPasswordResetRequestSchema,
  verifyResetTokenRequest: VerifyResetTokenRequestSchema,
  resetPasswordRequest: ResetPasswordRequestSchema,
  requestPasswordResetResponse: RequestPasswordResetResponseSchema,
  verifyResetTokenResponse: VerifyResetTokenResponseSchema,
  resetPasswordResponse: ResetPasswordResponseSchema,
};
