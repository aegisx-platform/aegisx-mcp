import { BaseService } from '../../../shared/services/base.service';
import { AuthorsRepository } from '../repositories/authors.repository';
import {
  type Authors,
  type CreateAuthors,
  type UpdateAuthors,
  type GetAuthorsQuery,
  type ListAuthorsQuery,
} from '../types/authors.types';

/**
 * Authors Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class AuthorsService extends BaseService<
  Authors,
  CreateAuthors,
  UpdateAuthors
> {
  constructor(private authorsRepository: AuthorsRepository) {
    super(authorsRepository);
  }

  /**
   * Get authors by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetAuthorsQuery = {},
  ): Promise<Authors | null> {
    const authors = await this.getById(id);

    if (authors) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return authors;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListAuthorsQuery = {}): Promise<{
    data: Authors[];
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
   * Create new authors
   */
  async create(data: CreateAuthors): Promise<Authors> {
    const authors = await super.create(data);

    return authors;
  }

  /**
   * Update existing authors
   */
  async update(
    id: string | number,
    data: UpdateAuthors,
  ): Promise<Authors | null> {
    const authors = await super.update(id, data);

    return authors;
  }

  /**
   * Delete authors
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete authors with ID:', id);

      // Check if authors exists first
      const existing = await this.authorsRepository.findById(id);
      if (!existing) {
        console.log('Authors not found for deletion:', id);
        return false;
      }

      console.log('Found authors to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.authorsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Authors deleted successfully:', {
          id,
          name: existing.name,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting authors:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating authors
   */
  protected async validateCreate(data: CreateAuthors): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateAuthors): Promise<CreateAuthors> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after authors creation
   */
  protected async afterCreate(
    authors: Authors,
    _originalData: CreateAuthors,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Authors created:',
      JSON.stringify(authors),
      '(ID: ' + authors.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: Authors,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
  }
}
