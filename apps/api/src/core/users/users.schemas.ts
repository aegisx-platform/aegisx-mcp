import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema } from '../../schemas/base.schemas';

// User entity schema (matches database)
const UserEntitySchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  username: Type.String({ minLength: 3, maxLength: 100 }),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  isActive: Type.Boolean(),
  lastLoginAt: Type.Optional(Type.String({ format: 'date-time' })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// User with role information
const UserWithRoleSchema = Type.Intersect([
  UserEntitySchema,
  Type.Object({
    role: Type.String(), // Role name from joined table
    roleId: Type.String({ format: 'uuid' }), // Role ID from joined table
  }),
]);

// List users query parameters
const ListUsersQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 10 })),
  search: Type.Optional(Type.String()),
  role: Type.Optional(Type.String()),
  status: Type.Optional(
    Type.Union([Type.Literal('active'), Type.Literal('inactive')]),
  ),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')]),
  ),
});

// List users response - Using standard success response with array data
const ListUsersResponseSchema = ApiSuccessResponseSchema(
  Type.Array(UserWithRoleSchema),
);

// Get user response - Using standard success response
const GetUserResponseSchema = ApiSuccessResponseSchema(UserWithRoleSchema);

// Create user request
const CreateUserRequestSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  username: Type.String({ minLength: 3, maxLength: 100 }),
  password: Type.String({ minLength: 8 }),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  // Support both roleId (UUID) and role (name) for flexibility
  roleId: Type.Optional(Type.String({ format: 'uuid' })),
  role: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean({ default: true })),
});

// Create user response - Using standard success response
const CreateUserResponseSchema = ApiSuccessResponseSchema(UserWithRoleSchema);

// Update user request
const UpdateUserRequestSchema = Type.Object({
  email: Type.Optional(Type.String({ format: 'email' })),
  username: Type.Optional(Type.String({ minLength: 3, maxLength: 100 })),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  roleId: Type.Optional(Type.String({ format: 'uuid' })),
  isActive: Type.Optional(Type.Boolean()),
});

// Update user response - Using standard success response
const UpdateUserResponseSchema = ApiSuccessResponseSchema(UserWithRoleSchema);

// Delete user response - Using standard success response
const DeleteUserResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    message: Type.String(),
  }),
);

// Change password request (for admin to reset user password)
const ChangeUserPasswordRequestSchema = Type.Object({
  newPassword: Type.String({ minLength: 8 }),
});

// Self password change request (for user to change their own password)
const SelfPasswordChangeRequestSchema = Type.Object({
  currentPassword: Type.String({ minLength: 1 }),
  newPassword: Type.String({
    minLength: 8,
    description: 'Must be at least 8 characters long',
  }),
  confirmPassword: Type.String({
    minLength: 8,
    description: 'Must match new password',
  }),
});

// Profile schemas
const UserProfileSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  username: Type.String({ minLength: 3, maxLength: 100 }),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  bio: Type.Optional(Type.String({ maxLength: 500 })),
  avatarUrl: Type.Optional(Type.String({ format: 'uri' })),
  role: Type.String(),
  status: Type.String(),
  emailVerified: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

const GetProfileResponseSchema = ApiSuccessResponseSchema(UserProfileSchema);

const UpdateProfileRequestSchema = Type.Object({
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  username: Type.Optional(Type.String({ minLength: 3, maxLength: 100 })),
  bio: Type.Optional(Type.String({ maxLength: 500 })),
});

const UpdateProfileResponseSchema = ApiSuccessResponseSchema(UserProfileSchema);

// Success message response - Using standard success response
const SuccessMessageResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    message: Type.String(),
  }),
);

// Role schema
const RoleSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  description: Type.Optional(Type.String()),
});

// List roles response
const ListRolesResponseSchema = ApiSuccessResponseSchema(
  Type.Array(RoleSchema),
);

// Export schemas for registration
// Bulk operations schemas

// Base bulk request schema for user IDs
const BulkUserIdsRequestSchema = Type.Object({
  userIds: Type.Array(Type.String({ format: 'uuid' }), {
    minItems: 1,
    maxItems: 100,
    description: 'Array of user IDs to operate on (max 100)',
  }),
});

// Bulk status change (activate/deactivate) request
const BulkStatusChangeRequestSchema = BulkUserIdsRequestSchema;

// Bulk role change request
const BulkRoleChangeRequestSchema = Type.Object({
  userIds: Type.Array(Type.String({ format: 'uuid' }), {
    minItems: 1,
    maxItems: 100,
    description: 'Array of user IDs to change roles for (max 100)',
  }),
  roleId: Type.String({ format: 'uuid', description: 'New role ID to assign' }),
});

// Individual bulk operation result
const BulkOperationResultSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
  success: Type.Boolean(),
  error: Type.Optional(
    Type.Object({
      code: Type.String(),
      message: Type.String(),
    }),
  ),
});

// Bulk operation response
const BulkOperationResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    totalRequested: Type.Number({
      description: 'Total number of users requested',
    }),
    successCount: Type.Number({
      description: 'Number of successful operations',
    }),
    failureCount: Type.Number({ description: 'Number of failed operations' }),
    results: Type.Array(BulkOperationResultSchema),
    summary: Type.Object({
      message: Type.String(),
      hasFailures: Type.Boolean(),
    }),
  }),
);

// Bulk operation error codes enum for better error handling
const BulkErrorCodesSchema = Type.Union([
  Type.Literal('USER_NOT_FOUND'),
  Type.Literal('USER_ALREADY_ACTIVE'),
  Type.Literal('USER_ALREADY_INACTIVE'),
  Type.Literal('ROLE_NOT_FOUND'),
  Type.Literal('CANNOT_CHANGE_OWN_STATUS'),
  Type.Literal('CANNOT_CHANGE_ADMIN_STATUS'),
  Type.Literal('INSUFFICIENT_PERMISSIONS'),
  Type.Literal('USER_ALREADY_DELETED'),
]);

export const usersSchemas = {
  'list-users-query': ListUsersQuerySchema,
  'list-users-response': ListUsersResponseSchema,
  'get-user-response': GetUserResponseSchema,
  'create-user-request': CreateUserRequestSchema,
  'create-user-response': CreateUserResponseSchema,
  'update-user-request': UpdateUserRequestSchema,
  'update-user-response': UpdateUserResponseSchema,
  'delete-user-response': DeleteUserResponseSchema,
  'change-user-password-request': ChangeUserPasswordRequestSchema,
  'self-password-change-request': SelfPasswordChangeRequestSchema,
  // Profile schemas
  'get-profile-response': GetProfileResponseSchema,
  'update-profile-request': UpdateProfileRequestSchema,
  'update-profile-response': UpdateProfileResponseSchema,
  'success-message-response': SuccessMessageResponseSchema,
  'list-roles-response': ListRolesResponseSchema,
  // Bulk operation schemas
  'bulk-user-ids-request': BulkUserIdsRequestSchema,
  'bulk-status-change-request': BulkStatusChangeRequestSchema,
  'bulk-role-change-request': BulkRoleChangeRequestSchema,
  'bulk-operation-response': BulkOperationResponseSchema,
};

// Export types
export type UserEntity = Static<typeof UserEntitySchema>;
export type UserWithRole = Static<typeof UserWithRoleSchema>;
export type ListUsersQuery = Static<typeof ListUsersQuerySchema>;
export type ListUsersResponse = Static<typeof ListUsersResponseSchema>;
export type GetUserResponse = Static<typeof GetUserResponseSchema>;
export type CreateUserRequest = Static<typeof CreateUserRequestSchema>;
export type CreateUserResponse = Static<typeof CreateUserResponseSchema>;
export type UpdateUserRequest = Static<typeof UpdateUserRequestSchema>;
export type UpdateUserResponse = Static<typeof UpdateUserResponseSchema>;
export type DeleteUserResponse = Static<typeof DeleteUserResponseSchema>;
export type ChangeUserPasswordRequest = Static<
  typeof ChangeUserPasswordRequestSchema
>;
export type SelfPasswordChangeRequest = Static<
  typeof SelfPasswordChangeRequestSchema
>;
// Profile types
export type UserProfile = Static<typeof UserProfileSchema>;
export type GetProfileResponse = Static<typeof GetProfileResponseSchema>;
export type UpdateProfileRequest = Static<typeof UpdateProfileRequestSchema>;
export type UpdateProfileResponse = Static<typeof UpdateProfileResponseSchema>;
export type Role = Static<typeof RoleSchema>;
export type ListRolesResponse = Static<typeof ListRolesResponseSchema>;

// Bulk operation types
export type BulkUserIdsRequest = Static<typeof BulkUserIdsRequestSchema>;
export type BulkStatusChangeRequest = Static<
  typeof BulkStatusChangeRequestSchema
>;
export type BulkRoleChangeRequest = Static<typeof BulkRoleChangeRequestSchema>;
export type BulkOperationResponse = Static<typeof BulkOperationResponseSchema>;
export type BulkOperationResult = Static<typeof BulkOperationResultSchema>;
