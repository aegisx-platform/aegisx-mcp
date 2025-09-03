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

// TypeScript Types
export type AuthUser = Static<typeof AuthUserSchema>;
export type RegisterRequest = Static<typeof RegisterRequestSchema>;
export type LoginRequest = Static<typeof LoginRequestSchema>;
export type RefreshRequest = Static<typeof RefreshRequestSchema>;
export type AuthResponse = Static<typeof AuthResponseSchema>;
export type RegisterResponse = Static<typeof RegisterResponseSchema>;
export type RefreshResponse = Static<typeof RefreshResponseSchema>;
export type ProfileResponse = Static<typeof ProfileResponseSchema>;
export type LogoutResponse = Static<typeof LogoutResponseSchema>;

// Export schemas for registration
export const authSchemas = {
  'auth-user': AuthUserSchema,
  'register-request': RegisterRequestSchema,
  'login-request': LoginRequestSchema,
  'refresh-request': RefreshRequestSchema,
  'auth-response': AuthResponseSchema,
  'register-response': RegisterResponseSchema,
  'refresh-response': RefreshResponseSchema,
  'profile-response': ProfileResponseSchema,
  'logout-response': LogoutResponseSchema,

  // Legacy compatibility
  authUser: AuthUserSchema,
  registerRequest: RegisterRequestSchema,
  loginRequest: LoginRequestSchema,
  refreshRequest: RefreshRequestSchema,
  authResponse: AuthResponseSchema,
  registerResponse: RegisterResponseSchema,
  refreshResponse: RefreshResponseSchema,
  profileResponse: ProfileResponseSchema,
  logoutResponse: LogoutResponseSchema,
};
