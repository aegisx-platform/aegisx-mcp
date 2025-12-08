import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateBudgetCategories,
  type UpdateBudgetCategories,
  type BudgetCategories,
  type GetBudgetCategoriesQuery,
  type ListBudgetCategoriesQuery,
  type BudgetCategoriesEntity,
} from './budget-categories.types';

export interface BudgetCategoriesListQuery extends BaseListQuery {
  // Smart field-based filters for BudgetCategories
  category_code?: string;
  category_name?: string;
  accounting_code?: string;
  description?: string;
  is_active?: boolean;
}

export class BudgetCategoriesRepository extends BaseRepository<
  BudgetCategories,
  CreateBudgetCategories,
  UpdateBudgetCategories
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.budget_categories',
      [
        // Define searchable fields based on intelligent detection
        'inventory.budget_categories.category_name',
        'inventory.budget_categories.description',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: true,
        hasCreatedBy: false,
        hasUpdatedBy: false,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): BudgetCategories {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      category_code: dbRow.category_code,
      category_name: dbRow.category_name,
      accounting_code: dbRow.accounting_code,
      description: dbRow.description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateBudgetCategories | UpdateBudgetCategories,
  ): Partial<BudgetCategoriesEntity> {
    const transformed: Partial<BudgetCategoriesEntity> = {};

    if ('category_code' in dto && dto.category_code !== undefined) {
      transformed.category_code = dto.category_code;
    }
    if ('category_name' in dto && dto.category_name !== undefined) {
      transformed.category_name = dto.category_name;
    }
    if ('accounting_code' in dto && dto.accounting_code !== undefined) {
      transformed.accounting_code = dto.accounting_code;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.budget_categories').select(
      'inventory.budget_categories.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.budget_categories.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: BudgetCategoriesListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific BudgetCategories filters based on intelligent field categorization
    if (filters.category_code !== undefined) {
      query.where(
        'inventory.budget_categories.category_code',
        filters.category_code,
      );
    }
    if (filters.category_name !== undefined) {
      query.where(
        'inventory.budget_categories.category_name',
        filters.category_name,
      );
    }
    if (filters.accounting_code !== undefined) {
      query.where(
        'inventory.budget_categories.accounting_code',
        filters.accounting_code,
      );
    }
    if (filters.description !== undefined) {
      query.where(
        'inventory.budget_categories.description',
        filters.description,
      );
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.budget_categories.is_active', filters.is_active);
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
      id: 'inventory.budget_categories.id',
      categoryCode: 'inventory.budget_categories.category_code',
      categoryName: 'inventory.budget_categories.category_name',
      accountingCode: 'inventory.budget_categories.accounting_code',
      description: 'inventory.budget_categories.description',
      isActive: 'inventory.budget_categories.is_active',
      createdAt: 'inventory.budget_categories.created_at',
      updatedAt: 'inventory.budget_categories.updated_at',
    };

    return sortFields[sortBy] || 'inventory.budget_categories.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetBudgetCategoriesQuery = {},
  ): Promise<BudgetCategories | null> {
    let query = this.getJoinQuery();
    query = query.where('budget_categories.id', id);

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
    query: BudgetCategoriesListQuery = {},
  ): Promise<PaginatedListResult<BudgetCategories>> {
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

    // Check budgets references
    const budgetsCount = await this.knex('budgets')
      .where('budget_category_id', id)
      .count('* as count')
      .first();

    if (parseInt((budgetsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'budgets',
        field: 'budget_category_id',
        count: parseInt((budgetsCount?.count as string) || '0'),
        cascade: false,
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
    const stats: any = await this.knex('inventory.budget_categories')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateBudgetCategories[],
  ): Promise<BudgetCategories[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.budget_categories')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateBudgetCategories,
  ): Promise<BudgetCategories> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.budget_categories')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
