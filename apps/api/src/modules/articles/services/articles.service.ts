import { BaseService } from '../../../shared/services/base.service';
import { ArticlesRepository } from '../repositories/articles.repository';
import {
  type Articles,
  type CreateArticles,
  type UpdateArticles,
  type GetArticlesQuery,
  type ListArticlesQuery,
} from '../types/articles.types';

/**
 * Articles Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ArticlesService extends BaseService<
  Articles,
  CreateArticles,
  UpdateArticles
> {
  constructor(private articlesRepository: ArticlesRepository) {
    super(articlesRepository);
  }

  /**
   * Get articles by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetArticlesQuery = {},
  ): Promise<Articles | null> {
    const articles = await this.getById(id);

    if (articles) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return articles;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListArticlesQuery = {}): Promise<{
    data: Articles[];
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
   * Create new articles
   */
  async create(data: CreateArticles): Promise<Articles> {
    const articles = await super.create(data);

    return articles;
  }

  /**
   * Update existing articles
   */
  async update(
    id: string | number,
    data: UpdateArticles,
  ): Promise<Articles | null> {
    const articles = await super.update(id, data);

    return articles;
  }

  /**
   * Delete articles
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete articles with ID:', id);

      // Check if articles exists first
      const existing = await this.articlesRepository.findById(id);
      if (!existing) {
        console.log('Articles not found for deletion:', id);
        return false;
      }

      console.log('Found articles to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.articlesRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Articles deleted successfully:', {
          id,
          name: existing.title,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting articles:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating articles
   */
  protected async validateCreate(data: CreateArticles): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateArticles): Promise<CreateArticles> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after articles creation
   */
  protected async afterCreate(
    articles: Articles,
    _originalData: CreateArticles,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Articles created:',
      JSON.stringify(articles),
      '(ID: ' + articles.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: Articles,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
  }
}
