// Import and re-export types from schemas for convenience
import {
  type SystemSettings,
  type CreateSystemSettings,
  type UpdateSystemSettings,
  type SystemSettingsIdParam,
  type GetSystemSettingsQuery,
  type ListSystemSettingsQuery,
  type SystemSettingsCreatedEvent,
  type SystemSettingsUpdatedEvent,
  type SystemSettingsDeletedEvent
} from './systemSettings.schemas';

export {
  type SystemSettings,
  type CreateSystemSettings,
  type UpdateSystemSettings,
  type SystemSettingsIdParam,
  type GetSystemSettingsQuery,
  type ListSystemSettingsQuery,
  type SystemSettingsCreatedEvent,
  type SystemSettingsUpdatedEvent,
  type SystemSettingsDeletedEvent
};

// Additional type definitions
export interface SystemSettingsRepository {
  create(data: CreateSystemSettings): Promise<SystemSettings>;
  findById(id: number | string): Promise<SystemSettings | null>;
  findMany(query: ListSystemSettingsQuery): Promise<{
    data: SystemSettings[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateSystemSettings): Promise<SystemSettings | null>;
  delete(id: number | string): Promise<boolean>;
}

// Real-time event type definitions
export interface SystemSettingsEventHandlers {
  onCreated?: (data: SystemSettings) => void | Promise<void>;
  onUpdated?: (data: SystemSettings) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface SystemSettingsWebSocketSubscription {
  subscribe(handlers: SystemSettingsEventHandlers): void;
  unsubscribe(): void;
}

// Database entity type (matches database table structure exactly)
export interface SystemSettingsEntity {
  id: string;
  category: string;
  key: string;
  value: string;
  data_type: string | null;
  description: string | null;
  is_public: boolean | null;
  requires_restart: boolean | null;
  created_at: Date;
  updated_at: Date;
}