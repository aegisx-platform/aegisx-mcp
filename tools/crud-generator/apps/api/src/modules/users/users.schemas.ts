import { Type, Static } from '@sinclair/typebox';
import { 
  UuidParamSchema, 
  PaginationQuerySchema, 
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema 
} from '../../schemas/base.schemas';

// Base Users Schema
export const UsersSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String(),
  username: Type.String(),
  password: Type.String(),
  first_name: Type.Optional(Type.String()),
  last_name: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  last_login_at: Type.Optional(Type.String({ format: "date-time" })),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" }),
  avatar_url: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
  email_verified: Type.Optional(Type.Boolean()),
  email_verified_at: Type.Optional(Type.String({ format: "date-time" })),
  two_factor_enabled: Type.Optional(Type.Boolean()),
  two_factor_secret: Type.Optional(Type.String()),
  two_factor_backup_codes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  deleted_at: Type.Optional(Type.String({ format: "date-time" })),
  bio: Type.Optional(Type.String()),
  timezone: Type.Optional(Type.String()),
  language: Type.Optional(Type.String()),
  date_of_birth: Type.Optional(Type.String({ format: "date" })),
  phone: Type.Optional(Type.String()),
  deletion_reason: Type.Optional(Type.String()),
  recovery_deadline: Type.Optional(Type.String({ format: "date-time" })),
  deleted_by_ip: Type.Optional(Type.String()),
  deleted_by_user_agent: Type.Optional(Type.String())
});

// Create Schema (without auto-generated fields)
export const CreateUsersSchema = Type.Object({
  email: Type.String(),
  username: Type.String(),
  password: Type.String(),
  first_name: Type.Optional(Type.String()),
  last_name: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  last_login_at: Type.Optional(Type.String({ format: "date-time" })),
  avatar_url: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
  email_verified: Type.Optional(Type.Boolean()),
  email_verified_at: Type.Optional(Type.String({ format: "date-time" })),
  two_factor_enabled: Type.Optional(Type.Boolean()),
  two_factor_secret: Type.Optional(Type.String()),
  two_factor_backup_codes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  deleted_at: Type.Optional(Type.String({ format: "date-time" })),
  bio: Type.Optional(Type.String()),
  timezone: Type.Optional(Type.String()),
  language: Type.Optional(Type.String()),
  date_of_birth: Type.Optional(Type.String({ format: "date" })),
  phone: Type.Optional(Type.String()),
  deletion_reason: Type.Optional(Type.String()),
  recovery_deadline: Type.Optional(Type.String({ format: "date-time" })),
  deleted_by_ip: Type.Optional(Type.String()),
  deleted_by_user_agent: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateUsersSchema = Type.Partial(
  Type.Object({
    email: Type.String(),
    username: Type.String(),
    password: Type.String(),
    first_name: Type.Optional(Type.String()),
    last_name: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
    last_login_at: Type.Optional(Type.String({ format: "date-time" })),
    avatar_url: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    email_verified: Type.Optional(Type.Boolean()),
    email_verified_at: Type.Optional(Type.String({ format: "date-time" })),
    two_factor_enabled: Type.Optional(Type.Boolean()),
    two_factor_secret: Type.Optional(Type.String()),
    two_factor_backup_codes: Type.Optional(Type.Record(Type.String(), Type.Any())),
    deleted_at: Type.Optional(Type.String({ format: "date-time" })),
    bio: Type.Optional(Type.String()),
    timezone: Type.Optional(Type.String()),
    language: Type.Optional(Type.String()),
    date_of_birth: Type.Optional(Type.String({ format: "date" })),
    phone: Type.Optional(Type.String()),
    deletion_reason: Type.Optional(Type.String()),
    recovery_deadline: Type.Optional(Type.String({ format: "date-time" })),
    deleted_by_ip: Type.Optional(Type.String()),
    deleted_by_user_agent: Type.Optional(Type.String()),
  })
);

// ID Parameter Schema
export const UsersIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()])
});

// Query Schemas
export const GetUsersQuerySchema = Type.Object({
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ]))
});

export const ListUsersQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sort: Type.Optional(Type.String()),
  order: Type.Optional(Type.Union([
    Type.Literal('asc'), 
    Type.Literal('desc')
  ], { default: 'asc' })),
  
  // Search and filtering
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  
  // Include related data
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ])),
  
  // Add column-specific filters dynamically
  email: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  username: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  password: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  first_name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  last_name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  is_active: Type.Optional(Type.Boolean()),
  avatar_url: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  status: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  email_verified: Type.Optional(Type.Boolean()),
  two_factor_enabled: Type.Optional(Type.Boolean()),
  two_factor_secret: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  bio: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  timezone: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  language: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  phone: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  deletion_reason: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  deleted_by_ip: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  deleted_by_user_agent: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
});

// Response Schemas using base wrappers
export const UsersResponseSchema = ApiSuccessResponseSchema(UsersSchema);
export const UsersListResponseSchema = PaginatedResponseSchema(UsersSchema);

// Export types
export type Users = Static<typeof UsersSchema>;
export type CreateUsers = Static<typeof CreateUsersSchema>;
export type UpdateUsers = Static<typeof UpdateUsersSchema>;
export type UsersIdParam = Static<typeof UsersIdParamSchema>;
export type GetUsersQuery = Static<typeof GetUsersQuerySchema>;
export type ListUsersQuery = Static<typeof ListUsersQuerySchema>;

