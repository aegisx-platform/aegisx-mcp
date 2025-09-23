// Re-export types from schemas for convenience
export {
  type Notifications,
  type CreateNotifications,
  type UpdateNotifications,
  type NotificationsIdParam,
  type GetNotificationsQuery,
  type ListNotificationsQuery
} from './notifications.schemas';

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


// Database entity type (matches database table structure exactly)
export interface NotificationsEntity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record&lt;string, any&gt; | null;
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