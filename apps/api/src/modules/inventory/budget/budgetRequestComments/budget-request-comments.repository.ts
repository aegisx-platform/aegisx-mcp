import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateBudgetRequestComments,
  type UpdateBudgetRequestComments,
  type BudgetRequestComments,
  type GetBudgetRequestCommentsQuery,
  type ListBudgetRequestCommentsQuery,
  type BudgetRequestCommentsEntity,
} from './budget-request-comments.types';

export interface BudgetRequestCommentsListQuery extends BaseListQuery {
  // Smart field-based filters for BudgetRequestComments
  budget_request_id?: number;
  budget_request_id_min?: number;
  budget_request_id_max?: number;
  parent_id?: number;
  parent_id_min?: number;
  parent_id_max?: number;
  comment?: string;
  created_by?: string;
}

export class BudgetRequestCommentsRepository extends BaseRepository<
  BudgetRequestComments,
  CreateBudgetRequestComments,
  UpdateBudgetRequestComments
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.budget_request_comments',
      [
        // Define searchable fields based on intelligent detection
        'inventory.budget_request_comments.comment',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: true,
        hasCreatedBy: true,
        hasUpdatedBy: false,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): BudgetRequestComments {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      budget_request_id: dbRow.budget_request_id,
      parent_id: dbRow.parent_id,
      comment: dbRow.comment,
      created_by: dbRow.created_by,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateBudgetRequestComments | UpdateBudgetRequestComments,
  ): Partial<BudgetRequestCommentsEntity> {
    const transformed: Partial<BudgetRequestCommentsEntity> = {};

    if ('budget_request_id' in dto && dto.budget_request_id !== undefined) {
      transformed.budget_request_id = dto.budget_request_id;
    }
    if ('parent_id' in dto && dto.parent_id !== undefined) {
      transformed.parent_id = dto.parent_id;
    }
    if ('comment' in dto && dto.comment !== undefined) {
      transformed.comment = dto.comment;
    }
    if ('created_by' in dto && dto.created_by !== undefined) {
      transformed.created_by = dto.created_by;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.budget_request_comments').select(
      'inventory.budget_request_comments.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.budget_request_comments.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: BudgetRequestCommentsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific BudgetRequestComments filters based on intelligent field categorization
    if (filters.budget_request_id !== undefined) {
      query.where(
        'inventory.budget_request_comments.budget_request_id',
        filters.budget_request_id,
      );
    }
    if (filters.budget_request_id_min !== undefined) {
      query.where(
        'inventory.budget_request_comments.budget_request_id',
        '>=',
        filters.budget_request_id_min,
      );
    }
    if (filters.budget_request_id_max !== undefined) {
      query.where(
        'inventory.budget_request_comments.budget_request_id',
        '<=',
        filters.budget_request_id_max,
      );
    }
    if (filters.parent_id !== undefined) {
      query.where(
        'inventory.budget_request_comments.parent_id',
        filters.parent_id,
      );
    }
    if (filters.parent_id_min !== undefined) {
      query.where(
        'inventory.budget_request_comments.parent_id',
        '>=',
        filters.parent_id_min,
      );
    }
    if (filters.parent_id_max !== undefined) {
      query.where(
        'inventory.budget_request_comments.parent_id',
        '<=',
        filters.parent_id_max,
      );
    }
    if (filters.comment !== undefined) {
      query.where('inventory.budget_request_comments.comment', filters.comment);
    }
    if (filters.created_by !== undefined) {
      query.where(
        'inventory.budget_request_comments.created_by',
        filters.created_by,
      );
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
      id: 'inventory.budget_request_comments.id',
      budgetRequestId: 'inventory.budget_request_comments.budget_request_id',
      parentId: 'inventory.budget_request_comments.parent_id',
      comment: 'inventory.budget_request_comments.comment',
      createdBy: 'inventory.budget_request_comments.created_by',
      createdAt: 'inventory.budget_request_comments.created_at',
      updatedAt: 'inventory.budget_request_comments.updated_at',
    };

    return sortFields[sortBy] || 'inventory.budget_request_comments.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetBudgetRequestCommentsQuery = {},
  ): Promise<BudgetRequestComments | null> {
    let query = this.getJoinQuery();
    query = query.where('budget_request_comments.id', id);

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
  async list(
    query: BudgetRequestCommentsListQuery = {},
  ): Promise<PaginatedListResult<BudgetRequestComments>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  /**
   * Check if record can be deleted
   * Returns foreign key references that would prevent deletion
   */
  async canBeDeleted(id: string | number): Promise<{
    canDelete: boolean;
    blockedBy: Array<{
      table: string;
      field: string;
      count: number;
      cascade: boolean;
    }>;
  }> {
    const blockedBy: Array<{
      table: string;
      field: string;
      count: number;
      cascade: boolean;
    }> = [];

    // Check budget_request_comments references
    const budgetRequestCommentsCount = await this.knex(
      'budget_request_comments',
    )
      .where('parent_id', id)
      .count('* as count')
      .first();

    if (parseInt((budgetRequestCommentsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'budget_request_comments',
        field: 'parent_id',
        count: parseInt((budgetRequestCommentsCount?.count as string) || '0'),
        cascade: true,
      });
    }

    return {
      canDelete:
        blockedBy.length === 0 || blockedBy.every((ref) => ref.cascade),
      blockedBy,
    };
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.budget_request_comments')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateBudgetRequestComments[],
  ): Promise<BudgetRequestComments[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.budget_request_comments')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateBudgetRequestComments,
  ): Promise<BudgetRequestComments> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.budget_request_comments')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
