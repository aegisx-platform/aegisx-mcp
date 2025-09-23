// Re-export types from schemas for convenience
export {
  type Themes,
  type CreateThemes,
  type UpdateThemes,
  type ThemesIdParam,
  type GetThemesQuery,
  type ListThemesQuery
} from './themes.schemas';

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


// Database entity type (matches database table structure exactly)
export interface ThemesEntity {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  preview_image_url: string | null;
  color_palette: Record&lt;string, any&gt; | null;
  css_variables: Record&lt;string, any&gt; | null;
  is_active: boolean | null;
  is_default: boolean | null;
  sort_order: number | null;
  created_at: Date;
  updated_at: Date;
}