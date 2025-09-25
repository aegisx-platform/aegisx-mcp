import { BaseService } from '../../../shared/services/base.service';
import { ThemesRepository } from '../repositories/themes.repository';
import { EventService } from '../../../shared/websocket/event.service';
import { CrudEventHelper } from '../../../shared/websocket/crud-event-helper';
import {
  type Themes,
  type CreateThemes,
  type UpdateThemes,
  type GetThemesQuery,
  type ListThemesQuery
} from '../types/themes.types';

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
  private eventHelper?: CrudEventHelper;

  constructor(
    private themesRepository: ThemesRepository,
    private eventService?: EventService
  ) {
    super(themesRepository);
    
    // Initialize event helper using Fastify pattern
    if (eventService) {
      this.eventHelper = eventService.for('themes', 'themes');
    }
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
      
      // Emit read event for monitoring/analytics
      if (this.eventHelper) {
        await this.eventHelper.emitCustom('read', themes);
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
    
    // Emit bulk read event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('bulk_read', {
        count: result.data.length,
        filters: options
      });
    }
    
    return result;
  }

  /**
   * Create new themes
   */
  async create(data: CreateThemes): Promise<Themes> {
    const themes = await super.create(data);
    
    // Emit created event for real-time updates
    if (this.eventHelper) {
      await this.eventHelper.emitCreated(themes);
    }
    
    return themes;
  }

  /**
   * Update existing themes
   */
  async update(id: string | number, data: UpdateThemes): Promise<Themes | null> {
    const themes = await super.update(id, data);
    
    if (themes && this.eventHelper) {
      await this.eventHelper.emitUpdated(themes);
    }
    
    return themes;
  }

  /**
   * Delete themes
   */
  async delete(id: string | number): Promise<boolean> {
    // Get entity before deletion for event emission
    const themes = await this.getById(id);
    
    const deleted = await super.delete(id);
    
    if (deleted && themes && this.eventHelper) {
      await this.eventHelper.emitDeleted(themes.id);
    }
    
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