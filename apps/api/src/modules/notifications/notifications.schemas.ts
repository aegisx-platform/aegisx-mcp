import { Type, Static } from '@sinclair/typebox';
import { 
  UuidParamSchema, 
  PaginationQuerySchema, 
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema 
} from '../../schemas/base.schemas';

// Base Notifications Schema
export const NotificationsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  user_id: Type.String({ format: "uuid" }),
  type: Type.String(),
  title: Type.String(),
  message: Type.String(),
  data: Type.Optional(Type.Record(Type.String(), Type.Any())),
  action_url: Type.Optional(Type.String()),
  read: Type.Optional(Type.Boolean()),
  read_at: Type.Optional(Type.String({ format: "date-time" })),
  archived: Type.Optional(Type.Boolean()),
  archived_at: Type.Optional(Type.String({ format: "date-time" })),
  priority: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: "date-time" })),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" })
});

// Create Schema (without auto-generated fields)
export const CreateNotificationsSchema = Type.Object({
  user_id: Type.String({ format: "uuid" }),
  type: Type.String(),
  title: Type.String(),
  message: Type.String(),
  data: Type.Optional(Type.Record(Type.String(), Type.Any())),
  action_url: Type.Optional(Type.String()),
  read: Type.Optional(Type.Boolean()),
  read_at: Type.Optional(Type.String({ format: "date-time" })),
  archived: Type.Optional(Type.Boolean()),
  archived_at: Type.Optional(Type.String({ format: "date-time" })),
  priority: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: "date-time" })),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateNotificationsSchema = Type.Partial(
  Type.Object({
    user_id: Type.String({ format: "uuid" }),
    type: Type.String(),
    title: Type.String(),
    message: Type.String(),
    data: Type.Optional(Type.Record(Type.String(), Type.Any())),
    action_url: Type.Optional(Type.String()),
    read: Type.Optional(Type.Boolean()),
    read_at: Type.Optional(Type.String({ format: "date-time" })),
    archived: Type.Optional(Type.Boolean()),
    archived_at: Type.Optional(Type.String({ format: "date-time" })),
    priority: Type.Optional(Type.String()),
    expires_at: Type.Optional(Type.String({ format: "date-time" })),
  })
);

// ID Parameter Schema
export const NotificationsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()])
});

// Query Schemas
export const GetNotificationsQuerySchema = Type.Object({
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ]))
});

export const ListNotificationsQuerySchema = Type.Object({
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
  user_id: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  type: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  message: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  action_url: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  read: Type.Optional(Type.Boolean()),
  archived: Type.Optional(Type.Boolean()),
  priority: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
});

// Response Schemas using base wrappers
export const NotificationsResponseSchema = ApiSuccessResponseSchema(NotificationsSchema);
export const NotificationsListResponseSchema = PaginatedResponseSchema(NotificationsSchema);

// Export types
export type Notifications = Static<typeof NotificationsSchema>;
export type CreateNotifications = Static<typeof CreateNotificationsSchema>;
export type UpdateNotifications = Static<typeof UpdateNotificationsSchema>;
export type NotificationsIdParam = Static<typeof NotificationsIdParamSchema>;
export type GetNotificationsQuery = Static<typeof GetNotificationsQuerySchema>;
export type ListNotificationsQuery = Static<typeof ListNotificationsQuerySchema>;

// WebSocket Event Schemas
export const NotificationsCreatedEventSchema = Type.Object({
  type: Type.Literal('notifications.created'),
  data: NotificationsSchema
});

export const NotificationsUpdatedEventSchema = Type.Object({
  type: Type.Literal('notifications.updated'),
  data: NotificationsSchema
});

export const NotificationsDeletedEventSchema = Type.Object({
  type: Type.Literal('notifications.deleted'),
  data: Type.Object({
    id: Type.Union([Type.String(), Type.Number()])
  })
});

export type NotificationsCreatedEvent = Static<typeof NotificationsCreatedEventSchema>;
export type NotificationsUpdatedEvent = Static<typeof NotificationsUpdatedEventSchema>;
export type NotificationsDeletedEvent = Static<typeof NotificationsDeletedEventSchema>;
