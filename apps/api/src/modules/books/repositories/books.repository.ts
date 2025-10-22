import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateBooks,
  type UpdateBooks,
  type Books,
  type GetBooksQuery,
  type ListBooksQuery,
  type BooksEntity,
} from '../types/books.types';

export interface BooksListQuery extends BaseListQuery {
  // Smart field-based filters for Books
  title?: string;
  description?: string;
  author_id?: string;
  isbn?: string;
  pages?: number;
  pages_min?: number;
  pages_max?: number;
  price?: number;
  price_min?: number;
  price_max?: number;
  genre?: string;
  available?: boolean;
}

export class BooksRepository extends BaseRepository<
  Books,
  CreateBooks,
  UpdateBooks
> {
  constructor(knex: Knex) {
    super(knex, 'books', [
      // Define searchable fields based on intelligent detection
      'books.title',
      'books.description',
    ]);
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): Books {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      title: dbRow.title,
      description: dbRow.description,
      author_id: dbRow.author_id,
      isbn: dbRow.isbn,
      pages: dbRow.pages,
      published_date: dbRow.published_date,
      price: dbRow.price,
      genre: dbRow.genre,
      available: dbRow.available,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateBooks | UpdateBooks): Partial<BooksEntity> {
    const transformed: Partial<BooksEntity> = {};

    if ('title' in dto && dto.title !== undefined) {
      transformed.title = dto.title;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('author_id' in dto && dto.author_id !== undefined) {
      transformed.author_id = dto.author_id;
    }
    if ('isbn' in dto && dto.isbn !== undefined) {
      transformed.isbn = dto.isbn;
    }
    if ('pages' in dto && dto.pages !== undefined) {
      transformed.pages = dto.pages;
    }
    if ('published_date' in dto && dto.published_date !== undefined) {
      transformed.published_date =
        typeof dto.published_date === 'string'
          ? new Date(dto.published_date)
          : dto.published_date;
    }
    if ('price' in dto && dto.price !== undefined) {
      transformed.price = dto.price;
    }
    if ('genre' in dto && dto.genre !== undefined) {
      transformed.genre = dto.genre;
    }
    if ('available' in dto && dto.available !== undefined) {
      transformed.available = dto.available;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('books').select('books.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'books.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: BooksListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Books filters based on intelligent field categorization
    if (filters.title !== undefined) {
      query.where('books.title', filters.title);
    }
    if (filters.description !== undefined) {
      query.where('books.description', filters.description);
    }
    if (filters.author_id !== undefined) {
      query.where('books.author_id', filters.author_id);
    }
    if (filters.isbn !== undefined) {
      query.where('books.isbn', filters.isbn);
    }
    if (filters.pages !== undefined) {
      query.where('books.pages', filters.pages);
    }
    if (filters.pages_min !== undefined) {
      query.where('books.pages', '>=', filters.pages_min);
    }
    if (filters.pages_max !== undefined) {
      query.where('books.pages', '<=', filters.pages_max);
    }
    if (filters.price !== undefined) {
      query.where('books.price', filters.price);
    }
    if (filters.price_min !== undefined) {
      query.where('books.price', '>=', filters.price_min);
    }
    if (filters.price_max !== undefined) {
      query.where('books.price', '<=', filters.price_max);
    }
    if (filters.genre !== undefined) {
      query.where('books.genre', filters.genre);
    }
    if (filters.available !== undefined) {
      query.where('books.available', filters.available);
    }
  }

  // Apply multiple sort parsing
  protected applyMultipleSort(query: any, sort?: string): void {
    if (sort) {
      if (sort.includes(',')) {
        // Multiple sort format: field1:desc,field2:asc,field3:desc
        const sortPairs = sort.split(',');
        sortPairs.forEach((pair) => {
          const [field, direction] = pair.split(':');
          const mappedField = this.getSortField(field.trim());
          const sortDirection =
            direction?.trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
          query.orderBy(mappedField, sortDirection);
        });
      } else {
        // Single sort field
        const [field, direction] = sort.split(':');
        const mappedField = this.getSortField(field.trim());
        const sortDirection =
          direction?.trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
        query.orderBy(mappedField, sortDirection);
      }
    } else {
      // Default sort
      query.orderBy(this.getSortField('created_at'), 'desc');
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields: Record<string, string> = {
      id: 'books.id',
      title: 'books.title',
      description: 'books.description',
      authorId: 'books.author_id',
      isbn: 'books.isbn',
      pages: 'books.pages',
      publishedDate: 'books.published_date',
      price: 'books.price',
      genre: 'books.genre',
      available: 'books.available',
      createdAt: 'books.created_at',
      updatedAt: 'books.updated_at',
    };

    return sortFields[sortBy] || 'books.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetBooksQuery = {},
  ): Promise<Books | null> {
    let query = this.getJoinQuery();
    query = query.where('books.id', id);

    // Handle include options
    if (options.include) {
      const includes = Array.isArray(options.include)
        ? options.include
        : [options.include];
      includes.forEach((relation) => {
        // TODO: Add join logic for relationships
        // Example: if (relation === 'category') query.leftJoin('categories', 'items.category_id', 'categories.id');
      });
    }

    const row = await query.first();
    return row ? this.transformToEntity(row) : null;
  }

  // Extended list method with specific query type
  async list(query: BooksListQuery = {}): Promise<PaginatedListResult<Books>> {
    return super.list(query);
  }

  // Business-specific methods for unique/important fields

  async findByTitle(title: string): Promise<Books | null> {
    const query = this.getJoinQuery();
    const row = await query.where('books.title', title).first();
    return row ? this.transformToEntity(row) : null;
  }

  /**
   * Find by unique field: author_id
   * Used for relationship lookups
   */
  async findByAuthorId(authorId: string): Promise<Books[]> {
    const query = this.getJoinQuery();
    const rows = await query.where('books.author_id', authorId);
    return rows.map((row) => this.transformToEntity(row));
  }

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  /**
   * Find by unique field: isbn
   * Used for duplicate detection before insert/update
   */
  async findByIsbn(isbn: string | number): Promise<Books | null> {
    const query = this.getJoinQuery();
    const row = await query.where('books.isbn', isbn).first();
    return row ? this.transformToEntity(row) : null;
  }

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('books')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateBooks[]): Promise<Books[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('books')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateBooks): Promise<Books> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('books').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}
