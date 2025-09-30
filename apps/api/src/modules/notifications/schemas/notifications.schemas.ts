import { Type, Static } from '@sinclair/typebox';
import {
  UuidParamSchema,
  PaginationQuerySchema,
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
  DropdownOptionSchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkStatusSchema,
  StatusToggleSchema,
  StatisticsSchema,
  ValidationRequestSchema,
  UniquenessCheckSchema,
} from '../../../schemas/base.schemas';

// Base Notifications Schema
export const NotificationsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  type: Type.String(),
  title: Type.String(),
  message: Type.String(),
  data: Type.Optional(Type.Record(Type.String(), Type.Any())),
  action_url: Type.Optional(Type.String()),
  read: Type.Optional(Type.Boolean()),
  read_at: Type.Optional(Type.String({ format: 'date-time' })),
  archived: Type.Optional(Type.Boolean()),
  archived_at: Type.Optional(Type.String({ format: 'date-time' })),
  priority: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

// Create Schema (without auto-generated fields)
export const CreateNotificationsSchema = Type.Object({
  user_id: Type.String({ format: 'uuid' }),
  type: Type.String(),
  title: Type.String(),
  message: Type.String(),
  data: Type.Optional(Type.Record(Type.String(), Type.Any())),
  action_url: Type.Optional(Type.String()),
  read: Type.Optional(Type.Boolean()),
  read_at: Type.Optional(Type.String({ format: 'date-time' })),
  archived: Type.Optional(Type.Boolean()),
  archived_at: Type.Optional(Type.String({ format: 'date-time' })),
  priority: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateNotificationsSchema = Type.Partial(
  Type.Object({
    user_id: Type.String({ format: 'uuid' }),
    type: Type.String(),
    title: Type.String(),
    message: Type.String(),
    data: Type.Optional(Type.Record(Type.String(), Type.Any())),
    action_url: Type.Optional(Type.String()),
    read: Type.Optional(Type.Boolean()),
    read_at: Type.Optional(Type.String({ format: 'date-time' })),
    archived: Type.Optional(Type.Boolean()),
    archived_at: Type.Optional(Type.String({ format: 'date-time' })),
    priority: Type.Optional(Type.String()),
    expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  }),
);

// ID Parameter Schema
export const NotificationsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetNotificationsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListNotificationsQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], {
      default: 'desc',
    }),
  ),

  // Search and filtering
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),

  // 🛡️ Secure field selection with validation
  fields: Type.Optional(
    Type.Array(
      Type.String({
        pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', // Only alphanumeric + underscore
        minLength: 1,
        maxLength: 50,
      }),
      {
        minItems: 1,
        maxItems: 20, // Prevent excessive field requests
        description:
          'Specific fields to return. Example: ["id", "title", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  type: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  read: Type.Optional(Type.Boolean()),
  read_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  read_at_max: Type.Optional(Type.String({ format: 'date-time' })),
  archived: Type.Optional(Type.Boolean()),
  archived_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  archived_at_max: Type.Optional(Type.String({ format: 'date-time' })),
  expires_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  expires_at_max: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_max: Type.Optional(Type.String({ format: 'date-time' })),
});

// Response Schemas using base wrappers
export const NotificationsResponseSchema =
  ApiSuccessResponseSchema(NotificationsSchema);
export const NotificationsListResponseSchema =
  PaginatedResponseSchema(NotificationsSchema);

// Partial Schemas for field selection support
export const PartialNotificationsSchema = Type.Partial(NotificationsSchema);
export const FlexibleNotificationsListResponseSchema =
  PartialPaginatedResponseSchema(NotificationsSchema);

// Export types
export type Notifications = Static<typeof NotificationsSchema>;
export type CreateNotifications = Static<typeof CreateNotificationsSchema>;
export type UpdateNotifications = Static<typeof UpdateNotificationsSchema>;
export type NotificationsIdParam = Static<typeof NotificationsIdParamSchema>;
export type GetNotificationsQuery = Static<typeof GetNotificationsQuerySchema>;
export type ListNotificationsQuery = Static<
  typeof ListNotificationsQuerySchema
>;

// Partial types for field selection
export type PartialNotifications = Static<typeof PartialNotificationsSchema>;
export type FlexibleNotificationsList = Static<
  typeof FlexibleNotificationsListResponseSchema
>;
