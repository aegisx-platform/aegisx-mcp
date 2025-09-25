// Import and re-export types from schemas for convenience
import {
  type Notifications,
  type CreateNotifications,
  type UpdateNotifications,
  type NotificationsIdParam,
  type GetNotificationsQuery,
  type ListNotificationsQuery,
  type NotificationsCreatedEvent,
  type NotificationsUpdatedEvent,
  type NotificationsDeletedEvent
} from './notifications.schemas';

export {
  type Notifications,
  type CreateNotifications,
  type UpdateNotifications,
  type NotificationsIdParam,
  type GetNotificationsQuery,
  type ListNotificationsQuery,
  type NotificationsCreatedEvent,
  type NotificationsUpdatedEvent,
  type NotificationsDeletedEvent
};

// Additional type definitions
export interface NotificationsRepository {
  create(data: CreateNotifications): Promise<Notifications>;
  findById(id: number | string): Promise<Notifications | null>;
  findMany(query: ListNotificationsQuery): Promise<{
    data: Notifications[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateNotifications): Promise<Notifications | null>;
  delete(id: number | string): Promise<boolean>;
}

// Real-time event type definitions
export interface NotificationsEventHandlers {
  onCreated?: (data: Notifications) => void | Promise<void>;
  onUpdated?: (data: Notifications) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface NotificationsWebSocketSubscription {
  subscribe(handlers: NotificationsEventHandlers): void;
  unsubscribe(): void;
}

// Database entity type (matches database table structure exactly)
export interface NotificationsEntity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  action_url: string | null;
  read: boolean | null;
  read_at: Date | null;
  archived: boolean | null;
  archived_at: Date | null;
  priority: string | null;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}