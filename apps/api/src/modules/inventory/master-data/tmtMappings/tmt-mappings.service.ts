import { BaseService } from '../../../../shared/services/base.service';
import { TmtMappingsRepository } from './tmt-mappings.repository';
import {
  type TmtMappings,
  type CreateTmtMappings,
  type UpdateTmtMappings,
  type GetTmtMappingsQuery,
  type ListTmtMappingsQuery,
} from './tmt-mappings.types';

/**
 * TmtMappings Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class TmtMappingsService extends BaseService<
  TmtMappings,
  CreateTmtMappings,
  UpdateTmtMappings
> {
  constructor(private tmtMappingsRepository: TmtMappingsRepository) {
    super(tmtMappingsRepository);
  }

  /**
   * Get tmtMappings by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetTmtMappingsQuery = {},
  ): Promise<TmtMappings | null> {
    const tmtMappings = await this.getById(id);

    if (tmtMappings) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return tmtMappings;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListTmtMappingsQuery = {}): Promise<{
    data: TmtMappings[];
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
   * Create new tmtMappings
   */
  async create(data: CreateTmtMappings): Promise<TmtMappings> {
    const tmtMappings = await super.create(data);

    return tmtMappings;
  }

  /**
   * Update existing tmtMappings
   */
  async update(
    id: string | number,
    data: UpdateTmtMappings,
  ): Promise<TmtMappings | null> {
    const tmtMappings = await super.update(id, data);

    return tmtMappings;
  }

  /**
   * Delete tmtMappings
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete tmtMappings with ID:', id);

      // Check if tmtMappings exists first
      const existing = await this.tmtMappingsRepository.findById(id);
      if (!existing) {
        console.log('TmtMappings not found for deletion:', id);
        return false;
      }

      console.log('Found tmtMappings to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.tmtMappingsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('TmtMappings deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting tmtMappings:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating tmtMappings
   */
  protected async validateCreate(data: CreateTmtMappings): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateTmtMappings,
  ): Promise<CreateTmtMappings> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after tmtMappings creation
   */
  protected async afterCreate(
    tmtMappings: TmtMappings,
    _originalData: CreateTmtMappings,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'TmtMappings created:',
      JSON.stringify(tmtMappings),
      '(ID: ' + tmtMappings.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: TmtMappings,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
