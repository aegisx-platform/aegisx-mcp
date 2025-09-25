import { BaseService } from '../../../shared/services/base.service';
import { ThemesRepository } from '../repositories/themes.repository';
import {
  type Themes,
  type CreateThemes,
  type UpdateThemes,
  type GetThemesQuery,
  type ListThemesQuery
} from '../schemas/themes.types';

/**
 * Themes Service
 * 
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ThemesService extends BaseService<Themes, CreateThemes, UpdateThemes> {

  constructor(
    private themesRepository: ThemesRepository,
    
  ) {
    super(themesRepository);
    
  }

  /**
   * Get themes by ID with optional query parameters
   */
  async findById(id: string | number, options: GetThemesQuery = {}): Promise<Themes | null> {
    const themes = await this.getById(id);
    
    if (themes) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
      
    }

    return themes;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListThemesQuery = {}): Promise<{
    data: Themes[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.getList(options);
    
    
    return result;
  }

  /**
   * Create new themes
   */
  async create(data: CreateThemes): Promise<Themes> {
    const themes = await super.create(data);
    
    
    return themes;
  }

  /**
   * Update existing themes
   */
  async update(id: string | number, data: UpdateThemes): Promise<Themes | null> {
    const themes = await super.update(id, data);
    
    
    return themes;
  }

  /**
   * Delete themes
   */
  async delete(id: string | number): Promise<boolean> {
    // Get entity before deletion for event emission
    const themes = await this.getById(id);
    
    const deleted = await super.delete(id);
    
    
    return deleted;
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating themes
   */
  protected async validateCreate(data: CreateThemes): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateThemes): Promise<CreateThemes> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after themes creation
   */
  protected async afterCreate(themes: Themes, _originalData: CreateThemes): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log('Themes created:', JSON.stringify(themes), '(ID: ' + themes.id + ')');
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(_id: string | number, existing: Themes): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
  }
}