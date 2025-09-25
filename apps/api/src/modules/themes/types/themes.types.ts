// Import and re-export types from schemas for convenience
import {
  type Themes,
  type CreateThemes,
  type UpdateThemes,
  type ThemesIdParam,
  type GetThemesQuery,
  type ListThemesQuery,
  type ThemesCreatedEvent,
  type ThemesUpdatedEvent,
  type ThemesDeletedEvent
} from '../schemas/themes.schemas';

export {
  type Themes,
  type CreateThemes,
  type UpdateThemes,
  type ThemesIdParam,
  type GetThemesQuery,
  type ListThemesQuery,
  type ThemesCreatedEvent,
  type ThemesUpdatedEvent,
  type ThemesDeletedEvent
};

// Additional type definitions
export interface ThemesRepository {
  create(data: CreateThemes): Promise<Themes>;
  findById(id: number | string): Promise<Themes | null>;
  findMany(query: ListThemesQuery): Promise<{
    data: Themes[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateThemes): Promise<Themes | null>;
  delete(id: number | string): Promise<boolean>;
}

// Real-time event type definitions
export interface ThemesEventHandlers {
  onCreated?: (data: Themes) => void | Promise<void>;
  onUpdated?: (data: Themes) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface ThemesWebSocketSubscription {
  subscribe(handlers: ThemesEventHandlers): void;
  unsubscribe(): void;
}

// Database entity type (matches database table structure exactly)
export interface ThemesEntity {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  preview_image_url: string | null;
  color_palette: Record<string, any> | null;
  css_variables: Record<string, any> | null;
  is_active: boolean | null;
  is_default: boolean | null;
  sort_order: number | null;
  created_at: Date;
  updated_at: Date;
}